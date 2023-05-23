import Patterns from "../patterns"

describe("Regex Pattern Test", () => {

    test("Testing phone number validation", () => {

        expect(Patterns.phoneNumbers.in.test("+911234567890")).toBeTruthy()
        expect(Patterns.phoneNumbers.in.test("+9112345678901")).toBeFalsy()
        expect(Patterns.phoneNumbers.in.test("911234567890")).toBeFalsy()
        expect(Patterns.phoneNumbers.in.test("1234567890")).toBeFalsy()
        expect(Patterns.phoneNumbers.in.test("+91123456780")).toBeFalsy()
    })

    test("Testing hyperlink validation", () => {
        const correctLinks = [
            'http://www.foufos.gr',
            'https://www.foufos.gr',
            'http://foufos.gr',
            'http://www.foufos.gr/kino',
            'http://werer.gr',
            'www.foufos.gr',
            'www.mp3.com',
            'www.t.co',
            'http://t.co',
            'http://www.t.co',
            'https://www.t.co',
            'www.aa.com',
            'http://aa.com',
            'http://www.aa.com',
            'https://www.aa.com',
        ]
        const wrongLinks = [
            'www.foufos',
            'www.foufos-.gr',
            'www.-foufos.gr',
            'foufos.gr',
            'http://www.foufos',
            'http://foufos',
            'www.mp3#.com'
        ]

        correctLinks.forEach(link => {
            expect(Patterns.hyperlink.test(link)).toBeTruthy()
        });

        wrongLinks.forEach(link => {
            expect(Patterns.hyperlink.test(link)).toBeFalsy()
        });
    })
})