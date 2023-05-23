import Database from "database"
import { ObjectId, WithId } from "mongodb"


export interface Group {
    groupName: string
    groupDescription?: string
    avatarUrl?: string
    groupCreatorId: ObjectId
    visibility: "private" | "public"
    membersCount: number
}

/**
 * Class to interact with the 'Groups' collection
 */
export default class Groups {

    /**
     * Create a group with details and return ObjectId
     * @param userId id of the user who creates group
     * @param groupName name of the group
     * @param groupDescription description of the group
     * @param avatarUrl url of the group
     * @param membersCount count of the members initially added
     * @returns a promise containing ObjectId
     */
    static async createGroup(userId: string, groupName: string, groupDescription: string, avatarUrl: string, membersCount: number): Promise<ObjectId> {
        return new Promise((resolve) => {
            const GroupsCollection = Database.getDatabase().collection<Group>("Groups")

            GroupsCollection.insertOne({
                groupName,
                groupDescription,
                avatarUrl,
                visibility: "private",
                groupCreatorId: new ObjectId(userId),
                membersCount
            }).then(insertResult => {
                if (insertResult.acknowledged)
                    resolve(insertResult.insertedId)
            }).catch(console.log)
        })
    }

    /**
     * Get the data of a group in perspective of a particular user
     * @param groupId id of the group needs to be searched
     * @param userId if of user in whose perspective the result should be
     * @returns a promise containing the group or null
     */
    static async getGroup(groupId: string, userId: string) {
        return new Promise((resolve) => {
            const GroupsCollection = Database.getDatabase().collection<Group>("Groups")
            GroupsCollection.aggregate([
                { $match: { _id: new ObjectId(groupId) } },
                {
                    $lookup: {
                        from: "Group-Members",
                        as: "membership",
                        pipeline: [
                            { $match: { userId: new ObjectId(userId), groupId: new ObjectId(groupId) } },
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
            ]).toArray()
                .then(groups => resolve(groups[0]))
                .catch(console.log)
        })
    }

    /**
     * Increment or decrement members count of a group
     * @param groupId id of the group to be updated
     * @param value value, positive for increment and negative for decrement
     * @returns a promise containing the new member count
     */
    static async incrementMemberCount(groupId: string, value: number): Promise<number> {
        return new Promise((resolve) => {
            const GroupsCollection = Database.getDatabase().collection<Group>("Groups")

            GroupsCollection.findOneAndUpdate({
                _id: new ObjectId(groupId)
            }, {
                $inc: { membersCount: value }
            }).then(result => {

                if (result.value.membersCount + value === 0)
                    GroupsCollection.deleteOne({ _id: result.value._id })

                if (result.ok)
                    resolve(result.value.membersCount + value)
            })
        })
    }

    /**
     * Update the group name, description and avatar
     * @param groupId id of the group to be updated
     * @param groupName new name of the group
     * @param groupDescription new description of the group
     * @param avatarUrl new avatarUrl of the group
     * @returns a boolean promise
     */
    static async updateProfile(groupId: string, groupName: string, groupDescription: string, avatarUrl: string): Promise<boolean> {
        return new Promise((resolve) => {
            const GroupsCollection = Database.getDatabase().collection<Group>("Groups")

            GroupsCollection.updateOne({ _id: new ObjectId(groupId) }, { $set: { groupName, groupDescription, avatarUrl } }).then(updateResult => {
                if (updateResult.acknowledged && updateResult.modifiedCount === 1)
                    resolve(true)
            }).catch(console.log)
        })
    }

    static async searchGroupsByName(query: string): Promise<Array<WithId<Group>>> {
        return new Promise((resolve) => {
            const GroupsCollection = Database.getDatabase().collection<Group>("Groups")

            GroupsCollection.find({ groupName: { $regex: query, $options: "i" } }).toArray().then(groups => resolve(groups)).catch(console.log)
        })
    }
}