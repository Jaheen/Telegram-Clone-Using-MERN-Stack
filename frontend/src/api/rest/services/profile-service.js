import { Axios } from "../axios"

export default class ProfileService {

    static async getUserProfile(userId) {
        return new Promise((resolve) => {
            Axios.get(`/profiles/get-user-profile/${userId}`).then(response => {
                if (response.status === 200) {
                    const { profile } = response.data
                    resolve(profile)
                }
            }).catch(console.log)
        })
    }

    static async getMyProfile() {
        return new Promise((resolve) => {
            Axios.get(`/profiles/get-my-profile`).then(response => {
                if (response.status === 200) {
                    const { profile } = response.data
                    resolve(profile)
                }
            }).catch(console.log)
        })
    }

    static async updateProfile(firstName, lastName, bio, username, avatarUrl) {
        return new Promise((resolve) => {
            Axios.put(`/profiles/update-profile`, { firstName, lastName, bio, username, avatarUrl }).then(response => {
                if (response.status === 200) {
                    const { updatedUser } = response.data
                    resolve(updatedUser)
                }
            }).catch(console.log)
        })
    }
}