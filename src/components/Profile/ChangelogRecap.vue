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
                        <li>New UI! We refreshed the UI for a more modern and slick look.</li>
                        <li>Added a dashboard with lots of graphs to better understand how your emergencies went.</li>
                        <li>
                            A Service Status card was added to help you see if our emergency services are operational or not before submitting an
                            emergency.
                        </li>
                    </ul>
                </div>

                <div class="mt-8 w-full">
                    <p class="text-xl font-semibold">{{ t("user_improvementsTitle") }}</p>
                    <ul class="mt-2 flex list-inside list-disc flex-col gap-1">
                        <li>The User Profile modal was put into a dedicated page with the API Token management.</li>
                        <li>
                            Redesign of the emergency section in it's own page. It's is much easier to understand the forms and chat without the
                            history section in the same page, content shifting has been greatly reduced.
                        </li>
                        <li>
                            The history table was remade from the ground up making it much easier to navigate and understand the information
                            presented. A selector to choose the number of row per pages was added for those who wants to see them all at once!
                        </li>
                        <li>The emergency success rate is now shown to the tenth.</li>
                        <li>
                            Changed the animation settings on the login screen to use sliders instead of number fields. Much more fun to play with
                            sliders!
                        </li>
                    </ul>
                </div>

                <div class="mt-8 w-full">
                    <p class="text-xl font-semibold">{{ t("user_bugFixesTitle") }}</p>
                    <ul class="mt-2 flex list-inside list-disc flex-col gap-1">
                        <li>Lots of bugs where corrected while refactoring our codebase for the new UI!</li>
                    </ul>
                </div>
            </div>
        </GlobalCard>
    </div>
</template>

<style scoped></style>
