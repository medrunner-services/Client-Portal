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
                        <li>Added a new pop up to easily enable notifications.</li>
                        <li>Added a new login page when the user tries to log-in with an unknown discord account.</li>
                        <li>Added user badges in the profile.</li>
                        <li>Features are now synced with Medrunner Org settings.</li>
                        <li>Added an alert banner to display global announcements.</li>
                        <li>Service status on the emergency page is now synced in real time.</li>
                    </ul>
                </div>

                <div class="mt-8 w-full">
                    <p class="text-xl font-semibold">{{ t("user_improvementsTitle") }}</p>
                    <ul class="mt-2 flex list-inside list-disc flex-col gap-1">
                        <li>Added a link to medrunner.space on the login page.</li>
                        <li>The name of the responding medrunner teams is now displayed on the emergency page.</li>
                        <li>Made the loader use the same theme as the rest of the app, no more flash bangs for dark mode users!</li>
                        <li>Improved navigation and loading times.</li>
                        <li>Improved text wrapping on small screens.</li>
                    </ul>
                </div>

                <div class="mt-8 w-full">
                    <p class="text-xl font-semibold">{{ t("user_bugFixesTitle") }}</p>
                    <ul class="mt-2 flex list-inside list-disc flex-col gap-1">
                        <li>Fixed little bugs.</li>
                    </ul>
                </div>
            </div>
        </GlobalCard>
    </div>
</template>

<style scoped></style>
