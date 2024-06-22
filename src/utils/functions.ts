import type { PaginatedResponse } from "@medrunner/api-client";

export async function fetchAllPaginatedResponse<T>(
    fetchFunction: (limit?: number, token?: string) => Promise<PaginatedResponse<T>>,
    limit?: number,
): Promise<T[]> {
    const results: T[] = [];
    let paginationToken: string | undefined;
    do {
        const response = await fetchFunction(20, paginationToken);
        results.push(...response.data);
        if (response.paginationToken) paginationToken = response.paginationToken;
        else paginationToken = undefined;
    } while (paginationToken && (!limit || results.length < limit));

    return results;
}
