import { socket } from "../socket"


/**
 * Class to interact with server using socket.io regarding channels
 */
export default class ChannelsService {

    /**
     * Create a channel with name, description and avatarUrl
     * @param {string} channelName name of the channel to be created
     * @param {string} channelDescription description of the channel to be created
     * @param {string} avatarUrl URL of the avatar uploaded to firebase
     * @returns a promise containing the created channel chat
     */
    static async createChannel(channelName, channelDescription, avatarUrl) {
        return new Promise((resolve) => {
            socket.emit("create-channel", { channelName, channelDescription, avatarUrl })
                .once("new-channel-created", channelChat => resolve(channelChat))
        })
    }

    /**
     * Subscribe to a channel using channelId
     * @param {string} channelId id of the channel to subscribe
     */
    static async subscribeToChannel(channelId) {
        socket.emit("subscribe-to-channel", { channelId })
    }

    /**
     * Add subscribers to a channel
     * @param {string} channelId id of the channel
     * @param {Array<string>} userIds array of userIds to be added as subscribers
     * @returns a promise with data
     */
    static async addSubscribers(channelId, userIds) {
        return new Promise((resolve) => {
            socket.emit("add-subscribers", { channelId, userIds })
                .once("subscribers-added", ({ subscribersCount }) => resolve({ subscribersCount }))
        })
    }

    /**
     * Removes a list of subscribers from the channel
     * @param {string} channelId id of the channel
     * @param {Array<string>} userIds array of userIds to be removed from the channel
     * @returns a promise with data
     */
    static async removeSubscribers(channelId, userIds) {
        return new Promise((resolve) => {
            socket.emit("remove-subscribers", { channelId, userIds })
                .once("subscribers-removed", ({ subscribersCount }) => resolve({ subscribersCount }))
        })
    }

    /**
     * Grant admin privileges of a channel for a list of users
     * @param {string} channelId id of the channel
     * @param {Array<string>} userIds array of userIds
     */
    static async grantAdminPrivileges(channelId, userIds) {
        socket.emit("grant-channel-admin-privileges", { channelId, userIds })
    }

    /**
     * Revoke admin privileges of a channel for a list of users
     * @param {string} channelId id of the channel
     * @param {Array<string>} userIds array of userIds
     */
    static async revokeAdminPrivileges(channelId, userIds) {
        socket.emit("revoke-channel-admin-privileges", { channelId, userIds })
    }

    /**
     * Leave from a channel and delete chat
     * @param {string} chatId id of the chat that references the channel
     * @param {string} channelId id of the channel from which the user should leave
     */
    static async leaveChannel(chatId, channelId) {
        socket.emit("leave-channel", { chatId, channelId })
    }

    /**
     * Update the channel name, description and avatar
     * @param {string} channelId id of the channel
     * @param {string} channelName new name for the channel
     * @param {string } channelDescription new description for the channel
     * @param {string} avatarUrl new avatar url for the channel
     */
    static async updateChannelProfile(channelId, channelName, channelDescription, avatarUrl) {
        socket.emit("update-channel-profile", { channelId, channelName, channelDescription, avatarUrl })
    }
}