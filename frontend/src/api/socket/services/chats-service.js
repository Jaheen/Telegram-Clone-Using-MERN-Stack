import { socket } from "../socket";


export default class ChatsService {

    /**
     * Delete a private chat between the logged user and target user
     * @param {string} chatId id of chat to be deleted
     * @param {string} targetUserId id of the target private user
     */
    static async deleteChat(chatId, targetUserId) {
        socket.emit("delete-chat", { chatId, targetUserId })
    }

    /**
     * Update chat boolean flag such as mute, archive and pin
     * @param {string} chatId id of the chat to be modified
     * @param {"mute"|"archive"|"pin"} flagToBeModified flag to be modified
     * @param {boolean} value value of the flag
     */
    static async setChatFlag(chatId, flagToBeModified, value) {
        socket.emit("modify-chat-flag", { chatId, flagToBeModified, value })
    }
}