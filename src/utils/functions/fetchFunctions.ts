import type { PaginatedResponse } from "@medrunner/api-client";

export async function fetchAllPaginatedResponse<T, Args extends any[]>(
    fetchFunction: (limit: number, token?: string, ...args: Args) => Promise<PaginatedResponse<T>>,
    ...args: Args
): Promise<{ data: T[]; totalCount: number }> {
    const results: T[] = [];
    let paginationToken: string | undefined;
    let totalCount = 0;

    do {
        const response = await fetchFunction(100, paginationToken, ...args);
        results.push(...response.data);
        totalCount = response.totalCount;

        if (response.paginationToken)
            paginationToken = response.paginationToken;
        else paginationToken = undefined;
    } while (paginationToken);

    return { data: results, totalCount };
}
