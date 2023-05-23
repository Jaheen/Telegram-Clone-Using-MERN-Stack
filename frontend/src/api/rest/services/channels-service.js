import { Axios } from "../axios"


export default class ChannelsService {

    /**
     * Get all subscribers of a channel who are in contacts list
     * @param {string} channelId id of the group
     * @returns contacts in group
     */
    static async getContactsInChannel(channelId) {
        return new Promise((resolve) => {
            Axios.get(`/channels/get-my-contacts-in-channel/${channelId}`).then(response => {
                if (response.status === 200) {
                    const { contactsInChannel } = response.data
                    if (contactsInChannel instanceof Array) {
                        const data = {}
                        contactsInChannel.forEach(contactSubscriber => data[contactSubscriber.userId] = contactSubscriber)
                        resolve(data)
                    }
                }
            }).catch(console.log)
        })
    }

    /**
     * Get all subscribers of a channel with pagination
     * @param {string} channelId id of the group
     * @param {string} query search query to search subscribers
     * @param {number} offset pagination offset
     * @returns subscribers in the group
     */
    static async getSubscribersOfChannel(channelId, query, offset) {
        return new Promise((resolve) => {
            Axios.get(`/channels/get-subscribers/${channelId}?query=${query}&offset=${offset}`).then(response => {
                if (response.status === 200) {
                    const { subscribers } = response.data
                    if (subscribers instanceof Array) {
                        resolve(subscribers)
                    }
                }
            }).catch(console.log)
        })
    }
}