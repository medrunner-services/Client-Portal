import type { WebSocketMessage } from "@/@types/types.ts";

export type EmergencyEventName = "EmergencyCreate" | "EmergencyUpdate";
export type EmergencyEventHandler = (message: WebSocketMessage) => void | Promise<void>;

/** The subset of the SignalR connection needed to own an emergency-event subscription. */
export interface EmergencyEventConnection {
    on: (eventName: EmergencyEventName, handler: EmergencyEventHandler) => void;
    off: (eventName: EmergencyEventName, handler: EmergencyEventHandler) => void;
}

/**
 * Registers the two emergency handlers and returns their exact inverse operation.
 *
 * SignalR removes a handler by function identity, so this keeps navigation cleanup from
 * accidentally leaving a previous component instance subscribed.
 */
export function subscribeToEmergencyEvents(
    connection: EmergencyEventConnection,
    handlers: {
        onCreate: EmergencyEventHandler;
        onUpdate: EmergencyEventHandler;
    },
): () => void {
    connection.on("EmergencyCreate", handlers.onCreate);
    connection.on("EmergencyUpdate", handlers.onUpdate);

    return () => {
        connection.off("EmergencyCreate", handlers.onCreate);
        connection.off("EmergencyUpdate", handlers.onUpdate);
    };
}
