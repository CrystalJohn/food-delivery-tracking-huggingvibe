import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type OrderRoomPayload = {
  orderId: string;
};

@WebSocketGateway({
  namespace: '/tracking',
  cors: {
    origin: '*',
  },
})
export class TrackingGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('tracking.join-order')
  handleJoinOrder(
    @MessageBody() payload: OrderRoomPayload,
    @ConnectedSocket() client: Socket,
  ) {
    if (!payload?.orderId) {
      return {
        ok: false,
        message: 'orderId is required',
      };
    }

    const room = this.getOrderRoom(payload.orderId);
    client.join(room);

    return {
      ok: true,
      room,
      orderId: payload.orderId,
    };
  }

  @SubscribeMessage('tracking.leave-order')
  handleLeaveOrder(
    @MessageBody() payload: OrderRoomPayload,
    @ConnectedSocket() client: Socket,
  ) {
    if (!payload?.orderId) {
      return {
        ok: false,
        message: 'orderId is required',
      };
    }

    const room = this.getOrderRoom(payload.orderId);
    client.leave(room);

    return {
      ok: true,
      room,
      orderId: payload.orderId,
    };
  }

  emitOrderLocationUpdated(orderId: string, payload: any) {
    this.server
      .to(this.getOrderRoom(orderId))
      .emit('order.location.updated', payload);
  }

  private getOrderRoom(orderId: string) {
    return `order:${orderId}`;
  }
}