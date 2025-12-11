<script setup lang="ts">
import { PersonType } from "@medrunner/api-client";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";

import BugReportModal from "@/components/Modals/BugReportModal.vue";
import CodeRedeemModal from "@/components/Modals/CodeRedeemModal.vue";
import LanguageDropdown from "@/components/Navbar/LanguageDropdown.vue";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore.ts";

const logicStore = useLogicStore();
const userStore = useUserStore();
const { t } = useI18n();

const showBugReportModal = ref(false);
const showCodeRedeemModal = ref(false);
</script>

<template>
    <div class="content-container flex flex-wrap items-center justify-between py-4">
        <RouterLink to="/" class="flex items-center">
            <img :src="logicStore.medrunnerLogoUrl" class="h-10" alt="Medrunner Logo">
        </RouterLink>

        <ul class="flex gap-5">
            <li>
                <RouterLink to="/">
                    {{ t("navbar_home") }}
                </RouterLink>
            </li>
            <li>
                <RouterLink to="/emergency">
                    {{ t("navbar_emergency") }}
                </RouterLink>
            </li>
        </ul>

        <div class="flex items-center">
            <p class="cursor-pointer" @click="showCodeRedeemModal = true">
                {{ t("profile_redeemCode") }}
            </p>
            <div class="mx-5 h-4 border border-gray-300" />
            <p
                class="
                    cursor-pointer text-primary-600
                    dark:text-red-700
                " @click="showBugReportModal = true"
            >
                {{ t("navbar_reportBug") }}
            </p>
            <div v-if="userStore.user.personType === PersonType.STAFF" class="mx-5 h-4 border border-gray-300" />
            <a
                v-if="userStore.user.personType === PersonType.STAFF"
                :href="logicStore.medrunnerStaffPortalUrl"
                target="_blank"
                :title="t('navbar_staffPortal')"
                class="flex gap-2"
            >
                <p class="cursor-pointer">{{ t("navbar_staffPortal") }}</p>
                <svg
                    class="
                        h-4 w-4 cursor-pointer text-gray-900
                        dark:text-white
                    "
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778"
                    />
                </svg>
            </a>
            <div class="mx-5 h-4 border border-gray-300" />
            <LanguageDropdown />
            <div class="mx-5 h-4 border border-gray-300" />
            <RouterLink to="/profile">
                <svg
                    class="
                        h-5 w-5 text-gray-800
                        dark:text-gray-50
                    "
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 14 18"
                >
                    <path
                        d="M7 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm2 1H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z"
                    />
                </svg>
            </RouterLink>
        </div>

        <BugReportModal v-if="showBugReportModal" @close="showBugReportModal = false" />
        <CodeRedeemModal v-if="showCodeRedeemModal" @close="showCodeRedeemModal = false" />
    </div>
</template>

<style scoped></style>
