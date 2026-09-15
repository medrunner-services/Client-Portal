import type { Person } from "@medrunner/api-client";
import { AccountDeactivationReason, PersonType, UserRoles } from "@medrunner/api-client";
import { expect, it } from "vitest";

import { replaceAtMentions } from "@/utils/functions/stringFunctions.ts";

const userWithoutRsiHandle: Person = {
    id: "client",
    created: "2026-09-15T10:00:00.000Z",
    updated: "2026-09-15T10:00:00.000Z",
    discordId: "123",
    rsiHandle: null,
    roles: UserRoles.CLIENT,
    personType: PersonType.CLIENT,
    active: true,
    deactivationReason: AccountDeactivationReason.NONE,
    clientStats: {
        missions: {
            success: 0,
            failed: 0,
            noContact: 0,
            refused: 0,
            aborted: 0,
            serverError: 0,
            canceled: 0,
        },
    },
    activeEmergency: null,
    clientPortalPreferencesBlob: null,
    allowAnonymousAlert: true,
    initialJoinDate: null,
    hasCitizenId: false,
};

it("does not create a literal null mention for a user without an RSI handle", () => {
    expect(replaceAtMentions("hello @null and @123", "staff", true, [], userWithoutRsiHandle))
        .toBe("hello @null and @123");

    expect(replaceAtMentions("hello <@123>", "staff", false, [], userWithoutRsiHandle))
        .toBe("hello <@123>");
});
