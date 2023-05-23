import { Axios } from "../axios"

export default class SearchService {

    /**
     * Search the server for public channels, groups and users using usernames
     * @param {string} query search text to be queried from server
     * @returns a promise containing results
     */
    static async search(query) {
        return new Promise((resolve) => {
            Axios.get(`/search?query=${query}`).then(response => {
                if (response.status === 200) {
                    const { results } = response.data
                    resolve(results)
                }
            }).catch(console.log)
        })
    }
}