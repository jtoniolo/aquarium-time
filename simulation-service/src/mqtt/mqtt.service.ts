import { Injectable, Logger } from '@nestjs/common';
import * as mqtt from 'mqtt';

// This service is responsible for handling MQTT operations
@Injectable()
export class MqttService {
  // Logger instance for logging
  private readonly logger = new Logger(MqttService.name);

  // MQTT client instance
  private client: mqtt.MqttClient | undefined;

  constructor() {
    const broker = process.env.MQTT_BROKER;
    this.logger.log('MqttService constructor');
    this.logger.log('Environment variables:', {
      MQTT_BROKER: process.env.MQTT_BROKER,
      MQTT_TOPIC: process.env.MQTT_TOPIC,
      MQTT_LIGHT_TOPIC: process.env.MQTT_LIGHT_TOPIC,
    });

    if (!broker) {
      this.logger.warn(
        'No MQTT broker configured, MQTT functionality will be disabled',
      );
      return;
    }

    // Log the MQTT broker URL
    this.logger.log(`Connecting to MQTT broker: ${broker}`);

    try {
      // Connect to the MQTT broker
      this.client = mqtt.connect(broker);

      // Log when the MQTT client is connected to the broker
      this.client.on('connect', () => {
        this.logger.log('Connected to MQTT broker');
      });

      // Log when there is an error with the MQTT client
      this.client.on('error', (error) => {
        this.logger.error('MQTT client error:', error);
      });

      this.client.on('close', () => {
        this.logger.warn('MQTT client connection closed');
      });

      this.client.on('end', () => {
        this.logger.warn('MQTT client connection ended');
      });
    } catch (error) {
      this.logger.error('Failed to create MQTT client:', error);
    }
  }

  // This method publishes a message to a specific topic
  publish(topic: string, message: string) {
    if (!this.client) {
      this.logger.warn('MQTT client not initialized, skipping publish');
      return;
    }

    this.logger.debug(`Publishing to ${topic}:`, message);
    try {
      this.client.publish(topic, message);
    } catch (error) {
      this.logger.error(`Failed to publish to ${topic}:`, error);
    }
  }
}
