import { afterEach, expect, it, vi } from "vitest";

import { createEventRefresh } from "@/utils/functions/eventRefreshFunctions.ts";

afterEach(() => {
    vi.useRealTimers();
});

it("coalesces a burst of event refreshes for the same emergency into one trailing request", async () => {
    vi.useFakeTimers();
    const fetchEmergency = vi.fn(async (id: string) => ({ id }));
    const refreshForEvent = createEventRefresh(fetchEmergency, 150);

    const firstRefresh = refreshForEvent("emergency-1");
    await vi.advanceTimersByTimeAsync(75);
    const secondRefresh = refreshForEvent("emergency-1");
    await vi.advanceTimersByTimeAsync(149);

    expect(fetchEmergency).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);

    expect(fetchEmergency).toHaveBeenCalledExactlyOnceWith("emergency-1");
    await expect(Promise.all([firstRefresh, secondRefresh])).resolves.toEqual([
        { id: "emergency-1" },
        { id: "emergency-1" },
    ]);
});

it("does not retain a failed event refresh and retries the next event", async () => {
    vi.useFakeTimers();
    const fetchEmergency = vi.fn()
        .mockRejectedValueOnce(new Error("temporary failure"))
        .mockResolvedValueOnce({ id: "emergency-1" });
    const refreshForEvent = createEventRefresh(fetchEmergency, 150);

    const failedRefresh = refreshForEvent("emergency-1");
    const failedAssertion = expect(failedRefresh).rejects.toThrow("temporary failure");
    await vi.advanceTimersByTimeAsync(150);

    await failedAssertion;

    const retryRefresh = refreshForEvent("emergency-1");
    await vi.advanceTimersByTimeAsync(150);

    await expect(retryRefresh).resolves.toEqual({ id: "emergency-1" });
    expect(fetchEmergency).toHaveBeenCalledTimes(2);
});
