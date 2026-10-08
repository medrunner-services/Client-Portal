import type { ApiResponse, Person, Responder } from "@medrunner/api-client";
import { AccountDeactivationReason, Class, PersonType, UserRoles } from "@medrunner/api-client";
import { expect, it } from "vitest";

import { errorString, replaceAtMentions } from "@/utils/functions/stringFunctions.ts";

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

it("uses a ProblemDetails title for a generic API failure", () => {
    const error: ApiResponse = {
        success: false,
        statusCode: 422,
        problemDetails: {
            title: "The selected location cannot receive emergency reports",
            status: 422,
        },
    };

    expect(errorString(error)).toBe("The selected location cannot receive emergency reports (422)");
});

it("preserves an explicit local message over an API problem title", () => {
    const error: ApiResponse = {
        success: false,
        statusCode: 403,
        problemDetails: {
            title: "You do not have permission to perform this action",
            status: 403,
        },
    };

    expect(errorString(error, "Your account is blocked")).toBe("Your account is blocked (403)");
});

it("matches a non-null RSI handle literally in HTML messages", () => {
    const userWithRegexSyntaxInHandle: Person = {
        ...userWithoutRsiHandle,
        rsiHandle: "a.b$&",
    };

    expect(replaceAtMentions("hello @a.b$& and @axb$&", "staff", true, [], userWithRegexSyntaxInHandle))
        .toBe("hello <span class=\" p-1 font-medium bg-gray-500/20 dark:bg-gray-400/20 rounded-lg\">@a.b$&amp;</span> and @axb$&");
});

it("preserves replacement syntax in a non-null RSI handle in plain-text messages", () => {
    const userWithReplacementSyntaxInHandle: Person = {
        ...userWithoutRsiHandle,
        rsiHandle: "a.b$&",
    };

    expect(replaceAtMentions("hello <@123>", "staff", false, [], userWithReplacementSyntaxInHandle))
        .toBe("hello @a.b$&");
});

it("escapes the current-user handle while preserving highlighted mentions and message HTML", () => {
    const userWithHtmlInHandle: Person = {
        ...userWithoutRsiHandle,
        rsiHandle: "<img src=x onerror=\"alert(1)\">&",
    };

    const renderedMessage = replaceAtMentions(
        "<p>Hello @123 and <strong>stay safe</strong></p>",
        "staff",
        true,
        [],
        userWithHtmlInHandle,
    );

    expect(renderedMessage)
        .toBe("<p>Hello <span class=\" p-1 font-medium bg-gray-500/20 dark:bg-gray-400/20 rounded-lg\">@&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;</span> and <strong>stay safe</strong></p>");
    expect(renderedMessage).not.toContain("<img");
});

it("escapes a responder handle while preserving plain-text mentions and message HTML", () => {
    const responderWithHtmlInHandle: Responder = {
        discordId: "456",
        id: "responder",
        rsiHandle: "<svg/onload=alert(1)>",
        class: Class.MEDIC,
        updated: "2026-09-15T10:00:00.000Z",
    };

    const renderedMessage = replaceAtMentions(
        "<p>Paging @456 <em>now</em></p>",
        "staff",
        true,
        [responderWithHtmlInHandle],
        userWithoutRsiHandle,
    );

    expect(renderedMessage).toBe("<p>Paging @&lt;svg/onload=alert(1)&gt; <em>now</em></p>");
    expect(renderedMessage).not.toContain("<svg");
});
