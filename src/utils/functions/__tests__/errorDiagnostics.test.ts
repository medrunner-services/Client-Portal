import type { ErrorPresentation } from "@/utils/errorDiagnostics";
import { ApiFailureError } from "@medrunner/api-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, reactive } from "vue";
import { createI18n } from "vue-i18n";
import { renderToString } from "vue/server-renderer";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";

import { authDiagnosticState, authResponseFailure, authTokenGrant } from "@/utils/authDiagnostics";
import { configureFrontendDiagnostics, copyDiagnosticId, frontendDiagnosticRecords, installDiagnosticHandling, presentFailure, runtimeFailure } from "@/utils/errorDiagnostics";
import { errorPresentation } from "@/utils/functions/stringFunctions";

beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    configureFrontendDiagnostics({ portal: "test-portal", version: "test-version" });
    runtimeFailure.value = undefined;
});
afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe("structured error presentation", () => {
    it("preserves a request ID through custom message mapping and Vue proxies", () => {
        const error = reactive({ success: false, statusCode: 409, requestId: "server-attempt", problemDetails: { title: "Conflict" } });
        const displayed = errorPresentation(error, "Choose another option");
        expect(displayed).toEqual({ message: "Choose another option (409)", diagnostic: { kind: "request", id: "server-attempt" } });
    });

    it("falls back to a valid body request ID without inventing one", () => {
        expect(presentFailure({ problemDetails: { requestId: "body-id" } }, "Failure"))
            .toMatchObject({ diagnostic: { kind: "request", id: "body-id" } });
    });

    it("keeps concurrent failures independent and reuses one frontend occurrence across handlers", () => {
        const first = new Error("private-message-marker");
        const one = presentFailure(first, "Friendly");
        const remapped = presentFailure(reactive(first), "Other friendly message");
        const another = presentFailure(new Error("private-message-marker"), "Friendly");
        expect(one).toHaveProperty("diagnostic.kind", "frontend");
        expect(remapped).toHaveProperty("diagnostic", typeof one === "string" ? undefined : one.diagnostic);
        expect(another).not.toHaveProperty("diagnostic.id", typeof one === "string" ? undefined : one.diagnostic?.id);
        expect(frontendDiagnosticRecords()).not.toContainEqual(expect.objectContaining({ message: "private-message-marker" }));
        expect(JSON.stringify(frontendDiagnosticRecords())).not.toContain("private-message-marker");
    });

    it("records the same ID locally and remotely only while reporting is permitted", () => {
        let consent = false;
        const report = vi.fn();
        configureFrontendDiagnostics({ portal: "test-portal", version: "test-version", canReport: () => consent, report });
        presentFailure(new Error("hidden"), "Disabled");
        expect(report).not.toHaveBeenCalled();
        consent = true;
        const shown = presentFailure({ failureKind: "transport" }, "Connection lost");
        expect(shown).toHaveProperty("diagnostic.kind", "frontend");
        const id = typeof shown === "string" ? undefined : shown.diagnostic?.id;
        expect(report).toHaveBeenCalledWith(expect.objectContaining({ id, classification: "transport", portal: "test-portal", version: "test-version" }));
        expect(frontendDiagnosticRecords().at(-1)).toHaveProperty("id", id);
    });

    it("keeps local diagnostics available when reporting fails, without recursion", () => {
        const report = vi.fn(() => {
            throw new Error("offline");
        });
        configureFrontendDiagnostics({ portal: "test-portal", version: "test-version", canReport: () => true, report });
        expect(presentFailure(new Error("private"), "Friendly")).toHaveProperty("diagnostic.kind", "frontend");
        expect(report).toHaveBeenCalledOnce();
    });

    it("bounds the local record set and does not record expected cancellation", () => {
        for (let index = 0; index < 110; index++)
            presentFailure({}, "Friendly");
        expect(frontendDiagnosticRecords()).toHaveLength(100);
        const previous = frontendDiagnosticRecords();
        expect(presentFailure({ failureKind: "cancelled" }, "Cancelled")).toBe("");
        expect(presentFailure(new ApiFailureError({ success: false, failureKind: "cancelled" }), "Cancelled")).toBe("");
        expect(presentFailure({ name: "AbortError" }, "Cancelled")).toBe("");
        expect(frontendDiagnosticRecords()).toEqual(previous);
    });

    it("hooks runtime errors before mount and retains the same identity", () => {
        const listeners = new Map<string, (event: any) => void>();
        vi.stubGlobal("window", { addEventListener: (name: string, callback: (event: any) => void) => listeners.set(name, callback) });
        const app = createSSRApp({ render: () => null });
        const fatal = vi.fn();
        installDiagnosticHandling(app, () => "Friendly runtime failure", fatal);
        const error = new Error("private");
        app.config.errorHandler?.(error, null, "render");
        const first = runtimeFailure.value?.diagnostic?.id;
        listeners.get("unhandledrejection")?.({ reason: error, preventDefault() {} });
        expect(runtimeFailure.value?.diagnostic?.id).toBe(first);
        expect(fatal).toHaveBeenCalledWith(error);
    });
});

