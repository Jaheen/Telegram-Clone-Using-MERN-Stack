import TimeStampUtils from "utils/time-stamp-utils"

describe("TimeStampUtils Test", () => {

    test("Testing getFormattedTime() function", () => {
        // test 12 hr format
        // test AM
        let timestamp = new Date("2023-01-01 00:00").toISOString()
        expect(TimeStampUtils.getFormattedTime(timestamp, TimeStampUtils.TWELVE_HOUR_FORMAT)).toBe("12:00 AM")
        timestamp = new Date("2023-01-01 05:22").toISOString()
        expect(TimeStampUtils.getFormattedTime(timestamp, TimeStampUtils.TWELVE_HOUR_FORMAT)).toBe("05:22 AM")
        timestamp = new Date("2023-01-01 11:59:59").toISOString()
        expect(TimeStampUtils.getFormattedTime(timestamp, TimeStampUtils.TWELVE_HOUR_FORMAT)).toBe("11:59 AM")

        // test PM
        timestamp = new Date("2023-01-01 12:00").toISOString()
        expect(TimeStampUtils.getFormattedTime(timestamp, TimeStampUtils.TWELVE_HOUR_FORMAT)).toBe("12:00 PM")
        timestamp = new Date("2023-01-01 18:52").toISOString()
        expect(TimeStampUtils.getFormattedTime(timestamp, TimeStampUtils.TWELVE_HOUR_FORMAT)).toBe("06:52 PM")
        timestamp = new Date("2023-01-01 23:59:59").toISOString()
        expect(TimeStampUtils.getFormattedTime(timestamp, TimeStampUtils.TWELVE_HOUR_FORMAT)).toBe("11:59 PM")

        // test 24 hr format
        timestamp = new Date("2023-01-01 00:00").toISOString()
        expect(TimeStampUtils.getFormattedTime(timestamp, TimeStampUtils.TWENTY_FOUR_HOUR_FORMAT)).toBe("00:00")
        timestamp = new Date("2023-01-01 12:00").toISOString()
        expect(TimeStampUtils.getFormattedTime(timestamp, TimeStampUtils.TWENTY_FOUR_HOUR_FORMAT)).toBe("12:00")
        timestamp = new Date("2023-01-01 23:59").toISOString()
        expect(TimeStampUtils.getFormattedTime(timestamp, TimeStampUtils.TWENTY_FOUR_HOUR_FORMAT)).toBe("23:59")
    })

    test.skip("Testing getFormattedDate() Function", () => {
        // Update test dates before testing as they can vary with time
        let timestamp = new Date().toISOString()
        expect(TimeStampUtils.getFormattedDate(timestamp)).toBe("Today")
        timestamp = new Date("2023-01-21").toISOString()
        expect(TimeStampUtils.getFormattedDate(timestamp)).toBe("Yesterday")
        timestamp = new Date("2023-01-20").toISOString()
        expect(TimeStampUtils.getFormattedDate(timestamp)).toBe("Fri")
        timestamp = new Date("2023-01-16").toISOString()
        expect(TimeStampUtils.getFormattedDate(timestamp)).toBe("Mon")
        timestamp = new Date("2023-01-08").toISOString()
        expect(TimeStampUtils.getFormattedDate(timestamp)).toBe("Jan 8")
        timestamp = new Date("2022-01-31").toISOString()
        expect(TimeStampUtils.getFormattedDate(timestamp)).toBe("31/1/2022")
        timestamp = new Date("2022-02-28").toISOString()
        expect(TimeStampUtils.getFormattedDate(timestamp)).toBe("28/2/2022")
        timestamp = new Date("2023-03-31").toISOString()
        expect(TimeStampUtils.getFormattedDate(timestamp)).toBe("Mar 31")
    })

    test("Testing areTimestampsDifferent() function", () => {
        let timestamp1 = new Date().toISOString()
        let timestamp2 = new Date().toISOString()
        expect(TimeStampUtils.areTimestampsDifferent(timestamp1, timestamp2)).toBe(false)
        expect(TimeStampUtils.areTimestampsDifferent(timestamp2, timestamp1)).toBe(false)
        timestamp1 = new Date("2023-01-01").toISOString()
        timestamp2 = new Date("2023-01-02").toISOString()
        expect(TimeStampUtils.areTimestampsDifferent(timestamp1, timestamp2)).toBe(true)
        expect(TimeStampUtils.areTimestampsDifferent(timestamp2, timestamp1)).toBe(true)
        timestamp1 = new Date("2023-01-01").toISOString()
        timestamp2 = new Date("2023-02-01").toISOString()
        expect(TimeStampUtils.areTimestampsDifferent(timestamp1, timestamp2)).toBe(true)
        expect(TimeStampUtils.areTimestampsDifferent(timestamp2, timestamp1)).toBe(true)
        timestamp1 = new Date("2023-01-01").toISOString()
        timestamp2 = new Date("2022-01-01").toISOString()
        expect(TimeStampUtils.areTimestampsDifferent(timestamp1, timestamp2)).toBe(true)
        expect(TimeStampUtils.areTimestampsDifferent(timestamp2, timestamp1)).toBe(true)
        timestamp1 = new Date("2021-12-01").toISOString()
        timestamp2 = new Date("2023-01-02").toISOString()
        expect(TimeStampUtils.areTimestampsDifferent(timestamp1, timestamp2)).toBe(true)
        expect(TimeStampUtils.areTimestampsDifferent(timestamp2, timestamp1)).toBe(true)
    })
})