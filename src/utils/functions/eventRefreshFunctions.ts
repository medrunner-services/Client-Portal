/**
 * Wait for a brief quiet period before refreshing an entity from a burst of websocket events.
 *
 * Each entity keeps one pending promise so independent listeners can await the same eventual
 * refresh instead of issuing identical detail requests.
 */
export function createEventRefresh<T>(
    fetchEntity: (id: string) => Promise<T>,
    debounceMs = 150,
): (id: string) => Promise<T> {
    const pendingRefreshes = new Map<string, PendingEventRefresh<T>>();

    function scheduleRefresh(id: string, pendingRefresh: PendingEventRefresh<T>): void {
        pendingRefresh.timeout = setTimeout(async () => {
            pendingRefresh.timeout = undefined;

            try {
                pendingRefresh.resolve(await fetchEntity(id));
            }
            catch (error) {
                pendingRefresh.reject(error);
            }
            finally {
                if (pendingRefreshes.get(id) === pendingRefresh) {
                    pendingRefreshes.delete(id);
                }
            }
        }, debounceMs);
    }

    return (id: string): Promise<T> => {
        const existingRefresh = pendingRefreshes.get(id);
        if (existingRefresh) {
            if (existingRefresh.timeout !== undefined) {
                clearTimeout(existingRefresh.timeout);
                scheduleRefresh(id, existingRefresh);
            }

            return existingRefresh.promise;
        }

        let resolve!: (value: T) => void;
        let reject!: (reason?: unknown) => void;
        const promise = new Promise<T>((promiseResolve, promiseReject) => {
            resolve = promiseResolve;
            reject = promiseReject;
        });
        const pendingRefresh: PendingEventRefresh<T> = {
            promise,
            resolve,
            reject,
            timeout: undefined,
        };

        pendingRefreshes.set(id, pendingRefresh);
        scheduleRefresh(id, pendingRefresh);

        return promise;
    };
}

interface PendingEventRefresh<T> {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (reason?: unknown) => void;
    timeout: ReturnType<typeof setTimeout> | undefined;
}
