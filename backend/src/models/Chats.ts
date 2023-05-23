import Database from "database"
import { Filter, ObjectId, UpdateFilter, WithId } from "mongodb"

export interface Chat {
    chatType: "private" | "group" | "channel"
    userId: ObjectId
    targetUserId?: ObjectId
    groupId?: ObjectId
    channelId?: ObjectId
    lastMessageId?: ObjectId
    lastViewedMessageId?: ObjectId
    unreadMessages?: number
    isPinned?: boolean
    isMuted?: boolean
    isArchived?: boolean
}

const PrivateChatLookup = {
    $lookup: {
        from: "Users",
        localField: "targetUserId",
        foreignField: "_id",
        as: "targetUser",
        pipeline: [
            {
                $addFields: {
                    userId: "$_id",
                    avatarText: {
                        $concat: [
                            { $substrBytes: ["$firstName", 0, 1] },
                            { $substrBytes: ["$lastName", 0, 1] }
                        ]
                    }
                }
            },
            { $project: { _id: 0 } }
        ]
    }
}
const ContactLookup = {
    $lookup: {
        from: "Contacts",
        localField: "targetUserId",
        foreignField: "targetUserId",
        as: "contact",
        pipeline: [
            {
                $addFields: {
                    contactId: "$_id",
                    avatarText: {
                        $concat: [
                            { $substrBytes: ["$firstName", 0, 1] },
                            { $substrBytes: ["$lastName", 0, 1] }
                        ]
                    }
                }
            },
            { $project: { _id: 0, userId: 0, targetUserId: 0 } }
        ]
    }
}
const LastMessageLookup = {
    $lookup: {
        from: "Messages",
        localField: "lastMessageId",
        foreignField: "_id",
        as: "lastMessage",
        pipeline: [
            { $addFields: { messageId: "$_id" } },
            { $project: { _id: 0 } }
        ]
    }
}
const LastViewedMessageLookup = {
    $lookup: {
        from: "Messages",
        localField: "lastViewedMessageId",
        foreignField: "_id",
        as: "lastViewedMessage",
        pipeline: [
            { $addFields: { messageId: "$_id" } },
            { $project: { _id: 0 } }
        ]
    }
}
const getGroupLookup = (userId: string) => {
    return {
        $lookup: {
            from: "Groups",
            localField: "groupId",
            foreignField: "_id",
            as: "targetGroup",
            pipeline: [
                {
                    $lookup: {
                        from: "Group-Members",
                        localField: "_id",
                        foreignField: "groupId",
                        as: "membership",
                        pipeline: [
                            { $match: { userId: new ObjectId(userId) } },
                            { $project: { _id: 0 } }
                        ]
                    }
                },
                { $unwind: { path: "$membership", preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        groupId: "$_id",
                    }
                },
                { $project: { _id: 0 } }
            ]
        }
    }
}
const getChannelLookup = (userId: string) => {
    return {
        $lookup: {
            from: "Channels",
            localField: "channelId",
            foreignField: "_id",
            as: "targetChannel",
            pipeline: [
                {
                    $lookup: {
                        from: "Channel-Subscribers",
                        localField: "_id",
                        foreignField: "channelId",
                        as: "subscription",
                        pipeline: [
                            { $match: { userId: new ObjectId(userId) } },
                            { $project: { _id: 0 } }
                        ]
                    }
                },
                { $unwind: { path: "$subscription", preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        channelId: "$_id",
                    }
                },
                { $project: { _id: 0 } }
            ]
        }
    }
}

interface TargetData {
    targetUserId?: string
    groupId?: string
    channelId?: string
}

/**
 * Class to interact with 'Chats' collection
 */
export default class Chats {

