export interface Light {
  entity_id: string;
  entity_data: {
    state: string;
    attributes: {
      friendly_name?: string;
      supported_color_modes?: string[];
      brightness?: number;
      [key: string]: any;
    };
  };
  aquariumId?: string;
  last_updated?: Date;
}

export interface Aquarium {
  id: string;
  name: string;
  description?: string;
  gallons?: number;
  dimensions?: string;
  lights: Light[];
}