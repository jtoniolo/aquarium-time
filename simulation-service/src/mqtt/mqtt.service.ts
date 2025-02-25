import { Injectable, Logger } from '@nestjs/common';
import * as mqtt from 'mqtt';

// This service is responsible for handling MQTT operations
@Injectable()
export class MqttService {
  // Logger instance for logging
  private readonly logger = new Logger(MqttService.name);

  // MQTT client instance
  private mqttClient: mqtt.MqttClient | undefined;

  constructor() {
    if (!process.env.MQTT_BROKER) {
      this.logger.warn('MQTT is disabled.');
      return;
    }
    // Log the MQTT broker URL
    this.logger.log(`Connecting to MQTT broker: ${process.env.MQTT_BROKER}`);

    // Connect to the MQTT broker
    this.mqttClient = mqtt.connect(process.env.MQTT_BROKER); // Replace with your MQTT broker URL

    // Log when the MQTT client is connected to the broker
    this.mqttClient.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
    });

    // Log when there is an error with the MQTT client
    this.mqttClient.on('error', (error) => {
      this.logger.error(`MQTT Error: ${error.message}`);
    });
  }

  // This method publishes a message to a specific topic
  publish(topic: string, message: string) {
    this.mqttClient?.publish(topic, message, (error) => {
      // Log when there is an error publishing the message
      if (error) {
        this.logger.error(`Failed to publish message: ${error.message}`);
      } else {
        // Log when the message is successfully published
        this.logger.log(`Message published to topic ${topic}`);
      }
    });
  }
}
