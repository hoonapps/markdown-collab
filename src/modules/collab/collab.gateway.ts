import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class CollabGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private documents: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-document')
  handleJoinDocument(
    @MessageBody() data: { docId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.docId);
    const content = this.documents.get(data.docId) || '';
    client.emit('document-content', { content });
  }

  @SubscribeMessage('edit-document')
  handleEditDocument(
    @MessageBody() data: { docId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.documents.set(data.docId, data.content);
    this.server
      .to(data.docId)
      .emit('document-updated', { content: data.content });
  }

  @SubscribeMessage('cursor-move')
  handleCursorMove(
    @MessageBody()
    data: { docId: string; userId: string; cursorPosition: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.docId).emit('cursor-updated', {
      userId: data.userId,
      cursorPosition: data.cursorPosition,
    });
  }
}
