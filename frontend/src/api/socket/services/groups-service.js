import { socket } from "../socket"


export default class GroupsService {

    /**
     * Create a group with a group name, avatarUrl and add members to it
     * @param {string} groupName name of the group to be created
     * @param {string} avatarUrl URL of the avatar
     * @param {Array<string>} userIds array of userIds to add a members
     * @returns a promise containing the created group chat
     */
    static async createGroup(groupName, avatarUrl, userIds) {
        return new Promise((resolve) => {
            socket.emit("create-group", { groupName, avatarUrl, userIds })
                .once("new-group-created", groupChat => resolve(groupChat))
        })
    }

    /**
     * Join to a specific group
     * @param {string} groupId of the group to join
     */
    static async joinGroup(groupId) {
        socket.emit("join-group", { groupId })
    }

    /**
     * Add users as members of a group
     * @param {string} groupId id of the group in which users are to be added
     * @param {Array<string>} userIds array of userIds to add as members
     * @returns a promise
     */
    static async addMembers(groupId, userIds) {
        return new Promise((resolve) => {
            socket.emit("add-members", { groupId, userIds })
                .once("members-added", ({ membersCount }) => resolve({ membersCount }))
        })
    }

    /**
     * Remove users from a group
     * @param {string} groupId id of the group from which members should be removed
     * @param {Array<string>} userIds array of userIds who needs to be removed
     */
    static async removeMembers(groupId, userIds) {
        return new Promise((resolve) => {
            socket.emit("remove-members", { groupId, userIds })
                .once("members-removed", ({ membersCount }) => resolve({ membersCount }))
        })
    }

    /**
     * Grant admin privileges for a list of users in a group
     * @param {string} groupId id of the group
     * @param {Array<string>} userIds array of userIds
     */
    static async grantAdminPrivileges(groupId, userIds) {
        socket.emit("grant-group-admin-privileges", { groupId, userIds })
    }

    /**
     * Revoke admin privileges for a list of users in a group
     * @param {string} groupId id of the group
     * @param {Array<string>} userIds array of userIds
     */
    static async revokeAdminPrivileges(groupId, userIds) {
        socket.emit("revoke-group-admin-privileges", { groupId, userIds })
    }

    /**
     * Leave from a group and delete user's chat that references the group
     * @param {string} chatId id of the chat that references the group
     * @param {string } groupId id of the group to leave
     */
    static async leaveGroup(chatId, groupId) {
        socket.emit("leave-group", { chatId, groupId })
    }

    /**
     * Updates the group profile on the server
     * @param {string} groupId if of the group to be updated
     * @param {string} groupName new name of the group
     * @param {string} groupDescription new group description
     * @param {string} avatarUrl new public access url of the group
     */
    static async updateGroupProfile(groupId, groupName, groupDescription, avatarUrl) {
        socket.emit("update-group-profile", { groupId, groupName, groupDescription, avatarUrl })
    }
}