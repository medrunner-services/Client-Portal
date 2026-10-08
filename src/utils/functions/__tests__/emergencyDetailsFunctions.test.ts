import { expect, it, vi } from "vitest";

const emergencyDetailsFunctions = await import(new URL("../emergencyDetailsFunctions.ts", import.meta.url).href)
    .catch(() => undefined);

it("recognizes a client-authored situation message as the first completed step", () => {
    const progress = emergencyDetailsFunctions?.getEmergencyDetailsProgress([
        { senderId: "client", contents: "## Emergency details: Situation\n\nSituation details" },
    ], "client");

    expect(progress).toEqual({
        completedSteps: [1],
        skipped: false,
    });
});

it("records location in a separate second step", () => {
    const progress = emergencyDetailsFunctions?.getEmergencyDetailsProgress([
        { senderId: "client", contents: "## Emergency details: Situation\n\nSituation details" },
        { senderId: "client", contents: "## Emergency details: Location\n\nLocation details" },
    ], "client");

    expect(progress).toEqual({
        completedSteps: [1, 2],
        skipped: false,
    });
});

it("keeps the location step complete for legacy bundled situation messages", () => {
    const progress = emergencyDetailsFunctions?.getEmergencyDetailsProgress([
        {
            senderId: "client",
            contents: "## Emergency details: Situation\n\n_The client type of location is:_ **Space**\n_Client ship:_ **C8R**",
        },
    ], "client");

    expect(progress).toEqual({
        completedSteps: [1, 2],
        skipped: false,
    });
});

it("marks every step skipped when the client declined to provide details", () => {
    const progress = emergencyDetailsFunctions?.getEmergencyDetailsProgress([
        { senderId: "client", contents: "## Emergency details: Skipped\n\nClient declined to provide details." },
    ], "client");

    expect(progress).toEqual({
        completedSteps: [],
        skipped: true,
    });
});

it("does not permit another skipped audit message after the client already skipped", () => {
    const progress = emergencyDetailsFunctions?.getEmergencyDetailsProgress([
        { senderId: "client", contents: "## Emergency details: Skipped\n\nClient declined to provide details." },
    ], "client");

    expect(emergencyDetailsFunctions?.canSendSkippedEmergencyDetailsMessage(progress!)).toBe(false);
});

it("resumes a skipped process after the client sends a step message", () => {
    const progress = emergencyDetailsFunctions?.getEmergencyDetailsProgress([
        { senderId: "client", contents: "## Emergency details: Skipped\n\nClient declined to provide details." },
        { senderId: "client", contents: "## Emergency details: Situation\n\nSituation details" },
    ], "client");

    expect(progress).toEqual({
        completedSteps: [1],
        skipped: false,
    });
});

it("recognizes each step once and ignores matching responder messages", () => {
    const progress = emergencyDetailsFunctions?.getEmergencyDetailsProgress([
        { senderId: "staff", contents: "## Emergency details: Players\n\nResponder notes" },
        { senderId: "client", contents: "## Emergency details: Situation\n\nSituation details" },
        { senderId: "client", contents: "## Emergency details: Situation\n\nDuplicate situation details" },
        { senderId: "client", contents: "## Emergency details: Location\n\nLocation details" },
        { senderId: "client", contents: "## Emergency details: Players\n\nPlayer details" },
        { senderId: "client", contents: "## Emergency details: Remarks\n\nAdditional remarks" },
    ], "client");

    expect(progress).toEqual({
        completedSteps: [1, 2, 3, 4],
        skipped: false,
    });
});

it("loads every history page before deriving persisted progress", async () => {
    const fetchPage = vi.fn(async (paginationToken?: string) => {
        if (paginationToken === "earlier") {
            return {
                data: [{ senderId: "client", contents: "## Emergency details: Location\n\nLocation details" }],
                paginationToken: null,
            };
        }

        return {
            data: [{ senderId: "client", contents: "## Emergency details: Situation\n\nSituation details" }],
            paginationToken: "earlier",
        };
    });

    const progress = await emergencyDetailsFunctions?.loadEmergencyDetailsProgress(fetchPage, "client");

    expect(progress).toEqual({
        completedSteps: [1, 2],
        skipped: false,
    });
    expect(fetchPage).toHaveBeenNthCalledWith(1, undefined);
    expect(fetchPage).toHaveBeenNthCalledWith(2, "earlier");
});

it("stops loading when an invalid response repeats a pagination token", async () => {
    let calls = 0;
    const fetchPage = vi.fn(async () => {
        calls++;

        if (calls > 2)
            throw new Error("The repeated page should not be requested.");

        return {
            data: [],
            paginationToken: "repeated",
        };
    });

    const progress = await emergencyDetailsFunctions?.loadEmergencyDetailsProgress(fetchPage, "client");

    expect(progress).toEqual({
        completedSteps: [],
        skipped: false,
    });
    expect(fetchPage).toHaveBeenCalledTimes(2);
});

it("prefixes each submitted step with its durable message title", () => {
    const contents = emergencyDetailsFunctions?.createEmergencyDetailsStepMessage(2, "_Ship:_ **C8R**");

    expect(contents).toBe("## Emergency details: Location\n\n_Ship:_ **C8R**");
});

it("creates an explicit audit message when the client skips all details", () => {
    const contents = emergencyDetailsFunctions?.createSkippedEmergencyDetailsMessage();

    expect(contents).toBe("## Emergency details: Skipped\n\n_The client chose not to provide additional emergency details._");
});
