import { Channels, ChannelSubscribers, Chats } from "models"
import { EventEmitter } from "events"


export default class ChannelsService {

    /**
     * Create a channel with the specified name, description and avatarUrl.
     * @param userId id of the authenticated user
     * @param channelName name of the channel that needs to be created
     * @param channelDescription description of the channel that needs to be created
     * @param avatarUrl avatarUrl of the channel that needs to be created
     * @returns the created channel chat
     */
    static async createChannel(userId: string, channelName: string, channelDescription: string, avatarUrl: string): Promise<any> {
        return new Promise((resolve) => {

            Channels.createChannel(userId, channelName, channelDescription, avatarUrl).then(createdChannelId => {
                const channelId = createdChannelId.toString()

                // add creating user as subscriber with admin privileges and create his chat
                ChannelSubscribers.addSubscribers([userId], channelId, true).then(_ => {
                    Chats.createChat(userId, "channel", { channelId })
                        .then(createdOwnerChat => resolve({ createdOwnerChat, channelId }))
                })
            })
        })
    }

    /**
     * Add the authenticated user to a channel's subscribers list
     * @param userId id of the authenticated user
     * @param channelId id of the channel to which the authenticated user wants to subscribe
     * @returns the created channel chat
     */
    static async subscribeChannel(userId: string, channelId: string): Promise<any> {
        return new Promise((resolve) => {
            ChannelSubscribers.findSubscriberByUserIdAndChannelId(userId, channelId).then(subscriber => {
                // If not already subscriber then add as subscriber and create chat
                if (!Boolean(subscriber)) {
                    Promise.all([
                        ChannelSubscribers.addSubscribers([userId], channelId),
                        Channels.incrementSubscribersCount(channelId, 1),
                    ]).then(([isSubscriberAdded, subscribersCount]) => {
                        if (isSubscriberAdded)
                            Chats.createChat(userId, "channel", { channelId })
                                .then(createdSubscriberChat => resolve({ createdSubscriberChat, subscribersCount }))
                    })
                }
            })
        })
    }

    /**
     * Add a list of users to a channel as subscribers
     * @param userId id of the logged user
     * @param channelId id of the channel
     * @param userIds array of userIds
     */
    static addSubscribers(userId: string, channelId: string, userIds: Array<string>) {
        const emitter = new EventEmitter()

        ChannelSubscribers.findSubscriberByUserIdAndChannelId(userId, channelId).then(subscriber => {
            // if logged user is admin then add users
            if (subscriber && subscriber.isAdmin) {
                Promise.all([
                    ChannelSubscribers.addSubscribers(userIds, channelId),
                    Channels.incrementSubscribersCount(channelId, userIds.length)
                ]).then(([areSubscribersAdded, subscribersCount]) => {
                    if (areSubscribersAdded) {
                        // emit added
                        emitter.emit("subscribers-added", { subscribersCount })
                        // create chat for each added user and emit
                        userIds.forEach(userId => {
                            Chats.createChat(userId, "channel", { channelId }).then(createdSubscriberChat => {
                                emitter.emit("subscriber-chat-created", { createdSubscriberChat, userId, channelId })
                            })
                        })
                    }
                })
            }
        })

        return emitter
    }

    /**
     * 
     * @param userId id of the logged user
     * @param channelId id of the channel
     * @param userIds array of userIds to remove from the channel
     * @returns a promise containing new subscribersCount after removal
     */
    static async removeSubscribers(userId: string, channelId: string, userIds: Array<string>): Promise<number> {
        return new Promise((resolve) => {
            ChannelSubscribers.findSubscriberByUserIdAndChannelId(userId, channelId).then(subscriber => {
                // if user is a subscriber and also admin then remove
                if (subscriber && subscriber.isAdmin) {
                    Promise.all([
                        ChannelSubscribers.removeSubscribers(userIds, channelId),
                        Channels.incrementSubscribersCount(channelId, -(userIds.length))
                    ]).then(([areSubscribersRemoved, subscribersCount]) => {
                        if (areSubscribersRemoved) {
                            userIds.forEach(userId => Chats.deleteChat(userId, "channel", { channelId }))
                            resolve(subscribersCount)
                        }
                    })
                }
            })
        })
    }

