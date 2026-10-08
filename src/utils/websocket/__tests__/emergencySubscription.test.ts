import type { WebSocketMessage } from "@/@types/types.ts";
import type { EmergencyEventConnection } from "@/utils/websocket/emergencySubscription.ts";
import { expect, it, vi } from "vitest";

import { subscribeToEmergencyEvents } from "@/utils/websocket/emergencySubscription.ts";

it("removes the exact event handlers that it registered", () => {
    const connection: EmergencyEventConnection = {
        on: vi.fn(),
        off: vi.fn(),
    };
    const onCreate = vi.fn<(message: WebSocketMessage) => Promise<void>>();
    const onUpdate = vi.fn<(message: WebSocketMessage) => Promise<void>>();

    const dispose = subscribeToEmergencyEvents(connection, { onCreate, onUpdate });

    expect(connection.on).toHaveBeenNthCalledWith(1, "EmergencyCreate", onCreate);
    expect(connection.on).toHaveBeenNthCalledWith(2, "EmergencyUpdate", onUpdate);

    dispose();

    expect(connection.off).toHaveBeenNthCalledWith(1, "EmergencyCreate", onCreate);
    expect(connection.off).toHaveBeenNthCalledWith(2, "EmergencyUpdate", onUpdate);
});
