// eslint-disable-next-line
import { io, Socket } from "socket.io-client"
import { getServerAuthToken, SERVER_URL } from "config"

/**
 * Singleton socket.io instance
 * @type {Socket}
 */
export let socket

export function initializeSocketInstance() {
    socket = io(SERVER_URL, {
        auth: {
            serverAuthToken: getServerAuthToken()
        },
        autoConnect: false
    })
}
