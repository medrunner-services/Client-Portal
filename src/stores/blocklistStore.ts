import type { ApiResponse, BlockReport } from "@medrunner-services/api-client";
import { defineStore } from "pinia";

import { api } from "@/utils/medrunnerClient";

export const useBlocklistStore = defineStore("blocklist", () => {
    async function fetchBlocklist(type: "user" | "org", handle: string): Promise<BlockReport[]> {
        let response: ApiResponse<BlockReport[]>;

        if (type === "user") {
            response = await api.block.lookUpUser({ rsiHandle: handle });
        } else {
            response = await api.block.lookUpOrg({ orgSid: handle });
        }

        if (response.success && response.data) {
            return response.data;
        } else {
            throw response;
        }
    }

    return {
        fetchBlocklist,
    };
});
