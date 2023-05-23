import { Channels, Groups } from "models"

export default class SearchService {

    /**
     * Search for the query from the server
     * @param query text query to search for
     * @returns a promise containing the results
     */
    static async search(query: string) {
        return new Promise((resolve) => {
            Promise.all([
                Groups.searchGroupsByName(query),
                Channels.searchChannelByName(query)
            ]).then(([groups, channels]) => {
                const results = []

                groups.forEach(group => {
                    const result: any = {}

                    result.resultType = "group"
                    result.targetId = group._id

                    group["targetId"] = group._id
                    delete group._id

                    result.targetGroup = group
                    results.push(result)
                })

                channels.forEach(channel => {
                    const result: any = {}

                    result.resultType = "channel"
                    result.targetId = channel._id

                    channel["targetId"] = channel._id
                    delete channel._id

                    result.targetChannel = channel
                    results.push(result)
                })

                resolve(results)
            })
        })
    }
}