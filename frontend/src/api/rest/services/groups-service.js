import { Axios } from "../axios"

export default class GroupsService {

    /**
     * Get all members of group who are in contacts list
     * @param {string} groupId id of the group
     * @returns contacts in group
     */
    static async getContactsInGroup(groupId) {
        return new Promise((resolve) => {
            Axios.get(`/groups/get-my-contacts-in-group/${groupId}`).then(response => {
                if (response.status === 200) {
                    const { contactsInGroup } = response.data
                    if (contactsInGroup instanceof Array) {
                        const data = {}
                        contactsInGroup.forEach(contactMember => data[contactMember.userId] = contactMember)
                        resolve(data)
                    }
                }
            }).catch(console.log)
        })
    }

    /**
     * Get all members of the group with pagination
     * @param {string} groupId id of the group
     * @param {string} query search query to search members
     * @param {number} offset pagination offset
     * @returns members in the group
     */
    static async getMembersOfGroup(groupId, query, offset) {
        return new Promise((resolve) => {
            Axios.get(`/groups/get-members/${groupId}?query=${query}&offset=${offset}`).then(response => {
                if (response.status === 200) {
                    const { members } = response.data
                    if (members instanceof Array) {
                        resolve(members)
                    }
                }
            }).catch(console.log)
        })
    }
}