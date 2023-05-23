import Database from "database"
import { Filter, ObjectId, UpdateFilter, WithId } from "mongodb"

export interface Message {
    messageType: "private" | "group" | "channel"
    senderId: ObjectId
    receiverId?: ObjectId
    groupId?: ObjectId
    channelId?: ObjectId
    contentType?: string
    content?: string | ObjectId
    timestamp?: Date
    isReceived?: boolean
    isSeen?: boolean
}

interface TargetData {
    receiverId?: string
    groupId?: string
    channelId?: string
}
/**
 * Class to interact with the 'Messages' collection
 */
export default class Messages {

    static async getMessagesOf(senderId: string, messageType: Message["messageType"], target: TargetData, before?: string, after?: string): Promise<Array<any>> {
        return new Promise(resolve => {
            const MessagesCollection = Database.getDatabase().collection<Message>("Messages")

            const { receiverId, groupId, channelId } = target

            const pipeline = []
            const userLookup = {
                $lookup: {
                    from: "Users",
                    localField: "senderId",
                    foreignField: "_id",
                    as: "sender",
                    pipeline: [
                        { $addFields: { userId: "$_id" } },
                        { $project: { _id: 0, userId: 1, firstName: 1, lastName: 1 } }
                    ]
                }
            }

            switch (messageType) {
                case "private":
                    pipeline.push(
                        {
                            $match: {
                                $or: [
                                    { senderId: new ObjectId(senderId), receiverId: new ObjectId(receiverId) },
                                    { senderId: new ObjectId(receiverId), receiverId: new ObjectId(senderId) }
                                ]
                            }
                        }
                    )
                    break
                case "group":
                    pipeline.push(
                        { $match: { groupId: new ObjectId(groupId) } },
                        userLookup,
                        { $unwind: { path: "$sender", preserveNullAndEmptyArrays: true } }
                    )
                    break
                case "channel":
                    pipeline.push(
                        { $match: { channelId: new ObjectId(channelId) } },
                        userLookup,
                        { $unwind: { path: "$sender", preserveNullAndEmptyArrays: true } }
                    )
                    break
                default:
                    break
            }
            pipeline.push(
                { $sort: { _id: -1 } },
                { $addFields: { messageId: "$_id", isSent: true } },
                { $project: { _id: 0 } }
            )

            if (before || after) {
                pipeline[0].$match._id = {}

                if (before)
                    pipeline[0].$match._id.$lt = new ObjectId(before)
                if (after)
                    pipeline[0].$match._id.$gte = new ObjectId(after)
            }

            pipeline.push({ $limit: 20 })

            MessagesCollection.aggregate(pipeline).toArray().then(messages => resolve(messages)).catch(console.log)
        })
    }

    static async createMessage(senderId: string, messageType: Message["messageType"], target: TargetData, contentType: Message["contentType"], content: Message["content"]): Promise<WithId<Message>> {
        return new Promise(resolve => {
            const MessagesCollection = Database.getDatabase().collection<Message>("Messages")
            const { receiverId, groupId, channelId } = target

            let messageToBeInserted: Message
            switch (messageType) {
                case "private":
                    messageToBeInserted = { senderId: new ObjectId(senderId), messageType: "private", receiverId: new ObjectId(receiverId), isReceived: false, isSeen: false }
                    break
                case "group":
                    messageToBeInserted = { senderId: new ObjectId(senderId), messageType: "group", groupId: new ObjectId(groupId) }
                    break
                case "channel":
                    messageToBeInserted = { senderId: new ObjectId(senderId), messageType: "channel", channelId: new ObjectId(channelId) }
                    break
            }
            messageToBeInserted.contentType = contentType
            messageToBeInserted.content = content
            messageToBeInserted.timestamp = new Date()

            MessagesCollection.insertOne(messageToBeInserted).then(insertResult => {
                if (insertResult.acknowledged) {
                    MessagesCollection.findOne({ _id: insertResult.insertedId }).then(resolve).catch(console.log)
                }
            }).catch(console.log)
        })
    }


    /**
     * Update message delivery status like received, seen etc
     * @param senderId id of the user who sent the message
     * @param target data about target receiver, group or channel
     * @param messageIds ids of messages that need to be updated
     * @param type delivery flag received or seen
     * @returns a boolean promise whether updated or not
     */
    static async setDeliveryStatus(senderId: string, target: TargetData, messageIds: Array<string>, type: "received" | "seen"): Promise<boolean> {
        return new Promise((resolve) => {
            const MessagesCollection = Database.getDatabase().collection<Message>("Messages")

            const { receiverId } = target
            const objectIds = messageIds.map(messageId => new ObjectId(messageId))

            const searchFilter: Filter<Message> = {
                _id: { $in: objectIds },
                senderId: new ObjectId(senderId),
                receiverId: new ObjectId(receiverId)
            }
            let updateFilter: UpdateFilter<Message>
            switch (type) {
                case "received":
                    updateFilter = { $set: { isReceived: true } }
                    break
                case "seen":
                    updateFilter = { $set: { isSeen: true } }
                    break
                default:
                    updateFilter = {}
                    break
            }

            MessagesCollection.updateMany(searchFilter, updateFilter).then(updateResult => {
                if (updateResult.acknowledged)
                    resolve(true)
            }).catch(console.log)
        })
    }

    /**
     * Delete a list of messages sent by a sender using messageIds and senderId
     * @param senderId userId of sender
     * @param messageIds array of messageIds to be deleted
     * @param force flag if true deletes messages with ids irrespective of senderId
     * @returns a boolean promise
     */
    static async deleteMessagesByIds(senderId: string, messageIds: Array<string>, force: boolean = false): Promise<boolean> {
        return new Promise((resolve) => {
            const MessagesCollection = Database.getDatabase().collection<Message>("Messages")

            const messageObjectIds = messageIds.map(messageId => new ObjectId(messageId))

            let filter: Filter<Message> = { _id: { $in: messageObjectIds }, senderId: new ObjectId(senderId) }

            if (force) {
                delete filter.senderId
            }

            MessagesCollection.deleteMany(filter).then(deleteResult => {
                if (deleteResult.acknowledged)
                    resolve(true)
            })
        })
    }
}