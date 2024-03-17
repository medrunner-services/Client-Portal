<script setup lang="ts">
import { useI18n } from "vue-i18n";

import GlobalCard from "@/components/utils/GlobalCard.vue";

const { t } = useI18n();

const appVersion = __APP_VERSION__;
</script>

<template>
    <div>
        <div class="flex min-h-11 items-center justify-between">
            <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("user_whatsNew") }}</h2>
            <p class="rounded-full bg-primary-100 px-2 py-1 text-xs font-semibold text-primary-600">v{{ appVersion }}</p>
        </div>

        <GlobalCard class="mt-4 flex flex-col">
            <div>
                <div class="w-full">
                    <p class="text-xl font-semibold">{{ t("user_newFeaturesTitle") }}</p>
                    <ul class="mt-2 flex list-inside list-disc flex-col gap-1">
                        <li>Added debug info to the current ongoing emergency and the history emergencies.</li>
                        <li>The page the user landed on is now saved throughout the login process.</li>
                        <li>Removed access to the Medrunner blocklist.</li>
                    </ul>
                </div>

                <div class="mt-8 w-full">
                    <p class="text-xl font-semibold">{{ t("user_improvementsTitle") }}</p>
                    <ul class="mt-2 flex list-inside list-disc flex-col gap-1">
                        <li>The chat box will now be hidden when the mission was submitted on discord.</li>
                        <li>Chat messages will now load all the way up and be loaded only a few at a time.</li>
                        <li>The chat box messages styling has been improved.</li>
                        <li>Improved performance in the dashboard.</li>
                        <li>Their will no longer be an automatic message sent at the beginning of each emergency.</li>
                        <li>The disconnect button was moved and renamed to log out to improve clarity.</li>
                        <li>Improved loading screen.</li>
                        <li>Improved error handling when the app failed after being brought back from sleep.</li>
                        <li>The url is now cleaned after the message has been read in the url.</li>
                        <li>Optimized images.</li>
                    </ul>
                </div>

                <div class="mt-8 w-full">
                    <p class="text-xl font-semibold">{{ t("user_bugFixesTitle") }}</p>
                    <ul class="mt-2 flex list-inside list-disc flex-col gap-1">
                        <li>The nearest location card in the emergency tracking was shown even when the user did not select one in the form.</li>
                        <li>The user is now disconnected on multiple failed automatic logins.</li>
                        <li>Fixed date format not displaying correctly.</li>
                        <li>Fixed a few styling issues and visual bugs.</li>
                    </ul>
                </div>
            </div>
        </GlobalCard>
    </div>
</template>

<style scoped></style>
