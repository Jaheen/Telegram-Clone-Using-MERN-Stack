import { socket } from "../socket";


/**
 * Socket service to interact with server regarding current user's contacts
 */
export default class ContactsService {

    /**
     * Create a new contact for the current user
     * @param {string} firstName firstname of the new contact
     * @param {string} lastName lastname of the new contact
     * @param {string} phoneNumber phone number of the contact
     */
    static async createContact(firstName, lastName, phoneNumber) {
        return new Promise((resolve, reject) => {
            socket.emit("create-contact", { firstName, lastName, phoneNumber })
                .once("contact-created", createdContact => resolve(createdContact))
                .once("create-contact-error", message => reject(message))
        })
    }

    /**
     * Update a contact of the current user
     * @param {string} contactId id of the contact to be updated
     * @param {string} firstName updated firstname
     * @param {string} lastName updated last name
     */
    static async updateContact(contactId, firstName, lastName) {
        socket.emit("update-contact", { contactId, firstName, lastName })
    }

    /**
     * Delete a contact of current user
     * @param {string} contactId id of the contact to be deleted
     */
    static async deleteContact(contactId) {
        socket.emit("delete-contact", { contactId })
    }
}