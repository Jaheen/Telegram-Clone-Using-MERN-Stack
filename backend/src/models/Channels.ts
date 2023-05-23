import Database from "database"
import { ObjectId, WithId } from "mongodb"


export interface Channel {
    channelName: string
    channelDescription?: string
    avatarUrl?: string
    channelCreatorId: ObjectId
    visibility: "private" | "public"
    subscribersCount: number
}

/**
 * Class to interact with 'Channels' collection
 */
export default class Channels {

    /**
     * Create a new channel with details and return ObjectId
     * @param userId id of user who creates the channel
     * @param channelName name of the channel
     * @param channelDescription description of the channel
     * @param avatarUrl avatar url of channel
     * @returns a promise containing id of newly created channel
     */
    static async createChannel(userId: string, channelName: string, channelDescription: string, avatarUrl: string): Promise<ObjectId> {
        return new Promise((resolve) => {
            const ChannelsCollection = Database.getDatabase().collection<Channel>("Channels")

            ChannelsCollection.insertOne({
                channelName,
                channelDescription,
                avatarUrl,
                channelCreatorId: new ObjectId(userId),
                visibility: "private",
                subscribersCount: 1
            }).then(insertResult => {
                if (insertResult.acknowledged) {
                    resolve(insertResult.insertedId)
                }
            }).catch(console.log)
        })
    }

    /**
     * Get the details of a channel in respect to a user with additional fields regarding the user
     * @param channelId id of the channel that needs to be fetched
     * @param userId id of the user with whose prespective the aggregation should be performed
     * @returns a promise containing the channel data
     */
    static async getChannel(channelId: string, userId: string): Promise<object> {
        return new Promise((resolve) => {
            const ChannelsCollection = Database.getDatabase().collection<Channel>("Channels")

            ChannelsCollection.aggregate([
                { $match: { _id: new ObjectId(channelId) } },
                {
                    $lookup: {
                        from: "Group-Subscribers",
                        as: "subscription",
                        pipeline: [
                            { $match: { userId: new ObjectId(userId), channelId: new ObjectId(channelId) } },
                            { $project: { _id: 0 } }
                        ]
                    }
                },
                { $unwind: { path: "$subscription", preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        channelId: "$_id"
                    }
                },
                { $project: { _id: 0 } }
            ]).toArray()
                .then(chats => resolve(chats[0]))
                .catch(console.log)
        })
    }

    /**
     * Increment or decrement subscribers count of a channel
     * @param channelId id of the channel to be updated
     * @param value value, positive for increment and negative for decrement
     * @returns a boolean promise
     */
    static async incrementSubscribersCount(channelId: string, value: number): Promise<number> {
        return new Promise((resolve) => {
            const ChannelsCollection = Database.getDatabase().collection<Channel>("Channels")

            ChannelsCollection.findOneAndUpdate({
                _id: new ObjectId(channelId)
            }, {
                $inc: { subscribersCount: value }
            }).then(result => {

                if (result.value.subscribersCount + value === 0)
                    ChannelsCollection.deleteOne({ _id: result.value._id })

                if (result.ok)
                    resolve(result.value.subscribersCount + value)
            })
        })
    }

    /**
     * Update the channel name, description and avatar
     * @param channelId id of the channel
     * @param channelName new name of the channel
     * @param channelDescription new description of the channel
     * @param avatarUrl new avatarUrl of the channel
     * @returns a boolean promise
     */
    static async updateProfile(channelId: string, channelName: string, channelDescription: string, avatarUrl: string): Promise<boolean> {
        return new Promise((resolve) => {
            const ChannelsCollection = Database.getDatabase().collection<Channel>("Channels")

            ChannelsCollection.updateOne({ _id: new ObjectId(channelId) }, { $set: { channelName, channelDescription, avatarUrl } }).then(updateResult => {
                if (updateResult.acknowledged && updateResult.modifiedCount === 1)
                    resolve(true)
            }).catch(console.log)
        })
    }

    static async searchChannelByName(query: string): Promise<Array<WithId<Channel>>> {
        return new Promise((resolve) => {
            const ChannelsCollection = Database.getDatabase().collection<Channel>("Channels")

            ChannelsCollection.find({ channelName: { $regex: query, $options: "i" } }).toArray().then(channels => resolve(channels)).catch(console.log)
        })
    }
}