import type { ApiResponse, BlockReport } from "@medrunner-services/api-client";
import { defineStore } from "pinia";
import { ref } from "vue";

import { api } from "@/utils/medrunnerClient";

export const useBlocklistStore = defineStore("blocklist", () => {

    const curentQuery = ref([] as BlockReport[]);
    const isQueryEmpty = ref(false);
    async function fetchBlocklist(type: string, handle: string): Promise<BlockReport[]> {
        let response: ApiResponse<BlockReport[]>;

        if (type === "user") {
            response = await api.block.lookUpUser({ rsiHandle: handle });
        } else {
            response = await api.block.lookUpOrg({ orgSid: handle });
        }

        if (response.success && response.data) {
            return response.data;
        } else {
            throw response.statusCode;
        }
    }

    return {
        curentQuery,
        isQueryEmpty,
        fetchBlocklist,
    };
});
