import type { ChatMessage } from "@medrunner/api-client";
import type { LocalChatMessage } from "@/@types/types.ts";
import { Class } from "@medrunner/api-client";

export interface OptimisticClientMessageInput extends Pick<ChatMessage, "emergencyId" | "senderId" | "senderRsiHandle" | "contents"> {
    timestamp: ChatMessage["created"];
}

/** Builds the complete temporary message shown while the client request is pending. */
export function createOptimisticClientMessage(input: OptimisticClientMessageInput): LocalChatMessage {
    return {
        id: "",
        created: input.timestamp,
        updated: input.timestamp,
        emergencyId: input.emergencyId,
        senderId: input.senderId,
        senderRsiHandle: input.senderRsiHandle,
        senderClass: Class.NONE,
        contents: input.contents,
        edited: false,
        deleted: false,
        local: true,
        error: false,
    };
}
