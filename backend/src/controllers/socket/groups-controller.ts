import { Server, Socket } from "socket.io";
import { GroupsSerivce } from "services";
import { ObjectId } from "mongodb";


export default class GroupsController {

    static async createGroup(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { groupName, avatarUrl, userIds } = data

        if (typeof groupName === "string" && groupName.trim() !== "") {
            if (userIds instanceof Array<string>) {
                const validatedUserIds = []

                userIds.forEach(userId => {
                    if (ObjectId.isValid(userId))
                        validatedUserIds.push(userId)
                })

                if (validatedUserIds.length !== 0) {
                    GroupsSerivce.createGroup(userId, groupName, avatarUrl, validatedUserIds)
                        .on("group-created", ({ createdOwnerChat, groupId }) => {
                            io.in(userId).fetchSockets().then(sockets => sockets.forEach(socket => socket.join(groupId)))
                            io.to(userId).emit("new-group-created", createdOwnerChat)
                        })
                        .on("member-chat-created", ({ createdMemberChat, userId, groupId }) => {
                            io.in(userId).fetchSockets().then(sockets => sockets.forEach(socket => socket.join(groupId)))
                            io.to(userId).emit("new-chat-added", createdMemberChat)
                        })
                }
            }
        }
    }

    static async joinGroup(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { groupId } = data

        if (ObjectId.isValid(groupId)) {
            GroupsSerivce.joinGroup(userId, groupId).then(({ createdMemberChat, membersCount }) => {
                io.in(userId).fetchSockets().then(sockets => sockets.forEach(socket => socket.join(groupId)))
                io.to(userId).emit("joined-group", createdMemberChat)
                io.to(groupId).emit("group-members-count-changed", { groupId, membersCount })
            })
        }
    }

    static async addMembers(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { groupId, userIds } = data

        if (ObjectId.isValid(groupId) && userIds instanceof Array<string>) {
            const validatedUserIds = []

            userIds.forEach(userId => {
                if (ObjectId.isValid(userId))
                    validatedUserIds.push(userId)
            })

            if (validatedUserIds.length !== 0) {
                GroupsSerivce.addMembers(userId, groupId, validatedUserIds)
                    .on("members-added", ({ membersCount }) => {
                        clientSocket.emit("members-added", { membersCount })
                        io.to(groupId).emit("group-members-count-changed", { groupId, membersCount })
                    })
                    .on("member-chat-created", ({ createdMemberChat, userId }) => {
                        io.in(userId).fetchSockets().then(sockets => sockets.forEach(socket => socket.join(groupId)))
                        io.to(userId).emit("new-chat-added", createdMemberChat)
                    })
            }
        }
    }

    static async removeMembers(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { groupId, userIds } = data

        if (ObjectId.isValid(groupId) && userIds instanceof Array<string>) {
            const validatedUserIds = []

            userIds.forEach(userId => {
                if (ObjectId.isValid(userId))
                    validatedUserIds.push(userId)
            })

            if (validatedUserIds.length !== 0) {
                GroupsSerivce.removeMembers(userId, groupId, validatedUserIds).then(membersCount => {
                    clientSocket.emit("members-removed", { membersCount })

                    io.to(groupId).emit("group-members-count-changed", { groupId, membersCount })
                    io.in(groupId).fetchSockets().then(sockets => {
                        const removedUserSockets = sockets.filter(socket => validatedUserIds.includes(socket["userId"]))
                        removedUserSockets.forEach(socket => socket.leave(groupId))
                    })

                    io.to(validatedUserIds).emit("removed-from-group", { groupId })
                })
            }
        }
    }

    static async grantGroupAdminPrivileges(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { groupId, userIds } = data

        if (ObjectId.isValid(groupId) && userIds instanceof Array<string>) {
            const validatedUserIds = []

            userIds.forEach(userId => {
                if (ObjectId.isValid(userId))
                    validatedUserIds.push(userId)
            })

            if (validatedUserIds.length !== 0) {
                GroupsSerivce.grantAdminPrivileges(userId, groupId, validatedUserIds)
                    .then(_ => io.to(groupId).emit("group-admin-privileges-added", { groupId, userIds: validatedUserIds }))
            }
        }
    }

    static async revokeGroupAdminPrivileges(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { groupId, userIds } = data

        if (ObjectId.isValid(groupId) && userIds instanceof Array<string>) {
            const validatedUserIds = []

            userIds.forEach(userId => {
                if (ObjectId.isValid(userId))
                    validatedUserIds.push(userId)
            })

            if (validatedUserIds.length !== 0) {
                GroupsSerivce.revokeAdminPrivileges(userId, groupId, validatedUserIds)
                    .then(_ => io.to(groupId).emit("group-admin-privileges-removed", { groupId, userIds: validatedUserIds }))
            }
        }
    }

    static async leaveGroup(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { groupId, chatId } = data

        if (ObjectId.isValid(groupId) && ObjectId.isValid(chatId)) {
            GroupsSerivce.leaveGroup(userId, groupId).then(({ membersCount }) => {
                io.to(userId).emit("left-group", { chatId, groupId })
                io.to(groupId).emit("group-members-count-changed", { groupId, membersCount })
                // leave all user sockets from group
                io.in(userId).fetchSockets().then(sockets => sockets.forEach(socket => socket.leave(groupId)))
            })
        }
    }

    static async updateGroupProfile(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        let { groupId, groupName, groupDescription, avatarUrl } = data

        if (ObjectId.isValid(groupId)) {
            if (typeof groupName === "string" && groupName.trim() !== "") {
                if (!Boolean(groupDescription))
                    groupDescription = ""
                if (!Boolean(avatarUrl))
                    avatarUrl = ""

                GroupsSerivce.updateProfile(userId, groupId, groupName, groupDescription, avatarUrl).then(isUpdated => {
                    if (isUpdated)
                        clientSocket.broadcast.to(groupId).emit("group-profile-updated", { groupId, groupName, groupDescription, avatarUrl })
                })
            }
        }
    }
}