import Database from "database";
import { ObjectId, WithId } from "mongodb";


export interface ChannelSubscriber {
    userId: ObjectId
    channelId: ObjectId
    isAdmin: boolean
}

export default class ChannelSubscribers {
    /**
     * Add a list of users as subscribers to a channel
     * @param userIds id of the users to be added as subscribers
     * @param channelId id of the channel in which users should be added
     * @param isAdmin an optional boolean flag makes users admins if true, defaults to false
     * @returns a boolean promise
     */
    static async addSubscribers(userIds: Array<string>, channelId: string, isAdmin = false) {
        return new Promise((resolve) => {
            const ChannelSubscribersCollection = Database.getDatabase().collection<ChannelSubscriber>("Channel-Subscribers")

            const documents: Array<ChannelSubscriber> = userIds.map(userId => {
                return {
                    userId: new ObjectId(userId),
                    channelId: new ObjectId(channelId),
                    isAdmin
                }
            })

            ChannelSubscribersCollection.insertMany(documents).then(result => {
                if (result.acknowledged && result.insertedCount === userIds.length)
                    resolve(true)
            })
        }).catch(console.log)
    }

    /**
     * Remove a list of subscribers from the channel
     * @param userIds userIds of subscribers who should be deleted from the group
     * @param channelId id of the channel from which subscribers have to be deleted
     * @returns boolean promise
     */
    static async removeSubscribers(userIds: Array<string>, channelId: string): Promise<boolean> {
        return new Promise((resolve) => {
            const ChannelSubscribersCollection = Database.getDatabase().collection<ChannelSubscriber>("Channel-Subscribers")

            const userObjectIds = userIds.map(userId => new ObjectId(userId))

            ChannelSubscribersCollection.deleteMany({
                userId: { $in: userObjectIds },
                channelId: new ObjectId(channelId)
            }).then(result => {
                if (result.acknowledged && result.deletedCount === userIds.length)
                    resolve(true)
            }).catch(console.log)
        })
    }

    /**
     * Modify the admin privileges for a list of subscribers
     * @param userIds userIds of subscribers whose privileges should be modified
     * @param channelId id of the channel for which the privileges should be modified
     * @param shouldBeAdmins a boolean value that decides the admin status
     * @returns a boolean promise
     */
    static async modifyAdminPrivileges(userIds: Array<string>, channelId: string, shouldBeAdmins: boolean): Promise<boolean> {
        return new Promise((resolve) => {
            const ChannelSubscribersCollection = Database.getDatabase().collection<ChannelSubscriber>("Channel-Subscribers")

            const userObjectIds = userIds.map(userId => new ObjectId(userId))

            ChannelSubscribersCollection.updateMany({
                userId: { $in: userObjectIds },
                channelId: new ObjectId(channelId)
            }, {
                $set: {
                    isAdmin: shouldBeAdmins
                }
            }).then(result => {
                if (result.acknowledged && result.modifiedCount === userIds.length)
                    resolve(true)
            }).catch(console.log)
        })
    }

    /**
     * Find all subscriptions of a user
     * @param userId id of the user whose subscriptions need to be found
     * @returns a promise containing subscriptions of user
     */
    static async findSubscriptionsByUserId(userId: string): Promise<Array<WithId<ChannelSubscriber>>> {
        return new Promise((resolve) => {
            const ChannelSubscribersCollection = Database.getDatabase().collection<ChannelSubscriber>("Channel-Subscribers")
            ChannelSubscribersCollection.find({ userId: new ObjectId(userId) }).toArray()
                .then(subscriptions => resolve(subscriptions))
                .catch(console.log)
        })
    }

    /**
     * Find a subscriber of a channel using channelId and his userId
     * @param userId id of the user
     * @param channelId id of the channel
     * @returns a promise containing the result
     */
    static async findSubscriberByUserIdAndChannelId(userId: string, channelId: string): Promise<WithId<ChannelSubscriber>> {
        return new Promise((resolve) => {
            const ChannelSubscribersCollection = Database.getDatabase().collection<ChannelSubscriber>("Channel-Subscribers")

            ChannelSubscribersCollection.findOne({ channelId: new ObjectId(channelId), userId: new ObjectId(userId) })
                .then(subscriber => resolve(subscriber))
                .catch(console.log)
        })
    }

    /**
     * Find all subscribers of a channel who are contacts of a particular user
     * @param userId id of the user
     * @param channelId id of the channel
     * @returns a promise containing result
     */
    static async findSubscribersOfChannelInContacts(userId: string, channelId: string) {
        return new Promise((resolve) => {
            const ChannelSubscribersCollection = Database.getDatabase().collection("Channel-Subscribers")

            ChannelSubscribersCollection.aggregate([
                { $match: { channelId: new ObjectId(channelId) } },
                {
                    $lookup: {
                        from: "Contacts",
                        localField: "userId",
                        foreignField: "targetUserId",
                        as: "contact",
                        pipeline: [
                            { $match: { userId: new ObjectId(userId) } },
                            { $project: { _id: 0, firstName: 1, lastName: 1 } }
                        ]
                    }
                },
                { $unwind: "$contact" },
                {
                    $lookup: {
                        from: "Users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "targetUser",
                        pipeline: [
                            { $project: { _id: 0, avatarUrl: 1 } }
                        ]
                    }
                },
                { $unwind: "$targetUser" },
                { $project: { _id: 0 } }
            ]).toArray().then(contactsInChannel => resolve(contactsInChannel)).catch(console.log)
        })
    }

    /**
     * Fetch subscribers of a channel based on username or searchname with pagination
     * @param channelId id of the channel
     * @param searchName name to be searched
     * @param username username to be searched
     * @param limit limit for no of queries
     * @param skip offset skip limit
     * @returns a promise containing subscribers
     */
    static async fetchSubscribersOfChannel(channelId: string, searchName: string, username: string, limit: number, skip: number) {
        return new Promise((resolve) => {
            const ChannelSubscribersCollection = Database.getDatabase().collection("Channel-Subscribers")

            const pipeline: any = [
                { $match: { channelId: new ObjectId(channelId) } }
            ]

            const userLookup: any = {
                $lookup: {
                    from: "Users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "targetUser",
                    pipeline: [
                        { $project: { _id: 0, firstName: 1, lastName: 1, username: 1, avatarUrl: 1 } }
                    ]
                }
            }

            // if user searches using username update pipeline for exact match of username
            if (Boolean(username)) {
                userLookup.$lookup.pipeline.push({ $match: { username } })
            } else if (Boolean(searchName)) {
                // else if user searches using searchname update pipeline to use firstname and lastname regex search
                userLookup.$lookup.pipeline.push({
                    $match: {
                        $or: [
                            { firstName: { $regex: searchName, $options: "i" } },
                            { lastName: { $regex: searchName, $options: "i" } }
                        ]
                    }
                })
            }

            pipeline.push(
                userLookup,
                { $unwind: "$targetUser" },
                { $skip: skip },
                { $limit: limit },
                { $addFields: { subscriberId: "$_id" } },
                { $project: { _id: 0 } }
            )

            ChannelSubscribersCollection.aggregate(pipeline).toArray().then(subscribers => resolve(subscribers)).catch(console.log)
        })
    }
}