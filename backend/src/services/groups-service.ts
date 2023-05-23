import { Chats, GroupMembers, Groups } from "models";
import { EventEmitter } from "events"


export default class GroupsSerivce {

    /**
     * Create a group with specific name and add given userIds as members.
     * @param userId id of the logged user
     * @param groupName name of the group to be created
     * @param avatarUrl url of group's avatar
     * @param userIds array of userId to be added as members
     * @returns event emitter that responds to chat creation events
     */
    static createGroup(userId: string, groupName: string, avatarUrl: string, userIds: Array<string>) {
        const emitter = new EventEmitter()

        Groups.createGroup(userId, groupName, "", avatarUrl, userIds.length + 1).then(createdGroupId => {
            const groupId = createdGroupId.toString()

            // add creating user as member with admin previleges and create his chat
            GroupMembers.addMembers([userId], groupId, true).then(_ => {
                // create chat for creator and emit
                Chats.createChat(userId, "group", { groupId }).then(createdOwnerChat => {
                    emitter.emit("group-created", { createdOwnerChat, groupId })
                })
            })

            // add other members without admin privileges and create their chats
            GroupMembers.addMembers(userIds, groupId).then(_ => {
                // create chat for each members and emit
                userIds.forEach(userId => {
                    Chats.createChat(userId, "group", { groupId }).then(createdMemberChat => {
                        emitter.emit("member-chat-created", { createdMemberChat, userId, groupId })
                    })
                })
            })
        })

        return emitter
    }

    /**
     * Make user join a particular group. After joining group create chat and resolve it.
     * @param userId id of logged user
     * @param groupId id of group to join
     * @returns a promise containing created chat
     */
    static async joinGroup(userId: string, groupId: string): Promise<any> {
        return new Promise((resolve) => {
            GroupMembers.findMemberByUserIdAndGroupId(userId, groupId).then(member => {
                if (!Boolean(member)) {
                    Promise.all([
                        GroupMembers.addMembers([userId], groupId),
                        Groups.incrementMemberCount(groupId, 1)
                    ]).then(([isMemberAdded, membersCount]) => {
                        if (isMemberAdded)
                            Chats.createChat(userId, "group", { groupId })
                                .then((createdMemberChat) => resolve({ createdMemberChat, membersCount }))
                    })
                }
            })
        })
    }

    /**
     * Add a list of users to a group as members
     * @param userId id of the logged user
     * @param groupId id of the group
     * @param userIds array of userIds to add
     */
    static addMembers(userId: string, groupId: string, userIds: Array<string>) {
        const emitter = new EventEmitter()

        GroupMembers.findMemberByUserIdAndGroupId(userId, groupId).then(member => {
            // if logged user is admin of the group, then add users
            if (member && member.isAdmin) {
                Promise.all([
                    GroupMembers.addMembers(userIds, groupId),
                    Groups.incrementMemberCount(groupId, userIds.length)
                ]).then(([areMembersAdded, membersCount]) => {
                    if (areMembersAdded) {
                        // emit added
                        emitter.emit("members-added", { membersCount })
                        // create chat for each added user and emit
                        userIds.forEach(userId => {
                            Chats.createChat(userId, "group", { groupId }).then(createdMemberChat => {
                                emitter.emit("member-chat-created", { createdMemberChat, userId, groupId })
                            })
                        })
                    }
                })
            }
        })

        return emitter
    }

    /**
     * Remvove a list of users from a group
     * @param userId id of the logged user
     * @param groupId id of the group
     * @param userIds array of userIds to remove from the group
     * @returns a promise containing membersCount after removal
     */
    static async removeMembers(userId: string, groupId: string, userIds: Array<string>): Promise<number> {
        return new Promise((resolve) => {
            GroupMembers.findMemberByUserIdAndGroupId(userId, groupId).then(member => {
                // if logged user is admin of the group then remove users
                if (member && member.isAdmin) {
                    Promise.all([
                        GroupMembers.removeMembers(userIds, groupId),
                        Groups.incrementMemberCount(groupId, -(userIds.length))
                    ]).then(([areMembersRemoved, membersCount]) => {
                        if (areMembersRemoved) {
                            userIds.forEach(userId => Chats.deleteChat(userId, "group", { groupId }))
                            resolve(membersCount)
                        }
                    })
                }
            })
        })
    }

