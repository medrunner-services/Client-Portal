import type { PaginatedResponse } from "@medrunner/api-client";
import { normalizePaginationToken, normalizeTotalCount } from "@/utils/functions/apiResponseFunctions.ts";

export async function fetchAllPaginatedResponse<T, Args extends unknown[]>(
    fetchFunction: (limit: number, token?: string, ...args: Args) => Promise<PaginatedResponse<T>>,
    ...args: Args
): Promise<{ data: T[]; totalCount: number }> {
    const results: T[] = [];
    let paginationToken: string | undefined;
    let totalCount = 0;

    do {
        const response = await fetchFunction(100, paginationToken, ...args);
        results.push(...response.data);
        totalCount = normalizeTotalCount(response.totalCount);
        paginationToken = normalizePaginationToken(response.paginationToken);
    } while (paginationToken);

    return { data: results, totalCount };
}
