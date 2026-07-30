import { trackLead, trackContact } from "./tracking";

describe("trackLead", () => {
    afterEach(() => {
        // @ts-expect-error test-only global cleanup
        delete global.window;
    });

    it("does not throw when window is undefined (SSR)", () => {
        expect(() => trackLead()).not.toThrow();
    });

    it("does not throw when fbq/gtag are not installed yet", () => {
        // @ts-expect-error test-only global stub
        global.window = {};
        expect(() => trackLead()).not.toThrow();
    });

    it("calls fbq and gtag with the Lead event when both are installed", () => {
        const fbq = jest.fn();
        const gtag = jest.fn();
        // @ts-expect-error test-only global stub
        global.window = { fbq, gtag };

        trackLead();

        expect(fbq).toHaveBeenCalledWith("track", "Lead");
        expect(gtag).toHaveBeenCalledWith("event", "generate_lead");
    });
});

describe("trackContact", () => {
    afterEach(() => {
        // @ts-expect-error test-only global cleanup
        delete global.window;
    });

    it("does not throw when window is undefined (SSR)", () => {
        expect(() => trackContact()).not.toThrow();
    });

    it("calls fbq and gtag with the Contact event when both are installed", () => {
        const fbq = jest.fn();
        const gtag = jest.fn();
        // @ts-expect-error test-only global stub
        global.window = { fbq, gtag };

        trackContact();

        expect(fbq).toHaveBeenCalledWith("track", "Contact");
        expect(gtag).toHaveBeenCalledWith("event", "contact");
    });
});
