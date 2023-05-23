import { Channels, Chats, Contacts, Groups, Users } from "models";

/**
 * Service class to perform operations regarding chats
 */
export default class ChatsService {

    static async getChatsOfUser(userId: string) {
        return Chats.fetchChatsOf(userId)
    }

    static async getChat(userId: string, chatType: string, targetId: string) {
        return new Promise((resolve, reject) => {
            switch (chatType) {
                case "private":
                    Promise.all([
                        Chats.fetchChat(userId, "private", { targetUserId: targetId }),
                        Users.findUserById(targetId),
                        Contacts.getContact(userId, targetId)
                    ]).then(([privateChat, targetUser, contact]) => {
                        if (privateChat)
                            resolve(privateChat)
                        else if (targetUser) {
                            const { firstName, lastName } = targetUser

                            targetUser["userId"] = targetUser._id
                            delete targetUser._id
                            targetUser["avatarText"] = firstName.substring(0, 1)
                            if (lastName)
                                targetUser["avatarText"] += lastName.substring(0, 1)

                            if (contact) {

                                const { firstName, lastName } = contact
                                contact["contactId"] = contact._id
                                delete contact._id
                                contact["avatarText"] = firstName.substring(0, 1)
                                if (lastName)
                                    contact["avatarText"] += lastName.substring(0, 1)

                            }
                            resolve({ chatType, targetId, targetUser, contact })
                        }
                        else
                            reject("user-not-found")
                    })
                    break
                case "group":
                    Promise.all([
                        Chats.fetchChat(userId, "group", { groupId: targetId }),
                        Groups.getGroup(targetId, userId)
                    ]).then(([groupChat, targetGroup]) => {
                        if (groupChat)
                            resolve(groupChat)
                        else if (targetGroup)
                            resolve({ chatType, targetId, targetGroup })
                        else
                            reject("group-not-found")
                    })
                    break
                case "channel":
                    Promise.all([
                        Chats.fetchChat(userId, "channel", { channelId: targetId }),
                        Channels.getChannel(targetId, userId)
                    ]).then(([channelChat, targetChannel]) => {
                        if (channelChat)
                            resolve(channelChat)
                        else if (targetChannel)
                            resolve({ chatType, targetId, targetChannel })
                        else
                            reject("channel-not-found")
                    })
                    break
                default:
                    reject("wrong-chat-type")
            }
        })
    }

    static async createGroupChatForUser(userId: string, groupId: string) {
        return Chats.createChat(userId, "group", { groupId })
    }

    static async createChannelChatForUser(userId: string, channelId: string) {
        return Chats.createChat(userId, "channel", { channelId })
    }

    static async setChatFlags(chatId: string, userId: string, flagToBeModified: "mute" | "archive" | "pin", value: boolean) {
        return Chats.setChatFlags(chatId, userId, flagToBeModified, value)
    }

    static async deleteChat(chatId: string, userId: string) {
        return Chats.deleteChatById(chatId, userId)
    }
}