    /**
     * Fetch all chats of the user
     * @param userId id of user whose chats need to be fetched
     * @returns a promise containing the chats
     */
    static async fetchChatsOf(userId: string): Promise<Array<any>> {
        return new Promise((resolve) => {
            const ChatsCollection = Database.getDatabase().collection<Chat>("Chats")
            ChatsCollection.aggregate([
                { $match: { userId: new ObjectId(userId) } },
                // lookup if chat is a private chat
                PrivateChatLookup,
                ContactLookup,
                { $unwind: { path: "$contact", preserveNullAndEmptyArrays: true } },
                // lookup if chat is a group
                getGroupLookup(userId),
                // lookup if chat is a channel
                getChannelLookup(userId),
                LastMessageLookup,
                LastViewedMessageLookup,
                { $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$lastViewedMessage", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$targetUser", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$targetGroup", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$targetChannel", preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        chatId: "$_id",
                        // target: { $ifNull: ["$targetUser", { $ifNull: ["$targetGroup", "$targetChannel"] }] },
                        targetId: { $ifNull: ["$targetUserId", { $ifNull: ["$groupId", "$channelId"] }] }
                    }
                },
                { $project: { _id: 0, userId: 0, targetUserId: 0, groupId: 0, channelId: 0 } }
            ]).toArray().then(resolve).catch(console.log)
        })
    }

    /**
     * Fetch the chat of a user of specific type referencing a target user or group or channel
     * @param userId id of the user who own's the chat
     * @param chatType type of the chat ie private|group|channel
     * @param targetData ids of the respective chat type target ie userId, groupId or channelId
     * @returns a promise containing chat if exists else a promise containing undefined
     */
    static async fetchChat(userId: string, chatType: Chat["chatType"], targetData: TargetData): Promise<any> {
        return new Promise((resolve) => {
            const ChatsCollection = Database.getDatabase().collection<Chat>("Chats")

            let pipeline: Array<object> = []
            const { targetUserId, groupId, channelId } = targetData

            switch (chatType) {
                case "private":
                    pipeline = [
                        { $match: { userId: new ObjectId(userId), targetUserId: new ObjectId(targetUserId) } },
                        PrivateChatLookup,
                        ContactLookup,
                        { $unwind: { path: "$contact", preserveNullAndEmptyArrays: true } },
                        LastMessageLookup,
                        LastViewedMessageLookup,
                        { $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: "$lastViewedMessage", preserveNullAndEmptyArrays: true } },
                        { $unwind: "$targetUser" },
                        { $addFields: { chatId: "$_id", targetId: "$targetUserId" } },
                        { $project: { _id: 0, userId: 0, targetUserId: 0 } }
                    ]
                    break
                case "group":
                    pipeline = [
                        { $match: { userId: new ObjectId(userId), groupId: new ObjectId(groupId) } },
                        getGroupLookup(userId),
                        LastMessageLookup,
                        LastViewedMessageLookup,
                        { $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: "$lastViewedMessage", preserveNullAndEmptyArrays: true } },
                        { $unwind: "$targetGroup" },
                        { $addFields: { chatId: "$_id", targetId: "$groupId" } },
                        { $project: { _id: 0, userId: 0, groupId: 0 } }
                    ]
                    break
                case "channel":
                    pipeline = [
                        { $match: { userId: new ObjectId(userId), channelId: new ObjectId(channelId) } },
                        getChannelLookup(userId),
                        LastMessageLookup,
                        LastViewedMessageLookup,
                        { $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: "$lastViewedMessage", preserveNullAndEmptyArrays: true } },
                        { $unwind: "$targetChannel" },
                        { $addFields: { chatId: "$_id", targetId: "$channelId" } },
                        { $project: { _id: 0, userId: 0, channelId: 0 } }
                    ]
                    break
                default:
                    break
            }

            ChatsCollection.aggregate(pipeline).toArray()
                .then(chats => resolve(chats[0]))
                .catch(console.log)
        })
    }

    /**
     * Create a chat for a user of specific type referencing a target user or group or channel
     * @param userId id of the user for whom the chat is going to be created
     * @param chatType type of the chat to be created
     * @param targetData target data containing id of reference
     * @returns a promise containing the created chat
     */
    static async createChat(userId: string, chatType: Chat["chatType"], targetData: TargetData): Promise<any> {
        return new Promise((resolve) => {
            const ChatsCollection = Database.getDatabase().collection<Chat>("Chats")

            const { targetUserId, groupId, channelId } = targetData
            let chatToBeInserted: Chat

            // fill chat type specific properties
            switch (chatType) {
                case "private":
                    chatToBeInserted = { userId: new ObjectId(userId), chatType: "private", targetUserId: new ObjectId(targetUserId) }
                    break
                case "group":
                    chatToBeInserted = { userId: new ObjectId(userId), chatType: "group", groupId: new ObjectId(groupId) }
                    break
                case "channel":
                    chatToBeInserted = { userId: new ObjectId(userId), chatType: "channel", channelId: new ObjectId(channelId) }
                    break
                default:
                    break
            }

            ChatsCollection.insertOne(chatToBeInserted).then(insertResult => {
                if (insertResult.acknowledged) {
                    this.fetchChat(userId, chatType, targetData)
                        .then(chat => resolve(chat))
                }
            }).catch(console.log)
        })
    }

    /**
     * Delete a chat of a user of specific type with specific target reference id
     * @param userId id of the user who owns this chat
     * @param chatType type of the chat to be deleted
     * @param targetData target data containing referenced id ie user id or group id or channel id
     * @returns a boolean promise
     */
    static async deleteChat(userId: string, chatType: Chat["chatType"], targetData: TargetData): Promise<boolean> {
        return new Promise((resolve) => {
            const ChatsCollection = Database.getDatabase().collection<Chat>("Chats")
            const { targetUserId, groupId, channelId } = targetData

            let chatToBeDeleted: Chat
            switch (chatType) {
                case "private":
                    chatToBeDeleted = { userId: new ObjectId(userId), chatType: "private", targetUserId: new ObjectId(targetUserId) }
                    break
                case "group":
                    chatToBeDeleted = { userId: new ObjectId(userId), chatType: "group", groupId: new ObjectId(groupId) }
                    break
                case "channel":
                    chatToBeDeleted = { userId: new ObjectId(userId), chatType: "channel", channelId: new ObjectId(channelId) }
                    break
                default:
                    break
            }
            ChatsCollection.deleteOne(chatToBeDeleted).then(deleteResult => {
                if (deleteResult.acknowledged && deleteResult.deletedCount === 1)
                    resolve(true)
            })
        })
    }

    /**
     * Delete a chat of a user using its id
     * @param chatId id of the chat to be deleted
     * @param userId id of user who owns the chat
     * @returns a boolean promise containing the result
     */
    static async deleteChatById(chatId: string, userId: string): Promise<boolean> {
        return new Promise((resolve) => {
            const ChatsCollection = Database.getDatabase().collection<Chat>("Chats")

            ChatsCollection.deleteOne({ _id: new ObjectId(chatId), userId: new ObjectId(userId) }).then(deleteResult => {
                if (deleteResult.acknowledged && deleteResult.deletedCount === 1)
                    resolve(true)
            }).catch(console.log)
        })
    }

    /**
     * Set flags for chat objects like isMuted, isArchived, isPinned
     * @param chatId id of the chat to be updated
     * @param userId id of the user who's chat should be modified
     * @param flagToBeModified type of flag to be modified
     * @param value boolean value to be set
     * @returns a void promise
     */
    static async setChatFlags(chatId: string, userId: string, flagToBeModified: "mute" | "archive" | "pin", value: boolean): Promise<void> {
        return new Promise(resolve => {
            const ChatsCollection = Database.getDatabase().collection<Chat>("Chats")

            const flags: { isMuted?: boolean; isArchived?: boolean; isPinned?: boolean } = {}
            switch (flagToBeModified) {
                case "mute":
                    flags.isMuted = value
                    break
                case "archive":
                    flags.isArchived = value
                    break
                case "pin":
                    flags.isPinned = value
                    break
                default:
                    break
            }

            ChatsCollection.updateOne({ _id: new ObjectId(chatId), userId: new ObjectId(userId) }, { $set: flags }).then(updateResult => {
                if (updateResult.acknowledged)
                    resolve()
            }).catch(console.log)
        })
    }

    /**
     * Set last message for a bulk number of chats.
     * If the chat is private then update chats of two users with upsert option true, if upserted include creation flag in the promise 
     * If the chat is group or channel update all chats that targets to channel or group with last message
     * @param userId id of user who created the message
     * @param chatType type of the chat
     * @param target target data about the receiving target
     * @param messageId id of the message
     * @returns a promise
     */
    static async updateLastMessage(userId: string, chatType: Chat["chatType"], target: TargetData, messageId: ObjectId): Promise<any> {
        return new Promise((resolve) => {
            const ChatsCollection = Database.getDatabase().collection<Chat>("Chats")

            const { targetUserId, groupId, channelId } = target

            let searchFilter: Filter<Chat>
            switch (chatType) {
                case "private":
                    Promise.all([
                        ChatsCollection.updateOne(
                            { userId: new ObjectId(userId), chatType: "private", targetUserId: new ObjectId(targetUserId) },
                            { $set: { lastMessageId: messageId } },
                            { upsert: true }),
                        ChatsCollection.updateOne(
                            { userId: new ObjectId(targetUserId), chatType: "private", targetUserId: new ObjectId(userId) },
                            { $set: { lastMessageId: messageId }, $inc: { unreadMessages: 1 } },
                            { upsert: true })
                    ]).then(([senderUpdateResult, receiverUpdateResult]) => {
                        if (senderUpdateResult.acknowledged && receiverUpdateResult.acknowledged)
                            resolve({
                                isSenderChatCreated: senderUpdateResult.upsertedCount === 1,
                                isReceiverChatCreated: receiverUpdateResult.upsertedCount === 1,
                            })
                    }).catch(console.log)
                    break
                case "group":
                    searchFilter = { chatType: "group", groupId: new ObjectId(groupId) }
                    break
                case "channel":
                    searchFilter = { chatType: "channel", channelId: new ObjectId(channelId) }
                    break
                default:
                    break
            }

            if (searchFilter) {
                ChatsCollection.updateMany(searchFilter, { $set: { lastMessageId: messageId }, $inc: { unreadMessages: 1 } }).then(updateResult => {
                    if (updateResult.acknowledged)
                        resolve(true)
                })
            }
        })
    }
}
