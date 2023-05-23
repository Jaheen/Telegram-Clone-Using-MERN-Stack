import { AuthService } from "services";
import { Socket } from "socket.io";

export default function SocketIOAuthMiddleware(clientSocket: Socket, next: Function) {
    // fetch the jwt by splitting it
    const { serverAuthToken } = clientSocket.handshake.auth

    if (serverAuthToken && serverAuthToken.trim() !== "") {
        // using auth service verify the token
        // if valid allow
        // else send unauthorized
        AuthService.verifyServerAuthToken(serverAuthToken)
            .then((userId: string) => {
                clientSocket["userId"] = userId
                next()
            })
            .catch(_ => clientSocket.disconnect(true))
    } else {
        clientSocket.disconnect(true)
    }
}