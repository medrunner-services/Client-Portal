<script setup lang="ts">
import { useI18n } from "vue-i18n";

import GlobalCard from "@/components/utils/GlobalCard.vue";

const { t } = useI18n();

const appVersion = __APP_VERSION__;
</script>

<template>
    <div>
        <div class="flex items-center justify-between">
            <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("user_whatsNew") }}</h2>
            <p class="rounded-full bg-primary-100 px-2 py-1 text-xs font-semibold text-primary-600">v{{ appVersion }}</p>
        </div>

        <GlobalCard class="mt-4 flex flex-col items-center justify-center">
            <div>
                <div class="w-full">
                    <p class="text-xl font-semibold">{{ t("user_newFeaturesTitle") }}</p>
                    <ul class="mt-2 flex list-inside list-disc flex-col gap-1">
                        <li>
                            You can now get pinged in chat! If a someone pings you with a @ symbole before your name you will see your name
                            highlighted and receive a browser notification.
                        </li>
                        <li>Added Chinese Traditional to the list of available languages.</li>
                    </ul>
                </div>

                <div class="mt-8 w-full">
                    <p class="text-xl font-semibold">{{ t("user_improvementsTitle") }}</p>
                    <ul class="mt-2 flex list-inside list-disc flex-col gap-1">
                        <li>Aligned the modal titles with the close icon.</li>
                        <li>Made the team lead stand out in the emergency history.</li>
                        <li>Restricted the responder success rate to show only when there is at least 3 responders.</li>
                        <li>Blocked user clearly see what they can and cannot do in the portal and have a warning message in their dashboard.</li>
                    </ul>
                </div>

                <div class="mt-8 w-full">
                    <p class="text-xl font-semibold">{{ t("user_bugFixesTitle") }}</p>
                    <ul class="mt-2 flex list-inside list-disc flex-col gap-1">
                        <li>Missing translations in some buttons.</li>
                        <li>Chat messages of a user showing as "Medrunner staff" in the chat box.</li>
                        <li>Duplication of emergencies in history table when changing the lines per row.</li>
                    </ul>
                </div>
            </div>
        </GlobalCard>
    </div>
</template>

<style scoped></style>
