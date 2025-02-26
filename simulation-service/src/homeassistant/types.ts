export interface HAContext {
  id: string;
  parent_id: string | null;
  user_id: string | null;
}

export interface HAEntityState<T = unknown> {
  entity_id: string;
  state: string;
  attributes: T;
  last_changed: string;
  last_updated: string;
  last_reported?: string;
  context: HAContext;
}

export interface HALightColorAttributes {
  min_color_temp_kelvin?: number;
  max_color_temp_kelvin?: number;
  min_mireds?: number;
  max_mireds?: number;
  color_temp_kelvin?: number | null;
  color_temp?: number | null;
  hs_color?: [number, number] | null;
  rgb_color?: [number, number, number] | null;
  xy_color?: [number, number] | null;
  rgbw_color?: [number, number, number, number] | null;
}

export interface HALightEffectAttributes {
  effect_list?: string[];
  effect?: string | null;
}

export interface HALightHueAttributes {
  is_hue_group?: boolean;
  hue_scenes?: string[];
  hue_type?: 'room' | string;
  lights?: string[];
  dynamics?: boolean | 'none';
  mode?: 'normal' | string;
}

export interface HALightGroupAttributes {
  entity_id?: string[];
  icon?: string;
}

export interface HALightBaseAttributes {
  supported_color_modes?: string[];
  color_mode?: string | null;
  brightness?: number | null;
  last_brightness?: number;
  friendly_name?: string;
  supported_features?: number;
  restored?: boolean;
  ip_address?: string;
}

export interface HALightAttributes
  extends HALightBaseAttributes,
    HALightColorAttributes,
    HALightEffectAttributes,
    HALightHueAttributes,
    HALightGroupAttributes {}

export type HALightState = HAEntityState<HALightAttributes>;

export type LightSupportedColorMode =
  | 'onoff'
  | 'brightness'
  | 'color_temp'
  | 'hs'
  | 'xy'
  | 'rgb'
  | 'rgbw'
  | 'rgbww';

export type LightState = 'on' | 'off' | 'unavailable' | string;

export interface HAApiStatus {
  message: string;
}
