<script setup lang="ts">
import { ref } from "vue";

import EmergencyHistory from "@/components/EmergencyHistory.vue";
import type { History, PaginatedResponse } from "@/stores/userStore";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
let history: PaginatedResponse<History>;
const loaded = ref(false);

userStore.fetchUserHistory(5).then(response => {
    history = response;
    loaded.value = true;
});
</script>

<template>
    <div
        class="flex flex-col-reverse lg:flex-row lg:justify-between content-container my-14 lg:my-36"
    >
        <div class="mt-10 lg:mt-0 lg:w-[35%] lg:max-w-xl">
            <h2 class="text-3xl lg:text-4xl font-Mohave font-semibold uppercase mb-5">History</h2>
            <div v-if="loaded && history?.data.length > 0">
                <EmergencyHistory
                    v-for="emergency in history.data"
                    class="mt-4 first:mt-0"
                    :emergencyId="emergency.emergencyId"
                    :createdDate="emergency.emergencyCreationTimestamp"
                />
            </div>
        </div>
        <div class="lg:w-[60%]">
            <h2 class="text-3xl lg:text-4xl font-Mohave font-semibold uppercase">Emergency</h2>
        </div>
    </div>
</template>
