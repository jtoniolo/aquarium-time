import { Stack, TextField, Typography, Slider } from "@mui/material";
import type { SunConfig, Time } from "../types";
import { useState, useEffect } from "react";
import React from "react";

interface LightingConfigSectionProps {
  config?: SunConfig;
  onChange: (config: SunConfig) => void;
  disabled?: boolean;
}

export default function LightingConfigSection({
  config,
  onChange,
  disabled,
}: LightingConfigSectionProps) {
  const defaultConfig: SunConfig = {
    sunRiseTime: { hour: 6, minute: 0, second: 0 },
    sunDuration: { hour: 16, minute: 0, second: 0 },
    highLightRatio: 1 / 3,
    durationMultiplier: 1,
    sunriseOffset: 0,
  };

  const currentConfig = config || defaultConfig;
  const [localRatio, setLocalRatio] = useState(currentConfig.highLightRatio || 0.33);

  // Update local state when props change
  useEffect(() => {
    setLocalRatio(currentConfig.highLightRatio || 0.33);
  }, [currentConfig.highLightRatio]);

  const handleTimeChange = (
    field: keyof SunConfig,
    timeField: keyof Time,
    value: string
  ) => {
    const newTime = {
      ...((currentConfig[field] as Time) || {}),
      [timeField]: parseInt(value) || 0,
    };
    onChange({
      ...currentConfig,
      [field]: newTime,
    });
  };

  // Update local state while sliding
  const handleRatioChange = (_: Event, value: number | number[]) => {
    if (typeof value === 'number') {
      setLocalRatio(value);
    }
  };

  // Send update to parent when sliding ends
  const handleRatioChangeCommitted = (_: React.SyntheticEvent | Event, value: number | number[]) => {
    const finalValue = typeof value === 'number' ? value : 0.33;
    setLocalRatio(finalValue);
    onChange({
      ...currentConfig,
      highLightRatio: finalValue,
    });
  };

  // Calculate sunset time
  const sunsetHour = ((currentConfig.sunRiseTime?.hour || 0) + (currentConfig.sunDuration?.hour || 0)) % 24;
  const sunsetMinute = ((currentConfig.sunRiseTime?.minute || 0) + (currentConfig.sunDuration?.minute || 0)) % 60;
  const sunsetTimeString = `${String(sunsetHour).padStart(2, '0')}:${String(sunsetMinute).padStart(2, '0')}`;

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1">Custom Lighting Schedule</Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="subtitle2">Sunrise Time</Typography>
        <TextField
          label="Hour"
          type="number"
          size="small"
          value={currentConfig.sunRiseTime?.hour || 0}
          onChange={(e) => handleTimeChange("sunRiseTime", "hour", e.target.value)}
          disabled={disabled}
          inputProps={{ min: 0, max: 23 }}
        />
        <TextField
          label="Minute"
          type="number"
          size="small"
          value={currentConfig.sunRiseTime?.minute || 0}
          onChange={(e) => handleTimeChange("sunRiseTime", "minute", e.target.value)}
          disabled={disabled}
          inputProps={{ min: 0, max: 59 }}
        />
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="subtitle2">Duration</Typography>
        <TextField
          label="Hours"
          type="number"
          size="small"
          value={currentConfig.sunDuration?.hour || 0}
          onChange={(e) => handleTimeChange("sunDuration", "hour", e.target.value)}
          disabled={disabled}
          inputProps={{ min: 0, max: 24 }}
        />
        <TextField
          label="Minutes"
          type="number"
          size="small"
          value={currentConfig.sunDuration?.minute || 0}
          onChange={(e) => handleTimeChange("sunDuration", "minute", e.target.value)}
          disabled={disabled}
          inputProps={{ min: 0, max: 59 }}
        />
        <Typography variant="body2" color="text.secondary">
          Sunset: {sunsetTimeString}
        </Typography>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle2">Light Intensity Ratio</Typography>
        <Slider
          value={localRatio}
          onChange={handleRatioChange}
          onChangeCommitted={handleRatioChangeCommitted}
          step={0.01}
          marks={[
            { value: 0, label: '0' },
            { value: 0.25, label: '0.25' },
            { value: 0.5, label: '0.5' },
            { value: 0.75, label: '0.75' },
            { value: 1, label: '1' }
          ]}
          min={0}
          max={1}
          disabled={disabled}
          valueLabelFormat={(value) => value.toFixed(2)}
          valueLabelDisplay="auto"
        />
      </Stack>
    </Stack>
  );
}
