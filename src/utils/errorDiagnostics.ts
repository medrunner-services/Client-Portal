import type { App } from "vue";
import { shallowRef, toRaw } from "vue";

export interface DiagnosticReference {
    kind: "request" | "frontend";
    id: string;
}

export interface PortalError {
    message: string;
    diagnostic?: DiagnosticReference;
}

/** Strings are reserved for ordinary local validation and existing informational messages. */
export type ErrorPresentation = string | PortalError;

export interface FrontendDiagnosticRecord {
    id: string;
    classification: string;
    portal: string;
    version: string;
    timestamp: string;
}

interface DiagnosticOptions {
    portal: string;
    version: string;
    canReport?: () => boolean;
    report?: (record: Readonly<FrontendDiagnosticRecord>) => void;
}

let options: DiagnosticOptions = { portal: "portal", version: "unknown" };
const occurrences = new WeakMap<object, DiagnosticReference>();
const records: FrontendDiagnosticRecord[] = [];
export const runtimeFailure = shallowRef<PortalError>();

export function configureFrontendDiagnostics(configuration: DiagnosticOptions): void {
    options = configuration;
}

export function frontendDiagnosticRecords(): ReadonlyArray<Readonly<FrontendDiagnosticRecord>> {
    return records.map(record => ({ ...record }));
}

function record(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function identifier(value: unknown): string | undefined {
    return typeof value === "string" && /^[\x21-\x2B\x2D-\x7E]{1,256}$/.test(value) ? value : undefined;
}

function uuid(): string {
    if (globalThis.crypto?.randomUUID)
        return globalThis.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (globalThis.crypto?.getRandomValues) {
        globalThis.crypto.getRandomValues(bytes);
    }
    else {
        bytes.forEach((_, index) => {
            bytes[index] = Math.floor(Math.random() * 256);
        });
    }
    bytes[6] = ((bytes[6] ?? 0) & 0x0F) | 0x40;
    bytes[8] = ((bytes[8] ?? 0) & 0x3F) | 0x80;
    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function isExpectedCancellation(error: unknown): boolean {
    return record(error) && (error.failureKind === "cancelled" || error.name === "AbortError" || error.code === "ERR_CANCELED" || error.__v_isNavigationFailure === true);
}

/** One identity per occurrence; a custom message never changes the failure's identity. */
export function presentFailure(error: unknown, message: string): ErrorPresentation {
    if (isExpectedCancellation(error))
        return "";
    const raw = record(error) ? toRaw(error) : undefined;
    if (raw && typeof raw.message === "string" && record(raw.diagnostic)
        && (raw.diagnostic.kind === "request" || raw.diagnostic.kind === "frontend") && identifier(raw.diagnostic.id)) {
        return { message, diagnostic: { kind: raw.diagnostic.kind, id: String(raw.diagnostic.id) } };
    }
    const problem = raw && record(raw.problemDetails) ? raw.problemDetails : undefined;
    const serverId = identifier(raw?.requestId) ?? identifier(problem?.requestId);
    if (serverId)
        return { message, diagnostic: { kind: "request", id: serverId } };
    const previous = raw ? occurrences.get(raw) : undefined;
    if (previous)
        return { message, diagnostic: previous };

    const diagnostic: DiagnosticReference = { kind: "frontend", id: uuid() };
    if (raw)
        occurrences.set(raw, diagnostic);
    const classification = raw?.failureKind === "transport"
        ? "transport"
        : raw?.failureKind === "contract" || raw?.name === "ApiContractError"
            ? "contract"
            : raw?.failureKind === "http" ? "http" : "frontend";
    const entry: FrontendDiagnosticRecord = {
        id: diagnostic.id,
        classification,
        portal: options.portal,
        version: options.version,
        timestamp: new Date().toISOString(),
    };
    records.push(Object.freeze(entry));
    if (records.length > 100)
        records.shift();
    try {
        console.warn("Frontend diagnostic", entry);
    }
    catch { /* Reporting must never cause another failure. */ }
    try {
        if (options.canReport?.())
            options.report?.(entry);
    }
    catch { /* Offline/disabled reporting never removes local diagnostics. */ }
    return { message, diagnostic };
}

export function errorPresentationText(error: ErrorPresentation): string {
    return typeof error === "string" ? error : error.message;
}

export async function copyDiagnosticId(id: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(id);
        return true;
    }
    catch { return false; }
}

/** Registers before async initialization; the APM plugin's duplicate error capture is disabled. */
export function installDiagnosticHandling(app: App, message: () => string, fatal?: (error: unknown) => void): void {
    const capture = (error: unknown) => {
        const presentation = presentFailure(error, message());
        if (presentation)
            runtimeFailure.value = typeof presentation === "string" ? { message: presentation } : presentation;
    };
    app.config.errorHandler = (error, instance) => {
        capture(error);
        if (!instance || instance.$parent === null)
            fatal?.(error);
    };
    window.addEventListener("error", (event) => {
        capture(event.error ?? event);
        event.preventDefault();
    });
    window.addEventListener("unhandledrejection", (event) => {
        capture(event.reason);
        event.preventDefault();
    });
}

/** A Vue-independent fallback when initialization cannot mount the regular error surface. */
export function showBootstrapFailure(error: unknown, message: string, labels: { request: string; frontend: string; copy: string; copied: string; failed: string }): void {
    const presentation = presentFailure(error, message);
    if (!presentation || typeof presentation === "string")
        return;
    runtimeFailure.value = presentation;
    document.getElementById("bootstrap-diagnostic-error")?.remove();
    const container = document.createElement("div");
    container.id = "bootstrap-diagnostic-error";
    container.setAttribute("role", "alert");
    container.style.cssText = "position:fixed;inset:1rem 1rem auto;z-index:9999;padding:1rem;background:#fff1f2;color:#9f1239;border:1px solid #fda4af;border-radius:.5rem";
    const text = document.createElement("p");
    text.textContent = presentation.message;
    container.append(text);
    if (presentation.diagnostic) {
        const diagnostic = presentation.diagnostic;
        const label = diagnostic.kind === "request" ? labels.request : labels.frontend;
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "\u2398";
        button.title = `${label}: ${diagnostic.id}`;
        button.setAttribute("aria-label", `${labels.copy} - ${label}: ${diagnostic.id}`);
        button.style.cssText = "padding:.5rem;cursor:pointer;border:1px solid currentColor;border-radius:.25rem";
        const status = document.createElement("span");
        status.setAttribute("role", "status");
        button.addEventListener("click", async () => {
            if (await copyDiagnosticId(diagnostic.id)) {
                status.textContent = labels.copied;
            }
            else {
                status.textContent = `${labels.failed} ${label}: ${diagnostic.id}`;
                status.style.userSelect = "text";
            }
        });
        container.append(button, status);
    }
    document.body.append(container);
}
