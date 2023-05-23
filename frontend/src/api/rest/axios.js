import axios from "axios"
import { getServerAuthToken, SERVER_URL } from "config"

/**
 * Axios with auth headers and base url configured for REST api requests
 * @type {axios}
 */
export let Axios

export function initAxiosInstance() {
    Axios = axios.create({
        baseURL: `${SERVER_URL}/api`,
        headers: {
            authorization: `Bearer ${getServerAuthToken()}`
        }
    })
}
