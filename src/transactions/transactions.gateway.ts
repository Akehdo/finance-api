import { JwtService } from "@nestjs/jwt";
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway()
export class TransactionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly jwtService: JwtService) {}

    handleConnection(client: Socket) {
        const token = client.handshake.query.token as string;

        try{
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });

            client.data.userId = payload.sub;

            console.log(`Client connected: ${payload.email} (${client.id})`);
        } catch(error) {
            console.log('Invalid token:', error.message);
            client.disconnect();
        }
    }

    handleDisconnect(client: any) {
        console.log(`Client disconnected: ${client.id}`)
    }
     
    sendTransactionEvent(event: string, payload: any) {
        this.server.emit(event, payload);
    }
} 