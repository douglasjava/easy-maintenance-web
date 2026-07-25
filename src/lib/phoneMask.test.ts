import { maskBRPhoneInput, e164ToDisplayMask } from "./phoneMask";

describe("maskBRPhoneInput", () => {
    it("masks a partial DDD", () => {
        expect(maskBRPhoneInput("31")).toBe("(31");
    });

    it("masks a landline (10 digits)", () => {
        expect(maskBRPhoneInput("3132139145")).toBe("(31) 3213-9145");
    });

    it("masks a mobile number (11 digits)", () => {
        expect(maskBRPhoneInput("31972139145")).toBe("(31) 97213-9145");
    });

    it("strips non-digit characters from already-masked input", () => {
        expect(maskBRPhoneInput("(31) 97213-9145")).toBe("(31) 97213-9145");
    });

    it("truncates input beyond 11 digits", () => {
        expect(maskBRPhoneInput("319721391459999")).toBe("(31) 97213-9145");
    });

    it("returns empty string for empty input", () => {
        expect(maskBRPhoneInput("")).toBe("");
    });
});

describe("e164ToDisplayMask", () => {
    it("converts an E.164 mobile number to display mask", () => {
        expect(e164ToDisplayMask("+5531972139145")).toBe("(31) 97213-9145");
    });

    it("converts an E.164 landline number to display mask", () => {
        expect(e164ToDisplayMask("+553132139145")).toBe("(31) 3213-9145");
    });

    it("returns empty string for null/undefined/empty input", () => {
        expect(e164ToDisplayMask(null)).toBe("");
        expect(e164ToDisplayMask(undefined)).toBe("");
        expect(e164ToDisplayMask("")).toBe("");
    });
});
