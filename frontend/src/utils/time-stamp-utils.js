/**
 * Helper class to transform timestamp into user readable text
 */
export default class TimeStampUtils {

    static TWELVE_HOUR_FORMAT = "12HR"
    static TWENTY_FOUR_HOUR_FORMAT = "24HR"

    static MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]
    static DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    /**
     * Convert and timestamp in milliseconds elapsed to human readable formatted timestamp
     * 
     * @param {number} timestamp timestamp to be parsed
     * @returns Formatted timestamp
     */
    static getFormattedTimeStamp(timestamp) {
        let formattedTimeStamp = ""

        return formattedTimeStamp
    }

    /**
     * Format the timestamp as per application requirements and return it
     * @param {string} timestamp timestamp in ISO string format
     * @returns formatted date string
     */
    static getFormattedDate(timestamp) {
        if (timestamp && timestamp !== "") {
            const today = new Date()
            const date = new Date(timestamp)

            const dateDifference = today.getDate() - date.getDate()
            const monthDifference = today.getMonth() - date.getMonth()
            const yearDifference = today.getFullYear() - date.getFullYear()

            if (yearDifference === 0 && monthDifference === 0 && dateDifference < 7)
                if (dateDifference === 0)
                    return "Today"
                else if (dateDifference === 1)
                    return "Yesterday"
                else
                    return `${this.DAYS[date.getDay()]}`
            else {
                if (yearDifference === 0)
                    return `${this.MONTHS[date.getMonth()]} ${date.getDate()}`
                else
                    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
            }
        }

        return ""
    }

    /**
     * Get formatted time string from isostring timestamp
     * @param {string} timestamp timestamp in isostring format
     * @param {string} timeFormat result format 12hr or 24hr stored as static values in same class
     * @returns formatted time string
     */
    static getFormattedTime(timestamp, timeFormat) {

        if (timestamp && timestamp !== "") {
            // pad numbers with 0 before and slice everything except last two digits
            const padNumber = num => ("0" + num).slice(-2)

            const date = new Date(timestamp)
            const HOURS = date.getHours()
            const MINUTES = padNumber(date.getMinutes())

            switch (timeFormat) {
                case this.TWELVE_HOUR_FORMAT: {
                    if (HOURS === 0)
                        return `12:${MINUTES} AM`
                    else if (HOURS < 12)
                        return `${padNumber(HOURS)}:${MINUTES} AM`
                    else if (HOURS === 12)
                        return `12:${MINUTES} PM`
                    else
                        // also do same for hours less than 0 as we done to minutes
                        return `${padNumber(HOURS - 12)}:${MINUTES} PM`
                }
                case this.TWENTY_FOUR_HOUR_FORMAT:
                    return `${padNumber(HOURS)}:${MINUTES}`
                default:
                    return ""
            }
        }
        
        return ""
    }

    /**
     * Compare two timestamps for match in year month and date, if they match return true, false otherwise
     * @param {string} timestamp1 timestamp1 to be considered
     * @param {string} timestamp2 timestamp2 to be considered
     * @returns a boolean value whether 
     */
    static areTimestampsDifferent(timestamp1, timestamp2) {
        const dt1 = new Date(timestamp1)
        const dt2 = new Date(timestamp2)

        const year1 = dt1.getFullYear()
        const year2 = dt2.getFullYear()

        const month1 = dt1.getMonth()
        const month2 = dt2.getMonth()

        const date1 = dt1.getDate()
        const date2 = dt2.getDate()

        return ((year1 !== year2) || (month1 !== month2) || (date1 !== date2))
    }
}