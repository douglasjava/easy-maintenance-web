import Cookies from "js-cookie";
import { captureUtm, getStoredUtm } from "./utm";

jest.mock("js-cookie");

const mockedCookies = Cookies as jest.Mocked<typeof Cookies>;

describe("captureUtm", () => {
    afterEach(() => jest.clearAllMocks());

    it("saves all recognized utm params found in the URL", () => {
        captureUtm(
            "?utm_source=google&utm_medium=cpc&utm_campaign=lancamento&utm_content=ad1&utm_term=manutencao"
        );

        expect(mockedCookies.set).toHaveBeenCalledWith(
            "em_utm",
            JSON.stringify({
                utm_source: "google",
                utm_medium: "cpc",
                utm_campaign: "lancamento",
                utm_content: "ad1",
                utm_term: "manutencao",
            }),
            { expires: 30, sameSite: "Lax" }
        );
    });

    it("saves only the utm params present, ignoring unrelated query params", () => {
        captureUtm("?utm_source=meta&ref=ABC123");

        expect(mockedCookies.set).toHaveBeenCalledWith(
            "em_utm",
            JSON.stringify({ utm_source: "meta" }),
            { expires: 30, sameSite: "Lax" }
        );
    });

    it("does not write the cookie when the URL has no utm params", () => {
        captureUtm("?ref=ABC123");

        expect(mockedCookies.set).not.toHaveBeenCalled();
    });

    it("does not write the cookie for an empty query string", () => {
        captureUtm("");

        expect(mockedCookies.set).not.toHaveBeenCalled();
    });
});

describe("getStoredUtm", () => {
    afterEach(() => jest.clearAllMocks());

    it("returns the parsed utm object when the cookie exists", () => {
        mockedCookies.get.mockReturnValue(JSON.stringify({ utm_source: "google" }));

        expect(getStoredUtm()).toEqual({ utm_source: "google" });
    });

    it("returns undefined when the cookie does not exist", () => {
        mockedCookies.get.mockReturnValue(undefined);

        expect(getStoredUtm()).toBeUndefined();
    });

    it("returns undefined when the cookie value is malformed JSON", () => {
        mockedCookies.get.mockReturnValue("not-json");

        expect(getStoredUtm()).toBeUndefined();
    });
});
