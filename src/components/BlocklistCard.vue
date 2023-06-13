<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { useBlocklistStore } from "@/stores/blocklistStore";

const blocklistStore = useBlocklistStore();
const { t } = useI18n();
</script>

<template>
    <div class="mt-20 text-center lg:mt-32">
        <div v-if="blocklistStore.isQueryEmpty">
            <p class="font-Mohave text-3xl font-bold uppercase lg:text-4xl">✅ {{ t("blocklist_NotBlocked") }}</p>
        </div>

        <div v-if="blocklistStore.curentQuery.length >= 1">
            <p class="mb-10 font-Mohave text-3xl font-bold uppercase lg:text-4xl">❌ {{ t("blocklist_Blocked") }}</p>
            <p
                v-if="blocklistStore.curentQuery[0].rsiHandle"
                class="font-Inter text-xl"
                v-html="
                    t('blocklist_UserResult', {
                        username: `<span class='font-semibold text-primary-900'>${blocklistStore.curentQuery[0].rsiHandle}</span>`,
                    })
                "
            ></p>
            <p
                v-if="blocklistStore.curentQuery[0].orgSid"
                class="font-Inter text-xl"
                v-html="
                    t('blocklist_OrgResult', {
                        organisationName: `<span class='font-semibold text-primary-900'>${blocklistStore.curentQuery[0].orgSid}</span>`,
                    })
                "
            ></p>
        </div>
    </div>
</template>

<style scoped></style>
