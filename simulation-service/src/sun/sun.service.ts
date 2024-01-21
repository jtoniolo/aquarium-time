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
      highLightRatio: 1 / 3,
      sunriseOffset: 0,
      durationMultiplier: 1,
    });

    // Publishes the simulated sun data to a MQTT topic
    this.mqtt.publish(process.env.MQTT_TOPIC, JSON.stringify(simulatedSun));
    console.log(simulatedSun);
  }

  getDistributionData(): DistribuitonData[] {
    const data: DistribuitonData[] = [];

    const settings: SunConfig = {
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
      highLightRatio: 1 / 3,
      sunriseOffset: 0,
      durationMultiplier: 1,
    };

    for (
      let minute = settings.sunRiseTime.hour * 60;
      minute < (settings.sunRiseTime.hour + settings.sunDuration.hour) * 60;
      minute += 10
    ) {
      const time = new Date();
      time.setHours(0, minute, 0, 0); // Set the time to the current minute of the day
      const solarSimulation = this.getSolarSimulation(time, settings);

      data.push({
        time: time.toLocaleString(),
        brightness: solarSimulation.brightness,
        red: solarSimulation.rgbw.red,
        green: solarSimulation.rgbw.green,
        blue: solarSimulation.rgbw.blue,
        white: solarSimulation.rgbw.white,
      }); // Use toFixed to limit the number of decimal places
    }
    return data;
  }

  // This method converts a UTC date to a specific timezone
  private convertUtcToTimezone(date: Date): Date {
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
  private getSolarSimulation(time: Date, settings: SunConfig): SimulatedSun {
    // Create a new instance of SimulatedSun
    const simulatedSun = new SimulatedSun();

    // Convert the current time and sunrise time to seconds
    const timeInSeconds = this.getTimeInSeconds(Time.fromDate(time));
    const sunriseTimeInSeconds = this.getTimeInSeconds(settings.sunRiseTime);

    // Convert the duration of the sun to seconds
    const durationInSeconds = this.getTimeInSeconds(settings.sunDuration);

    // If the time is outside of the sunrise time and duration, turn off the simulated sun
    simulatedSun.on =
      timeInSeconds >= sunriseTimeInSeconds &&
      timeInSeconds <= sunriseTimeInSeconds + durationInSeconds;

    // If the simulated sun is off, return the simulatedSun instance
    if (!simulatedSun.on) return simulatedSun;

    // Calculate the brightness factor based on the time since sunrise
    const brightnessFactor = this.getBrightnessFactor(
      sunriseTimeInSeconds,
      durationInSeconds,
      timeInSeconds,
      settings.highLightRatio,
    );

    // Calculate the brightness and RGBW values based on the time since sunrise
    const brightness = Math.round((brightnessFactor / 255) * 100);
    const rgbw = this.getRGBW(
      brightnessFactor,
      timeInSeconds,
      sunriseTimeInSeconds,
      durationInSeconds,
    );

    // Assign the calculated brightness and RGBW values to the simulatedSun instance
    simulatedSun.brightness = Math.round(brightness); // brightness needs to be an integer between 0 and 100.
    simulatedSun.rgbw = rgbw;

    // Return the simulatedSun instance

    return simulatedSun;
  }

  private getBrightnessFactor(
    startTime: number,
    duration: number,
    currentTime: number,
    middleFactor: number = 1 / 3,
  ): number {
    const totalSeconds = duration;
    const middleDuration = totalSeconds * middleFactor;
    const otherDuration = (totalSeconds - middleDuration) / 2;

    const firstPartEnd = startTime + otherDuration;
    const secondPartEnd = firstPartEnd + middleDuration;

    let x;
    let brightness;

    if (currentTime <= firstPartEnd) {
      // First part of the day, use cubic function
      x = (currentTime - startTime) / otherDuration;
      brightness = Math.pow(x, 3) * (255 * middleFactor);
    } else if (currentTime <= secondPartEnd) {
      // Middle part of the day, use parabolic function
      x = (2 * (currentTime - firstPartEnd)) / middleDuration - 1;
      brightness =
        (1 - Math.pow(x, 2)) * (255 - 255 * middleFactor) + 255 * middleFactor;
    } else {
      // Last part of the day, use mirror of cubic function
      x = 1 - (currentTime - secondPartEnd) / otherDuration;
      brightness = Math.pow(x, 3) * (255 * middleFactor);
    }

    const factor = Math.max(Math.min(Math.round(brightness), 255), 0);

    return factor;
  }

  getRGBW(brightnessFactor, currentTime, startTime, duration) {
    const rgbw = new RGBW();

    const totalSeconds = duration * 3600;
    const middleDuration = totalSeconds / 3; // middle third of the day
    const otherDuration = (totalSeconds - middleDuration) / 2;

    const firstPartEnd = startTime + otherDuration;
    const secondPartEnd = firstPartEnd + middleDuration;

    let red, green, blue;

    if (currentTime <= firstPartEnd || currentTime > secondPartEnd) {
      // Morning or evening, more red/orange
      red = brightnessFactor;
      green = (200 / 255) * brightnessFactor;
      blue = (50 / 255) * brightnessFactor;
    } else {
      // Middle of the day, normal color
      red = brightnessFactor;
      green = brightnessFactor;
      blue = brightnessFactor;
    }

    const white = brightnessFactor;

    rgbw.red = Math.round(red);
    rgbw.green = Math.round(green);
    rgbw.blue = Math.round(blue);
    rgbw.white = Math.round(white);

    return rgbw;
  }

  /**
   * This method calculates the RGBW (Red, Green, Blue, White) values based on the brightness.
   * RGBW values are between 0 and 255. W = 1 to 5 is twilight, W = 255 is full sun.
   *
   * @param timeSinceSunriseInHoursWithOffsetAndMultiplier The time since sunrise in hours with offset and multiplier.
   * @param durationInHours The duration of the sun in hours.
   * @param brightness The brightness of the sun.
   */
  getRGBW_old(
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
    const peakBrightnessThreshold = 0.75; // new parameter to fine-tune the curve
    const baseBrightness = 50;
    // Calculate the brightness using the sine function
    const brightness = Math.sin(
      (timeSinceSunriseInHoursWithOffsetAndMultiplier / durationInHours) *
        Math.PI,
    );

    // Map the brightness from [-1, 1] to [0, 75]
    let mappedBrightness = ((brightness + 1) / 2) * baseBrightness; // << -- This line also affects the curve

    // Extend the range to [0, 100] only for the peak brightness values
    if (brightness > peakBrightnessThreshold) {
      mappedBrightness =
        ((brightness - peakBrightnessThreshold) /
          (1 - peakBrightnessThreshold)) *
          25 +
        75;
    }

    // Return the mapped brightness
    return mappedBrightness;
  }

  /**
   * This method converts a time to seconds.
   *
   * @param time The time to convert.
   */
  private getTimeInSeconds(time: Time): number {
    // Convert the time to seconds
    return time.hour * 3600 + time.minute * 60 + time.second;
  }
}

export interface DistribuitonData {
  time: string;
  brightness: number;
  red: number;
  green: number;
  blue: number;
  white: number;
}

/***
     * Keeping this here for now. This is for the Home Assistant automation.
     *   rgbw_color:
    - "{{ trigger.payload_json.rgbw.red }}"
    - "{{ trigger.payload_json.rgbw.green }}"
    - "{{ trigger.payload_json.rgbw.blue }}"
    - "{{ trigger.payload_json.rgbw.white }}"
     */
