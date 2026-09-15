import type { ApiResponse, PaginatedResponse } from "@medrunner/api-client";

type PaginationToken = PaginatedResponse<unknown>["paginationToken"];
type TotalCount = PaginatedResponse<unknown>["totalCount"];

/** Converts the API's nullable pagination token to the portal's optional-token convention. */
export function normalizePaginationToken(token: PaginationToken): string | undefined {
    return token ?? undefined;
}

/** Converts a valid API total count to the numeric value expected by pagination state. */
export function normalizeTotalCount(totalCount: TotalCount): number {
    if (typeof totalCount === "string" && totalCount.trim().length === 0)
        throw new TypeError("API total count must be a finite non-negative integer");

    const normalizedTotalCount = Number(totalCount);

    if (!Number.isFinite(normalizedTotalCount) || !Number.isInteger(normalizedTotalCount) || normalizedTotalCount < 0)
        throw new TypeError("API total count must be a finite non-negative integer");

    return normalizedTotalCount;
}

/** Returns populated successful response data, preserving the original response on failure. */
export function requireResponseData<T>(response: ApiResponse<T>): T {
    if (!response.success || response.data === undefined)
        throw response;

    return response.data;
}
