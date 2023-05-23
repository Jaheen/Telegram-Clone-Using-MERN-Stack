import { ChannelsService, GroupsSerivce } from "services";
import { Socket } from "socket.io";
import { DisconnectReason } from "socket.io/dist/socket";

/**
 * Class to handle events related to connection in socket.io
 */
export default class ConnectionController {
    static async onClientConnected(clientSocket: Socket) {
        const userId = clientSocket["userId"]
        // join client with his user-id
        clientSocket.join(userId)

        // join client socket in all groups where he is a member
        GroupsSerivce.getMembershipsOfUser(userId).then(memberships => {
            memberships.forEach(membership => {
                const groupId = membership.groupId.toString()
                clientSocket.join(groupId)
            })
        })

        // join client socket in all channels where he is a subscriber
        ChannelsService.getSubscriptionsOfUser(userId).then(subscriptions => {
            subscriptions.forEach(subscription => {
                const channelId = subscription.channelId.toString()
                clientSocket.join(channelId)
            })
        })
    }

    static async onClientActive(clientSocket: Socket) {
        clientSocket["isActive"] = true
    }

    static async onClientInactive(clientSocket: Socket) {
        clientSocket["isActive"] = false
    }

    static async onClientDisconnected(reason: DisconnectReason, clientSocket: Socket) {
    }
}