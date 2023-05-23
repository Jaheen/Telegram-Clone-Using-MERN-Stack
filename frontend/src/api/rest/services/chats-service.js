import { Axios } from "../axios"

/**
 * Service to handle REST requests on chats
 */
export default class ChatsService {
    /**
     * Get all recent chats of logged user from the server
     * @returns a promise containing the chats
     */
    static async getMyChats() {
        return new Promise((resolve) => {
            Axios.get("/chats/get-my-chats").then(response => {
                if (response.status === 200) {
                    const { chats } = response.data
                    resolve(chats)
                }
            }).catch(console.log)
        })
    }

    /**
     * Fetch a specific chat from server
     * @param {string} chatType type of chat that needs to be fetched
     * @param {string} targetId id of the target
     * @returns a promise containing required data
     */
    static async getChatData(chatType, targetId) {
        return new Promise((resolve, reject) => {
            Axios.get(`/chats/get-chat-data/${chatType}/${targetId}`).then(response => {
                if (response.status === 200) {
                    const { chatData } = response.data
                    resolve(chatData)
                }
            }).catch(err => {
                const { response } = err
                if (response && response.status === 404) {
                    const { message } = response.data
                    reject(message)
                }
            })
        })
    }
}