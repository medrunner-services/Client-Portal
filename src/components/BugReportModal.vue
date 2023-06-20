<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { useLogicStore } from "@/stores/logicStore";

const logicStore = useLogicStore();
const { t } = useI18n();

const clipboardIcon = ref("/icons/copy-icon.svg");
const userAgent = navigator.userAgent;

const copyUserAgentToClipboard = (): void => {
    navigator.clipboard.writeText(userAgent).then(() => {
        clipboardIcon.value = "/icons/check-icon.svg";
    });
};
</script>

<template>
    <p class="mb-5 mt-2 font-Mohave text-2xl font-semibold text-primary-900">{{ t("bugReport_title") }}</p>
    <p class="underline">{{ t("bugReport_copyUserAgent") }}</p>
    <div class="mt-2 flex">
        <div class="w-full bg-neutral-700 text-center font-Inter text-xs text-neutral-50">
            <p class="mx-auto py-3">
                {{ userAgent }}
            </p>
        </div>
        <img :src="clipboardIcon" class="ml-3 cursor-pointer xl:ml-6" alt="copy id" @click="copyUserAgentToClipboard()" />
    </div>

    <a
        :href="`${logicStore.discordBaseUrl}discord.com/channels/730982567972700281/1117565276804874360`"
        target="_blank"
        class="mt-10 flex w-fit items-center border-b-2 border-primary-900 font-Inter font-semibold text-primary-900"
    >
        <span>{{ t("bugReport_createBugReport") }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="ml-2 h-5 w-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        </svg>
    </a>
</template>

<style scoped></style>
