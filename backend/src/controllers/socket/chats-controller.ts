import { ObjectId } from "mongodb";
import { ChatsService } from "services";
import { Server, Socket } from "socket.io";

export default class ChatsController {

    static modifyChatFlag(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const flagsCanBeModified = ["mute", "archive", "pin"]
        const { chatId, flagToBeModified, value } = data

        if (chatId && ObjectId.isValid(chatId)) {
            if (flagsCanBeModified.includes(flagToBeModified)) {
                ChatsService.setChatFlags(chatId, userId, flagToBeModified, Boolean(value))
                    .then(_ => clientSocket.broadcast.to(userId).emit("chat-flag-modified", { chatId, flagToBeModified, value }))
            }
        }
    }

    static deleteChat(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { chatId } = data

        if (chatId && ObjectId.isValid(chatId)) {
            ChatsService.deleteChat(chatId, userId)
                .then(isDeleted => clientSocket.broadcast.to(userId).emit("chat-deleted", { chatId, isDeleted }))
        }
    }
}