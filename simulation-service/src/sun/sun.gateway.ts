import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { EnhancedSimulatedSun } from './sun.model';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SunGateway {
  @WebSocketServer()
  server: Server;

  emitSunUpdate(sunUpdate: EnhancedSimulatedSun) {
    this.server.emit('sunUpdate', sunUpdate);
  }
}