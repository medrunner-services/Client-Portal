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
                        <li>The portal is now out of Beta!</li>
                        <li>Added the ability to redeem promotional codes to your account, and see what codes you have redeemed in your profile.</li>
                        <li>Added Norwegian to the available languages.</li>
                    </ul>
                </div>

                <div class="mt-8 w-full">
                    <p class="text-xl font-semibold">{{ t("user_improvementsTitle") }}</p>
                    <ul class="mt-2 flex list-inside list-disc flex-col gap-1">
                        <li>Improved error codes across the app.</li>
                        <li>Made the cancel emergency button disabled instead of hidden.</li>
                    </ul>
                </div>

                <div class="mt-8 w-full">
                    <p class="text-xl font-semibold">{{ t("user_bugFixesTitle") }}</p>
                    <ul class="mt-2 flex list-inside list-disc flex-col gap-1">
                        <li>Fixed a lot of little bugs.</li>
                    </ul>
                </div>
            </div>
        </GlobalCard>
    </div>
</template>

<style scoped></style>
