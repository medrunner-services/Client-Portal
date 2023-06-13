<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { useUserStore } from "@/stores/userStore";
const { t } = useI18n();

const userStore = useUserStore();

const emit = defineEmits(["disconnectUser", "closeModal"]);
</script>

<template>
    <div class="fixed left-0 right-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-gray-400/50 px-8 py-16">
        <div class="relative max-h-full w-full overflow-y-auto bg-white p-4 shadow lg:w-1/3">
            <div class="w-full">
                <img @click="emit('closeModal')" src="/icons/close-button.svg" alt="Close" class="ml-auto h-6 w-6 cursor-pointer" />
            </div>
            <div class="px-2 lg:px-4 lg:py-4">
                <div class="mt-2">
                    <p class="font-Mohave text-2xl font-bold text-primary-900 lg:text-3xl">{{ userStore.user.rsiHandle }}</p>
                </div>

                <button @click="emit('disconnectUser')" class="button-primary button-48 mt-10">
                    {{ t("navbar_disconnect") }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
