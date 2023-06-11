<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { useUserStore } from "@/stores/userStore";
const { t } = useI18n();

const userStore = useUserStore();

const emit = defineEmits(["disconnectUser", "closeModal"]);
</script>

<template>
    <div class="fixed flex items-center justify-center top-0 left-0 right-0 z-50 w-screen h-screen bg-gray-400/50 px-8 py-16">
        <div class="relative bg-white shadow w-full px-4 py-4 overflow-y-auto max-h-full lg:w-1/3">
            <div class="w-full">
                <img @click="emit('closeModal')" src="/icons/close-button.svg" alt="Close" class="w-6 h-6 ml-auto cursor-pointer" />
            </div>
            <div class="mt-2">
                <p class="text-primary-900 font-Mohave font-bold text-2xl lg:ml-3 lg:text-3xl">{{ userStore.user.rsiHandle }}</p>
            </div>

            <button @click="emit('disconnectUser')" class="button-primary font-Inter font-semibold text-small px-5 py-[6px] mt-10">
                {{ t("navbar_disconnect") }}
            </button>
        </div>
    </div>
</template>

<style scoped></style>
