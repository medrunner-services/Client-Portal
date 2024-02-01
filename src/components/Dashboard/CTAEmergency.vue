<script setup lang="ts">
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const { t } = useI18n();

function getTitle() {
    if (userStore.user.activeEmergency) return t("home_emergencyOngoingCTATitle");
    else return t("home_emergencyCTATitle");
}

function getButtonText() {
    if (userStore.user.activeEmergency) return t("home_emergencyOngoingCTAButton");
    else return t("home_emergencyCTAButton");
}
</script>

<template>
    <GlobalCard>
        <div>
            <h2 class="mb-4 font-Mohave text-2xl font-semibold">{{ getTitle() }}</h2>
            <RouterLink class="block w-full lg:w-fit" to="/emergency">
                <GlobalButton size="full" class="w-full lg:w-fit">{{ getButtonText() }}</GlobalButton>
            </RouterLink>
        </div>
    </GlobalCard>
</template>

<style scoped></style>
