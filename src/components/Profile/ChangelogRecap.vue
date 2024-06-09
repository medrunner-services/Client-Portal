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
                        <li>Added the "Distribution Center" as a location in the emergency form.</li>
                        <li>Warning on the dashboard after a no-contact emergency.</li>
                        <li>Emergency rules popup for new users when reporting an emergency.</li>
                        <li>A reset default button in settings to clear the synced settings.</li>
                        <li>You can now delete your medrunner account in your profile.</li>
                        <li>Setting to open discord links in native app or web.</li>
                        <li>Some settings are now synced to your account across your devices.</li>
                        <li>Added a new notification system that bypass the 'Do not Disturb' in windows. Can be toggled in the settings.</li>
                        <li>The emergency graph can now be toggled to display a week, a month, two moth or 90 days.</li>
                        <li>Added more settings for notifications. You can now toggle on or off each notification independently.</li>
                    </ul>
                </div>

                <div class="mt-8 w-full">
                    <p class="text-xl font-semibold">{{ t("user_improvementsTitle") }}</p>
                    <ul class="mt-2 flex list-inside list-disc flex-col gap-1">
                        <li>Improved the alert messages.</li>
                        <li>Messages now support new lines with '\n'.</li>
                        <li>Improved the linking account procedure with more information.</li>
                        <li>More details in the "In game beacon" question in the emergency details form.</li>
                        <li>Type of location in emergency details form.</li>
                        <li>Added more explanation after submitting emergencies.</li>
                        <li>Added a link to the new API documentation.</li>
                        <li>Long chat messages are now truncated with a 'Read more' button to show them in full.</li>
                        <li>Changed 'Nearest location' to 'Nearest moon' in emergency form.</li>
                    </ul>
                </div>

                <div class="mt-8 w-full">
                    <p class="text-xl font-semibold">{{ t("user_bugFixesTitle") }}</p>
                    <ul class="mt-2 flex list-inside list-disc flex-col gap-1">
                        <li>Fixed a duplication bug in the history section.</li>
                        <li>Clicking on notifications now redirects you to the correct page.</li>
                        <li>Fixed issue where scroll was blocked when clicking out of certain modals.</li>
                        <li>You will now see the emergency completion message even if you where on the details form page.</li>
                        <li>The total number of emergencies in the breakdown graph did not respect the theme.</li>
                        <li>Added missing helper message on account linking.</li>
                        <li>Fixed animation on login screen not re-activating after setting update.</li>
                    </ul>
                </div>
            </div>
        </GlobalCard>
    </div>
</template>

<style scoped></style>
