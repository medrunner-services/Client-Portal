<script setup lang="ts">
import { ref } from "vue";
import {useUserStore} from "@/stores/userStore";

const userStore = useUserStore()
const navMenuCollapsed = ref(false);

function switchNavMenuSate(): void {
    navMenuCollapsed.value = !navMenuCollapsed.value;
}

function getNavMenuClasses(): string {
    return navMenuCollapsed.value ? "h-screen" : "";
}
</script>

<template>
    <div
        :class="`fixed z-10 bg-white w-full flex flex-col shadow-md ${getNavMenuClasses()} md:static`"
    >
        <div class="py-2 px-4 flex items-center gap-2 md:px-16 md:py-3">
            <img
                class="h-8 md:h-12"
                src="/medrunner-logo.webp"
                alt="Medrunner Logo"
            />

            <h1
                class="text-primary-900 font-Mohave text-header-3 font-bold md:text-header-1"
            >
                MEDRUNNER
            </h1>

            <nav
                class="hidden gap-8 ml-auto font-Mohave font-semibold text-header-2 md:flex"
            >
                <RouterLink to="/">HOME</RouterLink>
                <RouterLink to="/">EMERGENCY</RouterLink>
                <RouterLink class="ml-4" to="/">
                    <img src="/user-profile.svg" alt="User profile" />
                </RouterLink>
            </nav>

            <button @click="switchNavMenuSate()" class="ml-auto md:hidden">
                <img
                    v-if="!navMenuCollapsed"
                    src="/burger-button.svg"
                    alt="Open menu"
                />
                <img v-else src="/close-button.svg" alt="Close menu" />
            </button>
        </div>

        <nav
            class="flex flex-col flex-grow justify-end gap-16 p-4 font-Mohav font-semibold text-header-2"
            v-if="navMenuCollapsed"
        >
            <div class="flex flex-col gap-4">
                <RouterLink to="/">HOME</RouterLink>
                <RouterLink to="/">EMERGENCY</RouterLink>
            </div>
            <div class="flex gap-4">
                <p class="text-body font-semibold font-Inter">{{ userStore.username }}</p>
                <button class="button-primary button-24">Disconnect</button>
            </div>
        </nav>
    </div>
</template>
