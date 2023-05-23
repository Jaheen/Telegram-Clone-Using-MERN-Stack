import { socket } from "../socket"


export default class MessagingService {

    /**
     * Send message to server for delivery to respective target
     * @param {object} message message data to be sent
     */
    static async sendMessage(message) {
        socket.emit("message", message)
    }

    /**
     * Notify server that the user recieved messages of a particular chat
     * @param {string} chatType type of chat to which messages belong
     * @param {string} targetId specific targetId of the chat
     * @param {Array<string>} messageIds array of messageIds
     */
    static async emitMessagesReceived(chatType, targetId, messageIds) {
        socket.emit("messages-received-by-me", { chatType, targetId, messageIds })
    }

    /**
     * Notify server that the user seen some messages
     * @param {string} chatType type of chat to which messages belong
     * @param {string} targetId specific targetId of the chat
     * @param {Array<string>} messageIds array of messageIds
     */
    static async emitMessagesSeen(chatType, targetId, messageIds) {
        socket.emit("messages-seen-by-me", { chatType, targetId, messageIds })
    }

    /**
     * Delete a list of messages in the chat
     * @param {string} chatType type of chat to which messages belong
     * @param {string} targetId specific targetId of the chat
     * @param {Array<string>} messageIds array of messageIds
     */
    static async deleteMessages(chatType, targetId, messageIds) {
        socket.emit("delete-messages", { chatType, targetId, messageIds })
    }

}