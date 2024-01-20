import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RGBW, SimulatedSun, SunConfig, Time } from './sun.model';
import { MqttService } from 'src/mqtt/mqtt.service';

// This is a service class for handling sun related operations
@Injectable()
export class SunService {
  // Logger instance for logging
  private readonly logger = new Logger(SunService.name);

  // MqttService is injected via constructor
  constructor(private mqtt: MqttService) {}

  // This method is scheduled to run every minute
  @Cron(CronExpression.EVERY_MINUTE)
  handleCron() {
    // Logs that the cron job is running
    this.logger.log('cron job running');
    this.logger.debug('Called when the current second is 0');

    // Converts the current date to a specific timezone
    const date = this.convertUtcToTimezone(new Date());

    // Simulates the sun's brightness and color at a given location and time
    const simulatedSun = this.getSolarSimulation(date, {
      sunRiseTime: {
        hour: 6,
        minute: 0,
        second: 0,
      },
      sunDuration: {
        hour: 16,
        minute: 0,
        second: 0,
      },
      sunriseOffset: 0,
      durationMultiplier: 1,
    });

    // Publishes the simulated sun data to a MQTT topic
    this.mqtt.publish(process.env.MQTT_TOPIC, JSON.stringify(simulatedSun));
    console.log(simulatedSun);
  }

  // This method converts a UTC date to a specific timezone
  convertUtcToTimezone(date: Date): Date {
    const timezone = process.env.TZ ?? 'America/Toronto';
    const utcDate = new Date(date.toUTCString());
    return new Date(utcDate.toLocaleString('en-US', { timeZone: timezone }));
  }

  /**
   * This method simulates the sun's brightness and color at a given location and time.
   * It's not meant to be an accurate simulation, but rather a close enough to use for Aquarium lighting.
   * Brightness is a value between 0 and 100, in percent. 0 is twilight, 100 is full sun.
   * RGBW values are between 0 and 255. W = 1 to 5 is twilight, W = 255 is full sun.
   *
   * @param time The time to simulate the sun's position.
   * @param settings The settings to use for the simulation.
   */
  getSolarSimulation(time: Date, settings: SunConfig): SimulatedSun {
    // Log the current date
    this.logger.log(`Date: ${time.toISOString()}`);

    // Create a new instance of SimulatedSun
    const simulatedSun = new SimulatedSun();

    // Convert the current time and sunrise time to seconds
    const timeInSeconds = this.getTimeInSeconds(Time.fromDate(time));
    const sunriseTimeInSeconds = this.getTimeInSeconds(settings.sunRiseTime);

    // Convert the duration of the sun to seconds
    const durationInSeconds = this.getTimeInSeconds(settings.sunDuration);

    // Calculate the time since sunrise in seconds, minutes, and hours
    const timeSinceSunrise = timeInSeconds - sunriseTimeInSeconds;
    const timeSinceSunriseInMinutes = timeSinceSunrise / 60;
    const timeSinceSunriseInHours = timeSinceSunriseInMinutes / 60;

    // Convert the duration of the sun to minutes and hours
    const durationInMinutes = durationInSeconds / 60;
    const durationInHours = durationInMinutes / 60;

    // Adjust the time since sunrise by the sunrise offset and duration multiplier
    const timeSinceSunriseInHoursWithOffset =
      timeSinceSunriseInHours - settings.sunriseOffset;
    const timeSinceSunriseInHoursWithOffsetAndMultiplier =
      timeSinceSunriseInHoursWithOffset * settings.durationMultiplier;

    // Calculate the brightness and RGBW values based on the time since sunrise
    const brightness = this.getBrightness(
      timeSinceSunriseInHoursWithOffsetAndMultiplier,
      durationInHours,
    );
    const rgbw = this.getRGBW(
      timeSinceSunriseInHoursWithOffsetAndMultiplier,
      durationInHours,
      brightness / 100,
    );

    // Assign the calculated brightness and RGBW values to the simulatedSun instance
    simulatedSun.brightness = Math.round(brightness); // brightness needs to be an integer between 0 and 100.
    simulatedSun.rgbw = rgbw;

    // Return the simulatedSun instance
    return simulatedSun;
  }

  /**
   * This method calculates the RGBW (Red, Green, Blue, White) values based on the brightness.
   * RGBW values are between 0 and 255. W = 1 to 5 is twilight, W = 255 is full sun.
   *
   * @param timeSinceSunriseInHoursWithOffsetAndMultiplier The time since sunrise in hours with offset and multiplier.
   * @param durationInHours The duration of the sun in hours.
   * @param brightness The brightness of the sun.
   */
  getRGBW(
    timeSinceSunriseInHoursWithOffsetAndMultiplier: number,
    durationInHours: number,
    brightness: number,
  ) {
    // Create a new instance of RGBW
    const rgbw = new RGBW();

    // Calculate the RGBW values based on the brightness
    const red = 255 * brightness;
    const green = 255 * brightness;
    const blue = 255 * brightness;
    const white = 255 * brightness;

    // Assign the calculated RGBW values to the rgbw instance
    rgbw.red = Math.round(red);
    rgbw.green = Math.round(green);
    rgbw.blue = Math.round(blue);
    rgbw.white = Math.round(white);

    // Return the rgbw instance
    return rgbw;
  }

  /**
   * This method calculates the brightness of the sun based on the time since sunrise and the duration of the sun.
   * Brightness is a value between 0 and 100, in percent. 0 is twilight, 100 is full sun.
   *
   * @param timeSinceSunriseInHoursWithOffsetAndMultiplier The time since sunrise in hours with offset and multiplier.
   * @param durationInHours The duration of the sun in hours.
   */
  getBrightness(
    timeSinceSunriseInHoursWithOffsetAndMultiplier: number,
    durationInHours: number,
  ) {
    // Calculate the brightness using the sine function
    const brightness = Math.sin(
      (timeSinceSunriseInHoursWithOffsetAndMultiplier / durationInHours) *
        Math.PI,
    );

    // Map the brightness from [-1, 1] to [0, 100]
    const mappedBrightness = ((brightness + 1) / 2) * 100;

    // Return the mapped brightness
    return mappedBrightness;
  }

  /**
   * This method converts a time to seconds.
   *
   * @param time The time to convert.
   */
  getTimeInSeconds(time: Time): number {
    // Convert the time to seconds
    return time.hour * 3600 + time.minute * 60 + time.second;
  }
}
/***
     * Keeping this here for now. This is for the Home Assistant automation.
     *   rgbw_color:
    - "{{ trigger.payload_json.rgbw.red }}"
    - "{{ trigger.payload_json.rgbw.green }}"
    - "{{ trigger.payload_json.rgbw.blue }}"
    - "{{ trigger.payload_json.rgbw.white }}"
     */
