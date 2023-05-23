import Database from "database";
import { ObjectId, WithId } from "mongodb";


export interface GroupMember {
    userId: ObjectId
    groupId: ObjectId
    isAdmin: boolean
}

export default class GroupMembers {

    /**
     * Add a list of users to a group
     * @param userIds id of the users to be added as members
     * @param groupId id of the group in which users should be added
     * @param isAdmin an optional boolean flag makes users admins if true, defaults to false
     * @returns a boolean promise
     */
    static async addMembers(userIds: Array<string>, groupId: string, isAdmin = false) {
        return new Promise<boolean>((resolve) => {
            const GroupMembersCollection = Database.getDatabase().collection<GroupMember>("Group-Members")

            const documents: Array<GroupMember> = userIds.map(userId => {
                return {
                    userId: new ObjectId(userId),
                    groupId: new ObjectId(groupId),
                    isAdmin
                }
            })

            GroupMembersCollection.insertMany(documents).then(result => {
                if (result.acknowledged && result.insertedCount === userIds.length)
                    resolve(true)
            })
        }).catch(console.log)
    }

    /**
     * Remove a list of users from a group
     * @param userIds ids of users who should be deleted from the group
     * @param groupId id of the group from which users have to be removed
     * @returns boolean promise
     */
    static async removeMembers(userIds: Array<string>, groupId: string) {
        return new Promise<boolean>((resolve) => {
            const GroupMembersCollection = Database.getDatabase().collection<GroupMember>("Group-Members")

            const userObjectIds = userIds.map(userId => new ObjectId(userId))

            GroupMembersCollection.deleteMany({
                userId: { $in: userObjectIds },
                groupId: new ObjectId(groupId)
            }).then(result => {
                if (result.acknowledged && result.deletedCount === userIds.length)
                    resolve(true)
            }).catch(console.log)
        })
    }

    /**
     * Modify the admin privileges for a list of members
     * @param userIds ids of users whose privileges should be modified
     * @param groupId id of the group for which the privileges should be modified
     * @param shouldBeAdmins a boolean value that decides the admin status
     * @returns a boolean promise
     */
    static async modifyAdminPrivileges(userIds: Array<string>, groupId: string, shouldBeAdmins: boolean): Promise<boolean> {
        return new Promise((resolve) => {
            const GroupMembersCollection = Database.getDatabase().collection<GroupMember>("Group-Members")

            const userObjectIds = userIds.map(userId => new ObjectId(userId))

            GroupMembersCollection.updateMany({
                userId: { $in: userObjectIds },
                groupId: new ObjectId(groupId)
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
     * Find all group memberships of a user
     * @param userId id of the user whose all memberships should be found
     * @returns the array of all memberships
     */
    static async findMembershipsByUserId(userId: string): Promise<Array<WithId<GroupMember>>> {
        return new Promise((resolve) => {
            const GroupMembersCollection = Database.getDatabase().collection<GroupMember>("Group-Members")
            GroupMembersCollection.find({ userId: new ObjectId(userId) }).toArray()
                .then(memberships => resolve(memberships))
                .catch(console.log)
        })
    }

    /**
     * Find a member of a channel using channelId and userId
     * @param userId id of user who needs to be found
     * @param groupId id of group to check
     * @returns a promise containing the result
     */
    static async findMemberByUserIdAndGroupId(userId: string, groupId: string): Promise<WithId<GroupMember>> {
        return new Promise((resolve) => {
            const GroupMembersCollection = Database.getDatabase().collection<GroupMember>("Group-Members")

            GroupMembersCollection.findOne({ groupId: new ObjectId(groupId), userId: new ObjectId(userId) })
                .then(member => resolve(member))
                .catch(console.log)
        })
    }

    /**
     * Find all members of the group who are contacts of a particular group
     * @param userId id of the user
     * @param groupId id of the group
     * @returns a promise containing the result
     */
    static async fetchMembersOfGroupInContacts(userId: string, groupId: string) {
        return new Promise((resolve) => {
            const GroupMembersCollection = Database.getDatabase().collection<GroupMember>("Group-Members")

            GroupMembersCollection.aggregate([
                { $match: { groupId: new ObjectId(groupId) } },
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
            ]).toArray().then(contactsInGroup => resolve(contactsInGroup)).catch(console.log)
        })
    }

    /**
     * Fetch members of a group based on username or searchname with pagination
     * @param groupId id of the group
     * @param searchName name to be searched
     * @param username username to be searched
     * @param limit limit for no of queries
     * @param skip offset skip limit
     * @returns a promise containing members
     */
    static async fetchMembersOfGroup(groupId: string, searchName: string, username: string, limit: number, skip: number) {
        return new Promise((resolve) => {
            const GroupMembersCollection = Database.getDatabase().collection<GroupMember>("Group-Members")

            const pipeline: any = [
                { $match: { groupId: new ObjectId(groupId) } }
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
                { $addFields: { memberId: "$_id" } },
                { $project: { _id: 0 } }
            )

            GroupMembersCollection.aggregate(pipeline).toArray().then(members => resolve(members)).catch(console.log)
        })
    }
}