    /**
     * Grant admin privileges to a list of users
     * @param userId id of the logged user
     * @param channelId id of the channel
     * @param userIds array of userIds
     * @returns a boolean promise
     */
    static async grantAdminPrivileges(userId: string, channelId: string, userIds: Array<string>): Promise<boolean> {
        return new Promise((resolve) => {
            ChannelSubscribers.findSubscriberByUserIdAndChannelId(userId, channelId).then(subscriber => {
                // if logged user is admin of the channel then make users as admins
                if (subscriber && subscriber.isAdmin) {
                    ChannelSubscribers.modifyAdminPrivileges(userIds, channelId, true)
                        .then(isModified => resolve(isModified))
                }
            })
        })
    }

    /**
     * Revoke admin privileges for a list of subscribers
     * @param userId id of the logged user
     * @param channelId id of the channel
     * @param userIds array of userIds
     * @returns a boolean promise
     */
    static async revokeAdminPrivileges(userId: string, channelId: string, userIds: Array<string>): Promise<boolean> {
        return new Promise((resolve) => {
            ChannelSubscribers.findSubscriberByUserIdAndChannelId(userId, channelId).then(subscriber => {
                // if logged user is an admin of the channel then revoke
                if (subscriber && subscriber.isAdmin) {
                    ChannelSubscribers.modifyAdminPrivileges(userIds, channelId, false)
                        .then(isModified => resolve(isModified))
                }
            })
        })
    }

    /**
     * Remove the logged user from a specific channel
     * @param userId id of the logged user
     * @param channelId id of the channel
     * @returns a promise containing the new subscriber count after leaving
     */
    static async leaveChannel(userId: string, channelId: string): Promise<any> {
        return new Promise((resolve) => {
            ChannelSubscribers.findSubscriberByUserIdAndChannelId(userId, channelId).then(subscriber => {
                // if user is a subscriber then leave
                if (subscriber) {
                    Promise.all([
                        ChannelSubscribers.removeSubscribers([userId], channelId),
                        Channels.incrementSubscribersCount(channelId, -1),
                        Chats.deleteChat(userId, "channel", { channelId })
                    ]).then(([isSubscriberRemoved, subscribersCount, isChatDeleted]) => {
                        if (isSubscriberRemoved && isChatDeleted)
                            resolve({ subscribersCount })
                    })
                }
            })
        })
    }

    static async getSubscriptionsOfUser(userId: string) {
        return ChannelSubscribers.findSubscriptionsByUserId(userId)
    }

    static async fetchContactsInChannel(userId: string, channelId: string) {
        return ChannelSubscribers.findSubscribersOfChannelInContacts(userId, channelId)
    }

    static async fetchSubscribers(userId: string, channelId: string, query: string, skip: number) {
        return new Promise((resolve) => {
            let searchName = null
            let username = null

            if (query.trim() !== "") {
                if (query.startsWith("@"))
                    username = query.substring(1)
                else
                    searchName = query
            }

            ChannelSubscribers.fetchSubscribersOfChannel(channelId, searchName, username, 20, skip)
                .then(subscribers => resolve(subscribers))
        })
    }

    /**
     * Update a channel profile with new name, description and avatarUrl
     * @param userId id of the logged user
     * @param channelId id of the channel 
     * @param channelName new channel name
     * @param channelDescription new description for channel
     * @param avatarUrl new avatarUrl for channel
     * @returns a boolean promise
     */
    static async updateProfile(userId: string, channelId: string, channelName: string, channelDescription: string, avatarUrl: string): Promise<boolean> {
        return new Promise((resolve) => {
            ChannelSubscribers.findSubscriberByUserIdAndChannelId(userId, channelId).then(subscriber => {
                // if the user is a subscriber and also a channel admin update profile
                if (subscriber && subscriber.isAdmin) {
                    Channels.updateProfile(channelId, channelName, channelDescription, avatarUrl)
                        .then(isUpdated => resolve(isUpdated))
                } else {
                    resolve(false)
                }
            })
        })
    }
}