import { Axios } from "../axios"

/**
 * Class to handle REST operations on Messages in server
 */
export default class MessagesService {
    static getMessages(chatType, targetId, before, after) {
        return new Promise((resolve) => {
            Axios.get(`/messages/get-messages/${chatType}/${targetId}?before=${before}&after=${after}`).then(response => {
                if (response.status === 200) {
                    const { messages } = response.data
                    resolve(messages)
                }
            }).catch(console.log)
        })
    }
}