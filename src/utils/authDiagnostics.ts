import { ApiContractError, ApiFailureError, normalizeApiFailure, parseTokenGrant } from "@medrunner/api-client";
import { presentFailure } from "@/utils/errorDiagnostics";

/** OAuth uses fetch before the SDK is initialized, so retain its received HTTP context explicitly. */
async function authResponseContext(response: Response) {
    const headers = Object.fromEntries(response.headers.entries());
    let data: unknown;
    try {
        data = await response.json();
    }
    catch { /* Empty and non-JSON errors still retain their response header and status. */ }
    return { status: response.status, headers, data };
}

export async function authResponseFailure(response: Response) {
    return normalizeApiFailure(undefined, await authResponseContext(response));
}

export async function authTokenGrant(response: Response) {
    const received = await authResponseContext(response);
    try {
        return parseTokenGrant(received.data);
    }
    catch (error) {
        const contract = error instanceof ApiContractError ? error : new ApiContractError("auth response", "/", "json");
        throw new ApiFailureError(normalizeApiFailure<never>(contract, received));
    }
}

/** Route-scoped state avoids a global last-request ID and never puts diagnostics in the OAuth URL. */
export function authDiagnosticState(error: unknown) {
    const presentation = presentFailure(error, "");
    const diagnostic = typeof presentation === "string" ? undefined : presentation.diagnostic;
    return { loginDiagnostic: diagnostic ? { kind: diagnostic.kind, id: diagnostic.id } : null };
}
