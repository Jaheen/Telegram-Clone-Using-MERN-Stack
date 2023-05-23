import { ChannelsController, ChatsController, ConnectionController, ContactsController, GroupsController, MessagingController } from "controllers/socket"
import { Server as HTTPServer } from "http"
import SocketIOAuthMiddleware from "middlewares/socket-auth-middleware"
import { Server as SocketIOServer, Socket } from "socket.io"

/**
 * Initalize socket.io server and setup listeners for all events
 * @param server HTTP Server instance
 */
export default function initSocketIO(server: HTTPServer) {
    const io = new SocketIOServer(server, {
        cors: {}
    })

    io.use(SocketIOAuthMiddleware)

    io.on("connection", (clientSocket: Socket) => {
        ConnectionController.onClientConnected(clientSocket)

        clientSocket.on("active", _ => ConnectionController.onClientActive(clientSocket))
        clientSocket.on("inactive", _ => ConnectionController.onClientActive(clientSocket))

        // contact events
        clientSocket.on("create-contact", data => ContactsController.createContact(clientSocket, io, data))
        clientSocket.on("update-contact", data => ContactsController.updateContact(clientSocket, io, data))
        clientSocket.on("delete-contact", data => ContactsController.deleteContact(clientSocket, io, data))

        // common chat events
        clientSocket.on("modify-chat-flag", data => ChatsController.modifyChatFlag(clientSocket, io, data))

        // private chat events
        clientSocket.on("delete-chat", data => ChatsController.deleteChat(clientSocket, io, data))

        // group events
        clientSocket.on("create-group", data => GroupsController.createGroup(clientSocket, io, data))
        clientSocket.on("join-group", data => GroupsController.joinGroup(clientSocket, io, data))
        clientSocket.on("add-members", data => GroupsController.addMembers(clientSocket, io, data))
        clientSocket.on("remove-members", data => GroupsController.removeMembers(clientSocket, io, data))
        clientSocket.on("update-group-profile", data => GroupsController.updateGroupProfile(clientSocket, io, data))
        clientSocket.on("grant-group-admin-privileges", data => GroupsController.grantGroupAdminPrivileges(clientSocket, io, data))
        clientSocket.on("revoke-group-admin-privileges", data => GroupsController.revokeGroupAdminPrivileges(clientSocket, io, data))
        clientSocket.on("leave-group", data => GroupsController.leaveGroup(clientSocket, io, data))

        // channel events
        clientSocket.on("create-channel", data => ChannelsController.createChannel(clientSocket, io, data))
        clientSocket.on("subscribe-to-channel", data => ChannelsController.subscribeToChannel(clientSocket, io, data))
        clientSocket.on("add-subscribers", data => ChannelsController.addSubscribers(clientSocket, io, data))
        clientSocket.on("remove-subscribers", data => ChannelsController.removeSubscribers(clientSocket, io, data))
        clientSocket.on("update-channel-profile", data => ChannelsController.updateChannelProfile(clientSocket, io, data))
        clientSocket.on("grant-channel-admin-privileges", data => ChannelsController.grantChannelAdminPrivileges(clientSocket, io, data))
        clientSocket.on("revoke-channel-admin-privileges", data => ChannelsController.revokeChannelAdminPrivileges(clientSocket, io, data))
        clientSocket.on("leave-channel", data => ChannelsController.leaveChannel(clientSocket, io, data))

        // message events
        clientSocket.on("message", message => MessagingController.message(clientSocket, io, message))
        clientSocket.on("messages-received-by-me", data => MessagingController.messagesRecievedByTarget(clientSocket, io, data))
        clientSocket.on("messages-seen-by-me", data => MessagingController.messagesSeenByTarget(clientSocket, io, data))
        clientSocket.on("delete-messages", data => MessagingController.deleteMessages(clientSocket, io, data))

        clientSocket.on("disconnect", (reason) => ConnectionController.onClientDisconnected(reason, clientSocket))
    })
}