describe("copy and rendering", () => {
    it("copies exactly the full ID and handles denial or unavailable clipboard", async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal("navigator", { clipboard: { writeText } });
        expect(await copyDiagnosticId("complete-request-id")).toBe(true);
        expect(writeText).toHaveBeenCalledWith("complete-request-id");
        writeText.mockRejectedValue(new Error("denied"));
        expect(await copyDiagnosticId("complete-request-id")).toBe(false);
        vi.stubGlobal("navigator", {});
        expect(await copyDiagnosticId("complete-request-id")).toBe(false);
    });

    async function render(text: ErrorPresentation) {
        const app = createSSRApp(GlobalErrorText, { text, icon: false });
        app.use(createI18n({ legacy: false, locale: "en-US", messages: { "en-US": {
            diagnostics_requestId: "Request ID",
            diagnostics_frontendId: "Frontend diagnostic ID",
            diagnostics_copy: "Copy ID",
            diagnostics_copied: "Copied",
            diagnostics_copyFailed: "Could not copy",
            diagnostics_dismiss: "Dismiss",
        } } }));
        const context: { teleports?: Record<string, string> } = {};
        const html = await renderToString(app, context);
        return html + Object.values(context.teleports ?? {}).join("");
    }

    it("keeps local validation free of an ID or copy control", async () => {
        const html = await render("Name is required");
        expect(html).toContain("Name is required");
        expect(html).not.toContain("<button");
        expect(html).not.toContain("role=\"tooltip\"");
    });

    it.each(["request", "frontend"] as const)("renders a labelled hidden full ID for %s even with decorative icons disabled", async (kind) => {
        const html = await render({ message: "Friendly failure", diagnostic: { kind, id: "complete-diagnostic-id" } });
        expect(html).toContain("Friendly failure");
        expect(html).toContain(kind === "request" ? "Request ID" : "Frontend diagnostic ID");
        expect(html).toContain("complete-diagnostic-id");
        expect(html).toContain("aria-describedby=");
        expect(html).toContain("role=\"tooltip\"");
        expect(html).toMatch(/display:\s*none/);
        expect(html).toContain("type=\"button\"");
        expect(html).not.toContain("<p>complete-diagnostic-id</p>");
    });
});

describe("oAuth response and redirect diagnostics", () => {
    it("retains native fetch header/body diagnostics and domain fields", async () => {
        const failure = await authResponseFailure(new Response(JSON.stringify({ status: 401, title: "Unauthorized", requestId: "body-id", errorCode: 2 }), {
            status: 401,
            headers: { "X-Request-ID": "header-id", "Content-Type": "application/problem+json" },
        }));
        expect(failure).toMatchObject({ requestId: "header-id", requestIdMismatch: true, statusCode: 401, problemDetails: { errorCode: 2 } });
        expect(authDiagnosticState(failure)).toEqual({ loginDiagnostic: { kind: "request", id: "header-id" } });
    });

    it("preserves actual status and identity when a token success body is contract-invalid", async () => {
        await expect(authTokenGrant(new Response("{}", { status: 200, headers: { "X-Request-ID": "invalid-grant-attempt" } })))
            .rejects
            .toMatchObject({ statusCode: 200, requestId: "invalid-grant-attempt", response: { failureKind: "contract" } });
    });

    it("uses a separately labelled frontend fallback for legacy fetch failures", async () => {
        const failure = await authResponseFailure(new Response("Legacy failure", { status: 503 }));
        expect(failure.requestId).toBeUndefined();
        expect(authDiagnosticState(failure)).toHaveProperty("loginDiagnostic.kind", "frontend");
    });
});
