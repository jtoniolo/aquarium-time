import { Injectable, HttpException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  HAEntityState,
  HAApiStatus,
  HALightState,
  HALightAttributes,
} from './types';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HomeAssistantService {
  private readonly baseUrl: string;
  private readonly authToken: string;
  private readonly logger = new Logger(HomeAssistantService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const base = this.configService.getOrThrow<string>('HOMEASSISTANT_URL');
    this.baseUrl = base.endsWith('/api') ? base : `${base}/api`;
    this.authToken = this.configService.getOrThrow('HOMEASSISTANT_TOKEN');
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
  }

  private isLightEntity(
    entity: HAEntityState<unknown>,
  ): entity is HALightState {
    return entity.entity_id.startsWith('light.');
  }

  async checkApi(): Promise<HAApiStatus> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<HAApiStatus>('', {
          baseURL: this.baseUrl,
          headers: this.headers,
        }),
      );
      return data;
    } catch (error) {
      this.logger.error(`Failed to check Home Assistant API: ${error.message}`, error.stack);
      throw new HttpException(
        error.response?.data?.message || 'Failed to check API status',
        error.response?.status || 500,
      );
    }
  }

  async getAllLights(): Promise<HALightState[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<HAEntityState[]>('/states', {
          baseURL: this.baseUrl,
          headers: this.headers,
        }),
      );

      const lightEntities = data.filter(this.isLightEntity);
      return lightEntities;
    } catch (error) {
      this.logger.error(`Failed to fetch all lights: ${error.message}`, error.stack);
      throw new HttpException(
        error.response?.data?.message || 'Failed to fetch lights',
        error.response?.status || 500,
      );
    }
  }

  async getEntityState<T = unknown>(
    entityId: string,
  ): Promise<HAEntityState<T>> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<HAEntityState<T>>(`/states/${entityId}`, {
          baseURL: this.baseUrl,
          headers: this.headers,
        }),
      );
      return data;
    } catch (error) {
      this.logger.error(`Failed to fetch entity state for ${entityId}: ${error.message}`, error.stack);
      throw new HttpException(
        error.response?.data?.message || 'Failed to fetch entity state',
        error.response?.status || 500,
      );
    }
  }

  async getLightState(entityId: string): Promise<HALightState> {
    if (!entityId.startsWith('light.')) {
      this.logger.error(`Invalid light entity ID: ${entityId}`);
      throw new HttpException('Not a light entity', 400);
    }
    return this.getEntityState<HALightAttributes>(entityId);
  }

  async updateEntityState<T = unknown>(
    entityId: string,
    state: string,
    attributes?: T,
  ): Promise<HAEntityState<T>> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<HAEntityState<T>>(
          `/states/${entityId}`,
          { state, attributes },
          {
            baseURL: this.baseUrl,
            headers: this.headers,
          },
        ),
      );
      return data;
    } catch (error) {
      this.logger.error(`Failed to update entity state for ${entityId}: ${error.message}`, {
        entityId,
        state,
        attributes,
        error: error.stack,
      });
      throw new HttpException(
        error.response?.data?.message || 'Failed to update entity state',
        error.response?.status || 500,
      );
    }
  }

  async updateLightState(
    entityId: string,
    state: string,
    attributes?: Partial<HALightAttributes>,
  ): Promise<HALightState> {
    if (!entityId.startsWith('light.')) {
      this.logger.error(`Invalid light entity ID: ${entityId}`);
      throw new HttpException('Not a light entity', 400);
    }
    return this.updateEntityState<HALightAttributes>(
      entityId,
      state,
      attributes,
    );
  }
}
