import { ObjectId } from "mongodb";
import { ChannelsService } from "services";
import { Server, Socket } from "socket.io";


export default class ChannelsController {

    static async createChannel(clientSocket: Socket, io: Server, data: any) {

        const userId = clientSocket["userId"]
        const { channelName, channelDescription, avatarUrl } = data

        if (typeof channelName === "string" && channelName.trim() !== "") {
            if (typeof channelDescription === "string" && typeof avatarUrl === "string") {
                ChannelsService.createChannel(userId, channelName, channelDescription, avatarUrl).then(({ createdOwnerChat, channelId }) => {
                    io.in(userId).fetchSockets().then(sockets => sockets.forEach(socket => socket.join(channelId)))
                    io.to(userId).emit("new-channel-created", createdOwnerChat)
                })
            }
        }
    }

    static async subscribeToChannel(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { channelId } = data

        if (ObjectId.isValid(channelId)) {
            ChannelsService.subscribeChannel(userId, channelId)
                .then(({ createdSubscriberChat, subscribersCount }) => {
                    io.in(userId).fetchSockets().then(sockets => sockets.forEach(socket => socket.join(channelId)))
                    io.to(userId).emit("subscribed-to-channel", createdSubscriberChat)
                    io.to(channelId).emit("channel-subscribers-count-changed", { channelId, subscribersCount })
                })
        }
    }

    static async addSubscribers(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { channelId, userIds } = data

        if (ObjectId.isValid(channelId) && userIds instanceof Array<string>) {
            const validatedUserIds = []

            userIds.forEach(userId => {
                if (ObjectId.isValid(userId))
                    validatedUserIds.push(userId)
            })

            if (validatedUserIds.length !== 0) {
                ChannelsService.addSubscribers(userId, channelId, validatedUserIds)
                    .on("subscribers-added", ({ subscribersCount }) => {
                        clientSocket.emit("subscribers-added", { subscribersCount })
                        io.to(channelId).emit("channel-subscribers-count-changed", { channelId, subscribersCount })
                    })
                    .on("subscriber-chat-created", ({ createdSubscriberChat, userId }) => {
                        io.in(userId).fetchSockets().then(sockets => sockets.forEach(socket => socket.join(channelId)))
                        io.to(userId).emit("new-chat-added", createdSubscriberChat)
                    })
            }
        }
    }

    static async removeSubscribers(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { channelId, userIds } = data

        if (ObjectId.isValid(channelId) && userIds instanceof Array<string> && userIds.length !== 0) {
            const validatedUserIds = []

            userIds.forEach(userId => {
                if (ObjectId.isValid(userId))
                    validatedUserIds.push(userId)
            })

            if (validatedUserIds.length !== 0) {
                ChannelsService.removeSubscribers(userId, channelId, validatedUserIds).then(subscribersCount => {
                    clientSocket.emit("subscribers-removed", { subscribersCount })

                    io.to(channelId).emit("channel-subscribers-count-changed", { channelId, subscribersCount })
                    io.in(channelId).fetchSockets().then(sockets => {
                        const removedUserSockets = sockets.filter(socket => validatedUserIds.includes(socket["userId"]))
                        removedUserSockets.forEach(socket => socket.leave(channelId))
                    })

                    io.to(validatedUserIds).emit("removed-from-channel", { channelId })
                })
            }
        }
    }

    static async grantChannelAdminPrivileges(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { channelId, userIds } = data

        if (ObjectId.isValid(channelId) && userIds instanceof Array<string>) {
            const validatedUserIds = []

            userIds.forEach(userId => {
                if (ObjectId.isValid(userId))
                    validatedUserIds.push(userId)
            })

            if (validatedUserIds.length !== 0) {
                ChannelsService.grantAdminPrivileges(userId, channelId, validatedUserIds)
                    .then(_ => io.to(channelId).emit("channel-admin-privileges-added", { channelId, userIds: validatedUserIds }))
            }
        }
    }

    static async revokeChannelAdminPrivileges(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { channelId, userIds } = data

        if (ObjectId.isValid(channelId) && userIds instanceof Array<string>) {
            const validatedUserIds = []

            userIds.forEach(userId => {
                if (ObjectId.isValid(userId))
                    validatedUserIds.push(userId)
            })

            if (validatedUserIds.length !== 0) {
                ChannelsService.revokeAdminPrivileges(userId, channelId, validatedUserIds)
                    .then(_ => io.to(channelId).emit("channel-admin-privileges-removed", { channelId, userIds: validatedUserIds }))
            }
        }
    }

    static async leaveChannel(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { chatId, channelId } = data

        if (ObjectId.isValid(channelId) && ObjectId.isValid(chatId)) {
            ChannelsService.leaveChannel(userId, channelId).then(({ subscribersCount }) => {
                io.to(userId).emit("left-channel", { chatId, channelId })
                io.to(channelId).emit("channel-subscribers-count-changed", { channelId, subscribersCount })
                // leave all user sockets from channel
                io.in(userId).fetchSockets().then(sockets => sockets.forEach(socket => socket.leave(channelId)))
            })
        }
    }

    static async updateChannelProfile(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        let { channelId, channelName, channelDescription, avatarUrl } = data

        if (ObjectId.isValid(channelId)) {
            if (typeof channelName === "string" && channelName.trim() !== "") {
                if (!Boolean(channelDescription))
                    channelDescription = ""
                if (!Boolean(avatarUrl))
                    avatarUrl = ""

                ChannelsService.updateProfile(userId, channelId, channelName, channelDescription, avatarUrl).then(isUpdated => {
                    if (isUpdated)
                        clientSocket.broadcast.to(channelId).emit("channel-profile-updated", { channelId, channelName, channelDescription, avatarUrl })
                })
            }
        }
    }
}