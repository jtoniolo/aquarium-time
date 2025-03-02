# Aquarium Time

Aquarium Time is an application designed to optimize aquarium lighting schedules by simulating daylight patterns. Unlike natural sunlight simulation, it creates optimized lighting patterns that maximize viewing time while minimizing algae growth through controlled light intensity and spectrum changes throughout the day.

## Features

- Optimized daylight pattern simulation for aquarium lighting
- Compatible with any Home Assistant-connected light (originally designed for Lominie lights)
- Dynamic color and brightness control based on time of day
- Web-based UI for light configuration and monitoring
- Optional MQTT integration for real-time light control
- Real-time WebSocket updates for light state monitoring

## Installation

### Using Docker Compose (Recommended)

1. Create a `.env` file with your configuration:

```env
MQTT_BROKER=mqtt://your-mqtt-broker:1883
MQTT_TOPIC=aquarium/dev/sun
MQTT_LIGHT_TOPIC=aquarium/dev/lights
HOMEASSISTANT_URL=http://your-homeassistant:8123/api
HOMEASSISTANT_TOKEN=your-long-lived-token
API_URL=http://localhost:3000
```

2. Create a docker-compose.yml file (see [example](docker-compose.yml)) or use this minimal configuration:

```yaml
version: "3.8"
services:
  simulation:
    image: ghcr.io/jtoniolo/aquarium-time-simulation:latest
    ports:
      - "3000:3000"
    environment:
      - MQTT_BROKER=${MQTT_BROKER}
      - MQTT_TOPIC=${MQTT_TOPIC}
      - MQTT_LIGHT_TOPIC=${MQTT_LIGHT_TOPIC}
      - HOMEASSISTANT_URL=${HOMEASSISTANT_URL}
      - HOMEASSISTANT_TOKEN=${HOMEASSISTANT_TOKEN}

  ui:
    image: ghcr.io/jtoniolo/aquarium-time-ui:latest
    ports:
      - "3001:3000"
    environment:
      - NEXT_PUBLIC_API_URL=${API_URL}
```

3. Start the services:

```bash
docker compose up -d
```

### Using Docker Run

If you prefer to run the containers individually:

```bash
# Run the simulation service
docker run -d \
  -p 3000:3000 \
  -e MQTT_BROKER=mqtt://your-mqtt-broker:1883 \
  -e MQTT_TOPIC=aquarium/dev/sun \
  -e MQTT_LIGHT_TOPIC=aquarium/dev/lights \
  -e HOMEASSISTANT_URL=http://your-homeassistant:8123/api \
  -e HOMEASSISTANT_TOKEN=your-token \
  ghcr.io/jtoniolo/aquarium-time-simulation:latest

# Run the UI service
docker run -d \
  -p 3001:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3000 \
  ghcr.io/jtoniolo/aquarium-time-ui:latest
```

## Home Assistant Integration

### Required Configuration

1. Add the [automation.yml](home-assistant/automation.yml) to your Home Assistant configuration
2. Configure any Home Assistant light entity (e.g., Lominie lights, LED strips, smart bulbs)

The automation listens for MQTT messages and controls your lights with:

- Brightness levels optimized for viewing and plant/coral health
- RGBW color values that change throughout the day
- Color temperature transitions that mimic natural light while limiting algae growth

## Using the Application

1. **Discover Lights**:

   - Navigate to http://localhost:3001/discover
   - The app will detect any light entities from your Home Assistant instance

2. **Configure Aquariums**:

   - Create a new aquarium configuration
   - Set your preferred sunrise time and photoperiod duration
   - The app will automatically calculate optimal light distribution:
     - Morning: Gradual warm light increase
     - Midday: Peak intensity with balanced spectrum
     - Evening: Gradual decrease with warmer tones

3. **Monitor and Adjust**:
   - View real-time light status via the dashboard
   - Use the distribution graph to visualize and adjust your lighting schedule
   - Make real-time adjustments as needed for your specific setup

## Optional MQTT Integration

The MQTT integration enables real-time communication between components. Without MQTT:

- The app will still function through Home Assistant API calls
- Real-time updates will be slightly delayed
- WebSocket updates will continue to work for monitoring

To enable MQTT:

1. Configure an MQTT broker
2. Set the MQTT environment variables
3. The simulation service will automatically connect and publish updates

## API Documentation

The simulation service provides a REST API and WebSocket endpoints for real-time updates.

### REST API

API documentation is available at `http://localhost:3000/api` when the simulation service is running.

### WebSocket Updates

Connect to the WebSocket endpoint at `ws://localhost:3000` to receive real-time sun simulation updates.

Example WebSocket event:

```javascript
// Event: 'sunUpdate'
{
  "on": true,
  "brightness": 75,
  "rgbw": {
    "red": 255,
    "green": 220,
    "blue": 180,
    "white": 255,
    "color_temp": 5500
  },
  "timeOfDay": "day",
  "cyclePercentage": 65
}
```

## Support

If you encounter any issues or need assistance, please open an issue on GitHub.

## License

See [LICENSE](LICENSE) file for details.
