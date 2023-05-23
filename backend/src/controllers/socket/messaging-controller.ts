import { ObjectId } from "mongodb";
import { MessagesSevice } from "services";
import { Server, Socket } from "socket.io";

/**
 * Class to control the events emitted by socket.io for messaging
 */
export default class MessagingController {

    static async message(clientSocket: Socket, io: Server, message: any) {
        const userId = clientSocket["userId"]
        const { messageId, messageType, receiverId, groupId, channelId, contentType, content } = message

        if (messageType && messageType.trim() !== "") {
            switch (messageType) {
                case "private":
                    MessagesSevice.createPrivateMessage(userId, receiverId, contentType, content)
                        .on("message-created", createdMessage => {
                            io.to(userId).emit("message-sent", { tempMessageId: messageId, createdMessage })
                            io.to(receiverId).emit("message-arrived", createdMessage)
                        })
                        .on("sender-chat-created", senderChat => io.to(userId).emit("new-chat-added", senderChat))
                        .on("receiver-chat-created", receiverChat => io.to(receiverId).emit("new-chat-added", receiverChat))
                    break
                case "group":
                    MessagesSevice.createGroupMessage(userId, groupId, contentType, content)
                        .then(createdMessage => {
                            io.to(userId).emit("message-sent", { tempMessageId: messageId, createdMessage })
                            clientSocket.broadcast.to(groupId).emit("message-arrived", createdMessage)
                        })
                    break
                case "channel":
                    MessagesSevice.createChannelMessage(userId, channelId, contentType, content)
                        .then(createdMessage => {
                            io.to(userId).emit("message-sent", { tempMessageId: messageId, createdMessage })
                            clientSocket.broadcast.to(channelId).emit("message-arrived", createdMessage)
                        })
                    break
                default:
                    break
            }
        }
    }

    static async messagesRecievedByTarget(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]

        const { chatType, targetId, messageIds } = data

        if (chatType && chatType === "private") {
            if (targetId && targetId.trim() !== "") {
                if (messageIds instanceof Array<string>) {
                    MessagesSevice.setMessagesReceived(userId, targetId, messageIds).then(_ => {
                        io.to(targetId).emit("messages-received-by-target", { chatType, targetId: userId, messageIds })
                    })
                }
            }
        }
    }

    static async messagesSeenByTarget(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]

        const { chatType, targetId, messageIds } = data

        if (chatType && chatType === "private") {
            if (targetId && targetId.trim() !== "") {
                if (messageIds instanceof Array<string>) {
                    MessagesSevice.setMessagesSeen(userId, targetId, messageIds).then(_ => {
                        io.to(targetId).emit("messages-seen-by-target", { chatType, targetId: userId, messageIds })
                    })
                }
            }
        }
    }

    static async deleteMessages(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { chatType, targetId, messageIds } = data

        if (["private", "group", "channel"].includes(chatType) && typeof ObjectId.isValid(targetId) && messageIds instanceof Array<string>) {
            const validatedMessageIds = []

            messageIds.forEach(messageId => {
                if (ObjectId.isValid(messageId))
                    validatedMessageIds.push(messageId)
            })

            if (validatedMessageIds.length !== 0) {
                MessagesSevice.deleteMessages(userId, chatType, targetId, messageIds).then(isDeleted => {
                    if (isDeleted) {
                        clientSocket.broadcast.to(userId).emit("messages-deleted", { chatType, targetId, messageIds: validatedMessageIds })
                        if (chatType === "private")
                            clientSocket.broadcast.to(targetId).emit("messages-deleted", { chatType, targetId: userId, messageIds: validatedMessageIds })
                        else
                            clientSocket.broadcast.to(targetId).emit("messages-deleted", { chatType, targetId, messageIds: validatedMessageIds })
                    }
                })
            }
        }
    }
}