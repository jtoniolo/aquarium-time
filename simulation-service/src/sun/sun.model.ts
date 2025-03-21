import { ApiProperty } from '@nestjs/swagger';

// This class represents RGBW (Red, Green, Blue, White) color values
export class RGBW {
  @ApiProperty({ description: 'The red color value, between 0 and 255' })
  red: number;

  @ApiProperty({ description: 'The green color value, between 0 and 255' })
  green: number;

  @ApiProperty({ description: 'The blue color value, between 0 and 255' })
  blue: number;

  @ApiProperty({ description: 'The white color value, between 0 and 255' })
  white: number;

  @ApiProperty({
    description: 'The color temperature in Kelvin, between 2700K and 6500K',
  })
  color_temp: number;
}
// This class represents a time with hour, minute, and second
export class Time {
  @ApiProperty({ description: 'The hour of the time' })
  hour: number;

  @ApiProperty({ description: 'The minute of the time' })
  minute: number;

  @ApiProperty({ description: 'The second of the time' })
  second: number;

  // This static method converts a Date object to a Time object
  static fromDate(date: Date): Time {
    return {
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    };
  }
}
// This class represents a simulated sun with properties for brightness and RGBW color values at a specific moment in time.
export class SimulatedSun {
  constructor() {
    this.brightness = 0;
    this.rgbw = {
      red: 0,
      green: 0,
      blue: 0,
      white: 0,
      color_temp: 6500,
    };
  }

  @ApiProperty({ description: 'Whether the simulated sun is on or off' })
  on: boolean;

  @ApiProperty({
    description:
      'The brightness of the simulated sun, a value between 0 and 100',
  })
  brightness: number;

  @ApiProperty({
    description: 'The RGBW color values of the simulated sun',
    type: () => RGBW,
  })
  rgbw: RGBW;
}

// This class represents the configuration for the sun simulation
export class SunConfig {
  @ApiProperty({ description: 'The time of sunrise', type: () => Time })
  sunRiseTime?: Time;

  @ApiProperty({ description: 'The duration of the sun', type: () => Time })
  sunDuration?: Time;

  @ApiProperty({
    description:
      'The ratio which determines the length of midday, the brightest part of the day. Should be 0 < highLightRatio <= 1',
    default: 1 / 3,
  })
  highLightRatio?: number = 1 / 3;

  @ApiProperty({ description: 'The offset for the sunrise time' })
  sunriseOffset?: number;

  @ApiProperty({ description: 'The multiplier for the duration of the sun' })
  durationMultiplier?: number;

  @ApiProperty({ description: 'Whether to emulate cloud cover' })
  emulateCloudCover?: boolean;

  @ApiProperty({
    description: 'Maximum intensity for mid-day brightness (30-100%)',
    minimum: 30,
    maximum: 100,
    default: 100,
  })
  maxIntensity?: number = 100;
}

// This class represents a geographical location with latitude, longitude, and altitude
export class Location {
  @ApiProperty({ description: 'The latitude of the location' })
  latitude: number;

  @ApiProperty({ description: 'The longitude of the location' })
  longitude: number;

  @ApiProperty({ description: 'The altitude of the location' })
  altitude: number;
}

export type TimeOfDay = 'sunrise' | 'day' | 'sunset' | 'night';

export class EnhancedSimulatedSun extends SimulatedSun {
  @ApiProperty({
    description: 'The current time of day phase',
    enum: ['sunrise', 'day', 'sunset', 'night'],
  })
  timeOfDay: TimeOfDay;

  @ApiProperty({
    description: 'Percentage through the current phase (0-100)',
    minimum: 0,
    maximum: 100,
  })
  cyclePercentage: number;
}

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

  @ApiProperty({
    description: 'The color temperature value at this point in Kelvin',
  })
  color_temp: number;
}