    /**
     * Grant admin privileges to an list of members
     * @param userId id of loggged user
     * @param groupId id of the group
     * @param userIds array of usersIds to make as admins
     * @returns a boolean promise
     */
    static async grantAdminPrivileges(userId: string, groupId: string, userIds: Array<string>): Promise<boolean> {
        return new Promise((resolve) => {
            // find logged user's membership
            GroupMembers.findMemberByUserIdAndGroupId(userId, groupId).then(member => {
                // if user is a member and also admin of the group
                if (member && member.isAdmin) {
                    GroupMembers.modifyAdminPrivileges(userIds, groupId, true)
                        .then(isModified => resolve(isModified))
                }
            })
        })
    }

    /**
     * Revoke admin privileges for a list of members
     * @param userId id of the logged user
     * @param groupId id of the group
     * @param userIds array of userIds to revoke admin privileges
     * @returns a boolean promise
     */
    static async revokeAdminPrivileges(userId: string, groupId: string, userIds: Array<string>): Promise<boolean> {
        return new Promise((resolve) => {
            // find logged user's membership
            GroupMembers.findMemberByUserIdAndGroupId(userId, groupId).then(member => {
                // if user is member and also admin
                if (member && member.isAdmin) {
                    GroupMembers.modifyAdminPrivileges(userIds, groupId, false)
                    .then(isModified => resolve(isModified))
                }
            })
        })
    }

    /**
     * Remove the logged user from a specific group.
     * @param userId id of the logged user
     * @param groupId id of the group
     * @returns a promise containing the new member count after leaving
     */
    static async leaveGroup(userId: string, groupId: string): Promise<any> {
        return new Promise((resolve) => {
            GroupMembers.findMemberByUserIdAndGroupId(userId, groupId).then(member => {
                // if user is a member then leave
                if (member) {
                    Promise.all([
                        GroupMembers.removeMembers([userId], groupId),
                        Groups.incrementMemberCount(groupId, -1),
                        Chats.deleteChat(userId, "group", { groupId })
                    ]).then(([isMemberRemoved, membersCount, isChatDeleted]) => {
                        if (isMemberRemoved && isChatDeleted)
                            resolve({ membersCount })
                    })
                }
            })
        })
    }

    static async getMembershipsOfUser(userId: string) {
        return GroupMembers.findMembershipsByUserId(userId)
    }

    static async fetchContactsInGroup(userId: string, groupId: string) {
        return GroupMembers.fetchMembersOfGroupInContacts(userId, groupId)
    }

    static async fetchMembers(userId: string, groupId: string, query: string, skip: number) {
        return new Promise((resolve) => {
            let searchName = null
            let username = null

            if (query.trim() !== "") {
                if (query.startsWith("@"))
                    username = query.substring(1)
                else
                    searchName = query
            }

            GroupMembers.fetchMembersOfGroup(groupId, searchName, username, 20, skip)
                .then(members => resolve(members))
        })
    }

    /**
     * Update a group profile with new name, description and avatarUrl
     * @param userId id of the logged user
     * @param groupId id of the group
     * @param groupName new name for the group
     * @param groupDescription new description for the group
     * @param avatarUrl new avatarUrl for the group
     * @returns a boolean promise
     */
    static async updateProfile(userId: string, groupId: string, groupName: string, groupDescription: string, avatarUrl: string): Promise<boolean> {
        return new Promise((resolve) => {
            GroupMembers.findMemberByUserIdAndGroupId(userId, groupId).then(member => {
                // if the user is a member and also group admin update profile
                if (member && member.isAdmin) {
                    Groups.updateProfile(groupId, groupName, groupDescription, avatarUrl)
                        .then(isUpdated => resolve(isUpdated))
                } else {
                    resolve(false)
                }
            })
        })
    }
}