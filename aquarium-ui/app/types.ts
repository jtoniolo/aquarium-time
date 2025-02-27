// Base light attributes interface
interface LightAttributes {
  friendly_name?: string;
  supported_color_modes?: string[];
  brightness?: number | null;
  color_mode?: string | null;
  min_color_temp_kelvin?: number;
  max_color_temp_kelvin?: number;
  min_mireds?: number;
  max_mireds?: number;
  effect_list?: string[];
  effect?: string | null;
  color_temp_kelvin?: number | null;
  color_temp?: number | null;
  hs_color?: [number, number] | null;
  rgb_color?: [number, number, number] | null;
  xy_color?: [number, number] | null;
  rgbw_color?: [number, number, number, number] | null;
  last_brightness?: number;
  supported_features?: number;
  is_hue_group?: boolean;
  hue_scenes?: string[];
  hue_type?: string;
  lights?: string[];
  dynamics?: boolean | "none";
  icon?: string;
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | Array<string | number>
    | unknown;
}

// Home Assistant light context
interface HAContext {
  id: string;
  parent_id: string | null;
  user_id: string | null;
}

// Discovered light from Home Assistant
export interface DiscoveredLight {
  entity_id: string;
  state: string;
  attributes: LightAttributes;
  last_changed: string;
  last_reported: string;
  last_updated: string;
  context: HAContext;
}

// Light entity in our system
export interface Light {
  entity_id: string;
  entity_data: {
    state: string;
    attributes: LightAttributes;
  };
  aquariumId?: string;
  last_updated?: Date;
}

export interface Time {
  hour: number;
  minute: number;
  second: number;
}

export interface SunConfig {
  sunRiseTime?: Time;
  sunDuration?: Time;
  highLightRatio?: number;
  sunriseOffset?: number;
  durationMultiplier?: number;
  emulateCloudCover?: boolean;
  maxIntensity?: number;
}

export interface Aquarium {
  id: string;
  name: string;
  description?: string;
  gallons?: number;
  dimensions?: string;
  lights: Light[];
  lightingConfig?: SunConfig;
}
