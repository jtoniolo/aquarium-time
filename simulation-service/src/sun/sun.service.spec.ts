/*
https://docs.nestjs.com/fundamentals/testing#unit-testing
*/

import { Test, TestingModule } from '@nestjs/testing';
import { SunService } from './sun.service';
import { SunConfig, Time } from './sun.model';
import * as fs from 'fs';
import * as path from 'path';

describe('SunService', () => {
  let service: SunService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SunService],
    }).compile();

    service = module.get<SunService>(SunService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate time in seconds correctly', () => {
    const time: Time = { hour: 1, minute: 1, second: 1 };
    expect(service.getTimeInSeconds(time)).toEqual(3661);
  });

  it('should calculate brightness correctly', () => {
    expect(service.getBrightness(6, 12)).toBeCloseTo(100, 1);
    expect(service.getBrightness(0, 12)).toBeCloseTo(0, 1);
    expect(service.getBrightness(12, 12)).toBeCloseTo(0, 1);
  });

  it('should calculate RGBW correctly', () => {
    const rgbw = service.getRGBW(6, 12, 1);
    expect(rgbw.red).toBeCloseTo(255, 0);
    expect(rgbw.green).toBeCloseTo(255, 0);
    expect(rgbw.blue).toBeCloseTo(255, 0);
    expect(rgbw.white).toBeCloseTo(255, 0);
  });

  it('should simulate sun correctly', () => {
    const time = new Date();
    const settings: SunConfig = {
      sunRiseTime: {
        hour: 6,
        minute: 0,
        second: 0,
      },
      sunDuration: {
        hour: 12,
        minute: 0,
        second: 0,
      },
      sunriseOffset: 0,
      durationMultiplier: 1,
    };
    const simulatedSun = service.getSolarSimulation(time, settings);
    expect(simulatedSun).toBeDefined();
    expect(simulatedSun.brightness).toBeGreaterThanOrEqual(0);
    expect(simulatedSun.brightness).toBeLessThanOrEqual(100);
    expect(simulatedSun.rgbw.red).toBeGreaterThanOrEqual(0);
    expect(simulatedSun.rgbw.red).toBeLessThanOrEqual(255);
    expect(simulatedSun.rgbw.green).toBeGreaterThanOrEqual(0);
    expect(simulatedSun.rgbw.green).toBeLessThanOrEqual(255);
    expect(simulatedSun.rgbw.blue).toBeGreaterThanOrEqual(0);
    expect(simulatedSun.rgbw.blue).toBeLessThanOrEqual(255);
    expect(simulatedSun.rgbw.white).toBeGreaterThanOrEqual(0);
    expect(simulatedSun.rgbw.white).toBeLessThanOrEqual(255);
  });
});

/**
 * This test generates a CSV file with the solar simulation values for an entire day.
 * Should usually be disabled.
 */
//   it('should generate solar simulation values for an entire day', () => {
//     const data = [];
//     data.push(['Hour', 'Brightness', 'Red', 'Green', 'Blue', 'White']); // Headers

//     const settings: SunConfig = {
//       sunRiseTime: {
//         hour: 6,
//         minute: 0,
//         second: 0,
//       },
//       sunDuration: {
//         hour: 12,
//         minute: 0,
//         second: 0,
//       },
//       sunriseOffset: 0,
//       durationMultiplier: 1,
//     };

//     for (let minute = 0; minute < 24 * 60; minute += 10) {
//       const time = new Date();
//       time.setHours(0, minute, 0, 0); // Set the time to the current minute of the day
//       const solarSimulation = sunService.getSolarSimulation(time, settings);
//       data.push([
//         time.toISOString(),
//         solarSimulation.brightness.toFixed(2),
//         solarSimulation.rgbw.red.toFixed(2),
//         solarSimulation.rgbw.green.toFixed(2),
//         solarSimulation.rgbw.blue.toFixed(2),
//         solarSimulation.rgbw.white.toFixed(2),
//       ]); // Use toFixed to limit the number of decimal places
//     }

//     const csv = data.map((row) => row.join(',')).join('\n');
//     fs.writeFileSync(path.join(__dirname, 'solarSimulation.csv'), csv);
//   });
