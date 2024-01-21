// This class represents a simulated sun with properties for brightness and RGBW color values at a specific moment in time.
export class SimulatedSun {
  constructor() {
    this.brightness = 0;
    this.rgbw = {
      red: 0,
      green: 0,
      blue: 0,
      white: 0,
    };
  }

  on: boolean; // Whether the simulated sun is on or off
  brightness: number; // The brightness of the simulated sun, a value between 0 and 100
  rgbw: RGBW; // The RGBW color values of the simulated sun
}

// This class represents RGBW (Red, Green, Blue, White) color values
export class RGBW {
  red: number; // The red color value, between 0 and 255
  green: number; // The green color value, between 0 and 255
  blue: number; // The blue color value, between 0 and 255
  white: number; // The white color value, between 0 and 255
}

// This class represents the configuration for the sun simulation
export class SunConfig {
  sunRiseTime?: Time; // The time of sunrise
  sunDuration?: Time; // The duration of the sun
  highLightRatio?: number = 1 / 3; // The ratio which determines the lenght of midday, the brightest part of the day. Should be 0 < highLightRatio <= 1
  //location?: Location; // The location for the sun simulation
  sunriseOffset?: number; // The offset for the sunrise time
  durationMultiplier?: number; // The multiplier for the duration of the sun
  emulateCloudCover?: boolean; // Whether to emulate cloud cover
}

// This class represents a geographical location with latitude, longitude, and altitude
export class Location {
  latitude: number; // The latitude of the location
  longitude: number; // The longitude of the location
  altitude: number; // The altitude of the location
}

// This class represents a time with hour, minute, and second
export class Time {
  hour: number; // The hour of the time
  minute: number; // The minute of the time
  second: number; // The second of the time

  // This static method converts a Date object to a Time object
  static fromDate(date: Date): Time {
    return {
      hour: date.getHours(), // Get the hour from the date
      minute: date.getMinutes(), // Get the minute from the date
      second: date.getSeconds(), // Get the second from the date
    };
  }
}
