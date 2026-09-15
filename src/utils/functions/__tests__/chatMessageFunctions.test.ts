import { Class } from "@medrunner/api-client";
import { expect, it } from "vitest";

const chatMessageFunctions = await import(new URL("../chatMessageFunctions.ts", import.meta.url).href)
    .catch(() => undefined);

it("preserves a null RSI handle on an optimistic client message", () => {
    expect(chatMessageFunctions?.createOptimisticClientMessage({
        emergencyId: "emergency",
        senderId: "client",
        senderRsiHandle: null,
        contents: "help",
        timestamp: "2026-09-15T10:00:00.000Z",
    })).toMatchObject({
        senderRsiHandle: null,
        senderClass: Class.NONE,
        local: true,
        error: false,
    });
});

it("preserves a non-null RSI handle on an optimistic client message", () => {
    expect(chatMessageFunctions?.createOptimisticClientMessage({
        emergencyId: "emergency",
        senderId: "client",
        senderRsiHandle: "RescuePilot",
        contents: "help",
        timestamp: "2026-09-15T10:00:00.000Z",
    })?.senderRsiHandle).toBe("RescuePilot");
});

it("creates a complete unsent optimistic message with client defaults", () => {
    expect(chatMessageFunctions?.createOptimisticClientMessage({
        emergencyId: "emergency",
        senderId: "client",
        senderRsiHandle: null,
        contents: "help",
        timestamp: "2026-09-15T10:00:00.000Z",
    })).toEqual({
        id: "",
        created: "2026-09-15T10:00:00.000Z",
        updated: "2026-09-15T10:00:00.000Z",
        emergencyId: "emergency",
        senderId: "client",
        senderRsiHandle: null,
        senderClass: Class.NONE,
        contents: "help",
        edited: false,
        deleted: false,
        local: true,
        error: false,
    });
});
