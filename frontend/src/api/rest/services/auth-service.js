import axios from "axios"
import { SERVER_URL } from "config"

/**
 * Class to make requests regarding server auth
 */
export default class AuthService {

    /**
     * Server side login after firebase authentication
     * @param {string} firebaseAuthToken token returned by firebase authentication
     */
    static async login(firebaseAuthToken) {
        return new Promise((resolve, reject) => {
            axios.post(`${SERVER_URL}/auth/login`, { firebaseAuthToken })
                .then(response => {
                    if (response.status === 200) {
                        resolve(response.data.serverAuthToken)
                    }
                }).catch(reject)
        })
    }

    /**
     * Verify jwt token using backend server
     * @param {string} serverAuthToken jwt token to be verified
     */
    static async verifyToken(serverAuthToken) {
        return new Promise((resolve, reject) => {
            axios.post(`${SERVER_URL}/auth/verifyToken`, { serverAuthToken })
                .then(response => {
                    if (response.status === 200) {
                        resolve(response.data.isValid)
                    }
                }).catch(reject)
        })
    }
}