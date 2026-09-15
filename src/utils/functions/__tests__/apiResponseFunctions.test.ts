import type { ApiResponse } from "@medrunner/api-client";
import { expect, it } from "vitest";

const apiResponseFunctions = await import(new URL("../apiResponseFunctions.ts", import.meta.url).href)
    .catch(() => undefined);

it("exports API response normalizers", () => {
    expect(apiResponseFunctions).toBeDefined();
});

it("converts a numeric total-count string to a finite number", () => {
    expect(apiResponseFunctions?.normalizeTotalCount("42")).toBe(42);
});

it("preserves a zero total count", () => {
    expect(apiResponseFunctions?.normalizeTotalCount(0)).toBe(0);
    expect(apiResponseFunctions?.normalizeTotalCount("0")).toBe(0);
});

it.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    -1,
    1.5,
    "",
    "not-a-number",
    "-1",
    "1.5",
])("throws for malformed total count %j", (totalCount) => {
    expect(() => apiResponseFunctions?.normalizeTotalCount(totalCount)).toThrow();
});

it("maps a null pagination token to undefined", () => {
    expect(apiResponseFunctions?.normalizePaginationToken(null)).toBeUndefined();
});

it("preserves a pagination token", () => {
    expect(apiResponseFunctions?.normalizePaginationToken("next-page")).toBe("next-page");
});

it("returns present data from a successful API response", () => {
    const response: ApiResponse<number> = { success: true, data: 0 };

    expect(apiResponseFunctions?.requireResponseData(response)).toBe(0);
});

it("throws the original API response when required data is absent", () => {
    const response: ApiResponse<string> = { success: true, statusCode: 200 };

    expect(() => apiResponseFunctions?.requireResponseData(response)).toThrow();

    try {
        apiResponseFunctions?.requireResponseData(response);
    }
    catch (error: unknown) {
        expect(error).toBe(response);
        return;
    }

    throw new Error("Expected the original API response to be thrown");
});
