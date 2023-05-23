import { EventEmitter } from "events"
import { ChannelSubscribers, Chats, GroupMembers, Messages } from "models";

export default class MessagesSevice {

    static async getMessages(userId: string, chatType: string, targetId: string, before?: string, after?: string) {
        switch (chatType) {
            case "private":
                return Messages.getMessagesOf(userId, "private", { receiverId: targetId }, before, after)
            case "group":
                return Messages.getMessagesOf(userId, "group", { groupId: targetId }, before, after)
            case "channel":
                return Messages.getMessagesOf(userId, "channel", { channelId: targetId }, before, after)
            default:
                break
        }
    }

    static createPrivateMessage(senderId: string, receiverId: string, contentType: string, content: string): EventEmitter {
        const emitter = new EventEmitter()

        Messages.createMessage(senderId, "private", { receiverId }, contentType, content).then(message => {
            message["messageId"] = message._id
            delete message._id
            emitter.emit("message-created", message)

            Chats.updateLastMessage(senderId, "private", { targetUserId: receiverId }, message["messageId"])
                .then(({ isSenderChatCreated, isReceiverChatCreated }) => {
                    if (isSenderChatCreated)
                        Chats.fetchChat(senderId, "private", { targetUserId: receiverId })
                            .then(chat => emitter.emit("sender-chat-created", chat))

                    if (isReceiverChatCreated)
                        Chats.fetchChat(receiverId, "private", { targetUserId: senderId })
                            .then(chat => emitter.emit("receiver-chat-created", chat))
                })
        })

        return emitter
    }

    static async createGroupMessage(senderId: string, groupId: string, contentType: string, content: string) {
        return new Promise((resolve) => {
            Messages.createMessage(senderId, "group", { groupId }, contentType, content).then(message => {
                message["messageId"] = message._id
                delete message._id
                resolve(message)

                Chats.updateLastMessage(senderId, "group", { groupId }, message["messageId"])
            })
        })
    }

    static async createChannelMessage(senderId: string, channelId: string, contentType: string, content: string) {
        return new Promise((resolve) => {
            Messages.createMessage(senderId, "channel", { channelId }, contentType, content).then(message => {
                message["messageId"] = message._id
                delete message._id
                resolve(message)

                Chats.updateLastMessage(senderId, "channel", { channelId }, message["messageId"])
            })
        })
    }

    static async setMessagesReceived(userId: string, targetId: string, messageIds: Array<string>) {
        return Messages.setDeliveryStatus(targetId, { receiverId: userId }, messageIds, "received")
    }

    static async setMessagesSeen(userId: string, targetId: string, messageIds: Array<string>) {
        return Messages.setDeliveryStatus(targetId, { receiverId: userId }, messageIds, "seen")
    }

    /**
     * Delete messages
     * @param userId userId of the logged user
     * @param chatType type of the chat
     * @param targetId specificId of the chat
     * @param messageIds array of messageIds to be deleted
     * @returns a boolean promise
     */
    static async deleteMessages(userId: string, chatType: string, targetId: string, messageIds: Array<string>): Promise<boolean> {
        return new Promise((resolve) => {
            switch (chatType) {
                case "private":
                    // only delete messages sent by the user
                    Messages.deleteMessagesByIds(userId, messageIds).then(isDeleted => resolve(isDeleted))
                    break
                case "group":
                    GroupMembers.findMemberByUserIdAndGroupId(userId, targetId).then(member => {
                        if (member) {
                            // if logged user is admin then delete forced delete without considering senderId
                            if (member.isAdmin) {
                                Messages.deleteMessagesByIds(userId, messageIds, true).then(isDeleted => resolve(isDeleted))
                            } else {
                                // else not admin only delete messages sent by the user
                                Messages.deleteMessagesByIds(userId, messageIds).then(isDeleted => resolve(isDeleted))
                            }
                        } else resolve(false)
                    })
                    break
                case "channel":
                    ChannelSubscribers.findSubscriberByUserIdAndChannelId(userId, targetId).then(subscriber => {
                        // if logged user is subscriber and also admin delete messages without considering the senderId
                        if (subscriber && subscriber.isAdmin) {
                            Messages.deleteMessagesByIds(userId, messageIds, true).then(isDeleted => resolve(isDeleted))
                        } else resolve(false)
                    })
                    break
                default:
                    resolve(false)
                    break
            }
        })
    }
}