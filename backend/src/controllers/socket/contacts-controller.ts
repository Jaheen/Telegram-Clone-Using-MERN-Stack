import { ContactsService } from "services";
import { Server, Socket } from "socket.io";

export default class ContactsController {

    static async createContact(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { firstName, lastName, phoneNumber } = data

        if (firstName && firstName.trim() !== "") {
            if (phoneNumber && phoneNumber.trim() !== "") {
                ContactsService.createContact(userId, firstName, lastName, phoneNumber).then(createdContact => {
                    io.to(userId).emit("contact-created", createdContact)
                }).catch(message => clientSocket.emit("create-contact-error", message))
            }
        }
    }

    static async updateContact(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { firstName, lastName, contactId } = data

        if (contactId && contactId.trim() !== "") {
            if (firstName && firstName.trim() !== "") {
                ContactsService.updateContact(userId, contactId, firstName, lastName)
                    .then(updatedContact => io.to(userId).emit("contact-updated", updatedContact))
            }
        }
    }

    static async deleteContact(clientSocket: Socket, io: Server, data: any) {
        const userId = clientSocket["userId"]
        const { contactId } = data

        if (contactId && contactId.trim() !== "") {
            ContactsService.deleteContact(userId, contactId)
                .then(_ => io.to(userId).emit("contact-deleted", { contactId }))
        }
    }
}