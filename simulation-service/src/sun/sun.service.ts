import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  RGBW,
  SimulatedSun,
  EnhancedSimulatedSun,
  SunConfig,
  Time,
} from './sun.model';
import { MqttService } from 'src/mqtt/mqtt.service';
import { SunGateway } from 'src/sun/sun.gateway';

// This is a service class for handling sun related operations
@Injectable()
export class SunService {
  // Logger instance for logging
  private readonly logger = new Logger(SunService.name);
  private latestSimulation: SimulatedSun | null = null;
  private latestEnhancedSimulation: EnhancedSimulatedSun | null = null;

  // MqttService and SunGateway are injected via constructor
  constructor(
    private mqtt: MqttService,
    private readonly sunGateway: SunGateway,
  ) {}

  // This method is scheduled to run every minute
  @Cron(CronExpression.EVERY_MINUTE)
  handleCron() {
    // Logs that the cron job is running
    this.logger.log('cron job running');
    this.logger.debug('Called when the current second is 0');

    // Converts the current date to a specific timezone
    const date = this.convertUtcToTimezone(new Date());

    const settings = {
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

    // Simulates the sun's brightness and color at a given location and time
    const simulatedSun = this.getSolarSimulation(date, settings);
    const enhanced = this.calculateSunSimulation(date, settings);

    // Cache the latest simulation (both basic and enhanced)
    this.latestSimulation = simulatedSun;
    this.latestEnhancedSimulation = enhanced;

    // Emit updates through both MQTT and WebSocket
    this.mqtt.publish(process.env.MQTT_TOPIC, JSON.stringify(this.latestSimulation));
    this.sunGateway.emitSunUpdate(this.latestEnhancedSimulation);
  }

  getLatestSimulation(): SimulatedSun | null {
    return this.latestSimulation;
  }

  getLatestEnhancedSimulation(): EnhancedSimulatedSun | null {
    return this.latestEnhancedSimulation;
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

    this.logger.log(
      `Date Conversion: ${date}; UTC Date: ${utcDate}; Timezone: ${timezone}; Converted Date: ${utcDate.toLocaleString('en-US', { timeZone: timezone })}`,
    );
    return new Date(utcDate.toLocaleString('en-US', { timeZone: timezone }));
  }

  /**
   * Core logic for sun simulation calculation that returns a complete EnhancedSimulatedSun
   */
  private calculateSunSimulation(
    time: Date,
    settings: SunConfig,
  ): EnhancedSimulatedSun {
    const timeInSeconds = this.getTimeInSeconds(Time.fromDate(time));
    const sunriseTimeInSeconds = this.getTimeInSeconds(settings.sunRiseTime);
    const durationInSeconds = this.getTimeInSeconds(settings.sunDuration);

    const enhanced = new EnhancedSimulatedSun();

    // If the time is outside of the sunrise time and duration, turn off the simulated sun
    enhanced.on =
      timeInSeconds >= sunriseTimeInSeconds &&
      timeInSeconds <= sunriseTimeInSeconds + durationInSeconds;

    // If the simulated sun is off, return early with defaults
    if (!enhanced.on) {
      enhanced.brightness = 0;
      enhanced.rgbw = new RGBW();
      enhanced.timeOfDay =
        timeInSeconds < sunriseTimeInSeconds ? 'night' : 'night';

      // Calculate night cycle percentage
      const sunsetTimeInSeconds = sunriseTimeInSeconds + durationInSeconds;

      if (timeInSeconds < sunriseTimeInSeconds) {
        // Before sunrise - calculate how close we are to sunrise
        // If current time is just after midnight, we need to consider time since midnight
        // plus the time from sunset yesterday up to midnight
        const timeUntilSunrise = sunriseTimeInSeconds - timeInSeconds;
        const totalNightDuration = 24 * 3600 - durationInSeconds; // Total night duration
        enhanced.cyclePercentage = ((totalNightDuration - timeUntilSunrise) / totalNightDuration) * 100;
      } else {
        // After sunset - calculate progress through the night
        const timeFromSunset = timeInSeconds - sunsetTimeInSeconds;
        const totalNightDuration = 24 * 3600 - durationInSeconds;
        enhanced.cyclePercentage = (timeFromSunset / totalNightDuration) * 100;
      }
      return enhanced;
    }

    // Calculate the brightness factor based on the time since sunrise
    const brightnessFactor = this.getBrightnessFactor(
      sunriseTimeInSeconds,
      durationInSeconds,
      timeInSeconds,
      settings.highLightRatio,
    );

    // Calculate the brightness and RGBW values based on the time since sunrise
    enhanced.brightness = Math.round((brightnessFactor / 255) * 100) || 1; // brightness needs to be at least 1 for the lights to come on
    enhanced.rgbw = this.getRGBW(
      brightnessFactor,
      timeInSeconds,
      sunriseTimeInSeconds,
      durationInSeconds,
    );

    // Calculate time of day and cycle percentage for daytime
    const TRANSITION_DURATION = 3600; // 1 hour transition periods
    const sunsetTimeInSeconds = sunriseTimeInSeconds + durationInSeconds;
    const sunriseEnd = sunriseTimeInSeconds + TRANSITION_DURATION;
    const sunsetStart = sunsetTimeInSeconds - TRANSITION_DURATION;

    if (timeInSeconds <= sunriseEnd) {
      enhanced.timeOfDay = 'sunrise';
      // During sunrise transition - percentage through the 1-hour transition
      enhanced.cyclePercentage = Math.min(((timeInSeconds - sunriseTimeInSeconds) / TRANSITION_DURATION) * 100, 100);
    } else if (timeInSeconds >= sunsetStart) {
      enhanced.timeOfDay = 'sunset';
      enhanced.cyclePercentage = Math.min(((timeInSeconds - sunsetStart) / TRANSITION_DURATION) * 100, 100);
    } else {
      enhanced.timeOfDay = 'day';
      enhanced.cyclePercentage =
        ((timeInSeconds - sunriseEnd) / (sunsetStart - sunriseEnd)) * 100;
    }

    return enhanced;
  }

  private getSolarSimulation(time: Date, settings: SunConfig): SimulatedSun {
    const enhanced = this.calculateSunSimulation(time, settings);
    const simulatedSun = new SimulatedSun();

    // Only copy the base SimulatedSun properties
    simulatedSun.on = enhanced.on;
    simulatedSun.brightness = enhanced.brightness;
    simulatedSun.rgbw = enhanced.rgbw;

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

    rgbw.red = Math.round(red) || 1;
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

import { ApiProperty } from '@nestjs/swagger';

export class DistribuitonData {
  @ApiProperty({ description: 'The time point of the distribution data' })
  time: string;

  @ApiProperty({ description: 'The brightness value at this time point' })
  brightness: number;

  @ApiProperty({ description: 'The red color value at this time point' })
  red: number;

  @ApiProperty({ description: 'The green color value at this time point' })
  green: number;

  @ApiProperty({ description: 'The blue color value at this time point' })
  blue: number;

  @ApiProperty({ description: 'The white color value at this time point' })
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
