import { Request, Response } from "express";
import { ContactsService } from "services";

/**
 * Controller to handle requests on Contacts
 */
export default class ContactsController {

    /**
     * Handler to fetch all contacts of the authenticated user
     * @param req request object
     * @param res response object
     */
    static getMyContacts(req: Request, res: Response) {

        const userId = req["userId"]

        if (userId) {
            ContactsService.getContacts(userId)
                .then(contacts => res.json({ contacts }))
        }
    }

    /**
     * Handler to add a new contact to contacts list of authenticated user
     * @param req request object
     * @param res response object
     */
    static createContact(req: Request, res: Response) {
        const userId = req["userId"]
        const { firstName, lastName, phoneNumber } = req.body

        // validation for the firstname
        if (firstName && firstName.trim() !== "") {
            // validation for phone number
            if (phoneNumber && phoneNumber.trim() !== "") {

                // using contacts service create contact and send created contact to client
                ContactsService.createContact(userId, firstName, lastName, phoneNumber)
                    .then(newContact => res.json({ contact: newContact, message: "success" }))
                    .catch(reason => res.json({ message: reason }))

            } else
                res.status(400).json({ message: "phone-number-invalid" })
        } else
            res.status(400).json({ message: "first-name-invalid" })
    }

    static updateContact(req: Request, res: Response) {
        const userId = req["userId"]
        const { contactId, firstName, lastName } = req.body

        if (contactId && contactId.trim() !== "") {
            if (firstName && firstName.trim() !== "") {

                ContactsService.updateContact(userId, contactId, firstName, lastName)
                    .then(updatedContact => res.json({ contact: updatedContact, message: "success" }))

            } else
                res.status(400).json({ message: "first-name-not-provided" })
        } else
            res.status(400).json({ message: "contact-id-not-provided" })
    }

    static deleteContact(req: Request, res: Response) {
        const userId = req["userId"]
        const { contactId } = req.params

        if (contactId && contactId.trim() !== "") {
            ContactsService.deleteContact(userId, contactId)
            .then(_ => res.json({ isDeleted: true }))
        } else
            res.status(400).json({ message: "contact-id-not-provided" })
    }
}