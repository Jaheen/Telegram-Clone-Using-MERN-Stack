import { Axios } from "../axios"

/**
 * Class to handle REST API calls on contacts
 */
export default class ContactsService {

    /**
     * Get all contacts of logged in user and resolve promise
     * @returns promise containing contacts fetched from server
     */
    static async getMyContacts() {
        return new Promise((resolve) => {
            Axios.get("/contacts/get-my-contacts").then(response => {
                if (response.status === 200) {
                    const { contacts } = response.data
                    resolve(contacts)
                }
            }).catch(console.log)
        })
    }
}