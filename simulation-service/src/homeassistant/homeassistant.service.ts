import { Injectable, HttpException } from '@nestjs/common';
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
  private readonly baseUrl: string = 'http://homeassistant.local:8123/api';
  private readonly authToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authToken = this.configService.getOrThrow('HOMEASSISTANT_TOKEN');
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
  }

  private isLightEntity(entity: HAEntityState<any>): entity is HALightState {
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
      throw new HttpException(
        error.response?.data?.message || 'Failed to fetch lights',
        error.response?.status || 500,
      );
    }
  }

  async getEntityState<T = any>(entityId: string): Promise<HAEntityState<T>> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<HAEntityState<T>>(`/states/${entityId}`, {
          baseURL: this.baseUrl,
          headers: this.headers,
        }),
      );
      return data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Failed to fetch entity state',
        error.response?.status || 500,
      );
    }
  }

  async getLightState(entityId: string): Promise<HALightState> {
    if (!entityId.startsWith('light.')) {
      throw new HttpException('Not a light entity', 400);
    }
    return this.getEntityState<HALightAttributes>(entityId);
  }

  async updateEntityState<T = any>(
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
      throw new HttpException('Not a light entity', 400);
    }
    return this.updateEntityState<HALightAttributes>(
      entityId,
      state,
      attributes,
    );
  }
}
