<script setup lang="ts">
import { ref } from "vue";

import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
let navMenuCollapsed = ref(false);
let userMenuCollapsed = ref(false);

function switchNavMenuSate(): void {
    navMenuCollapsed.value = !navMenuCollapsed.value;
}
function switchUserMenuState(): void {
    userMenuCollapsed.value = !userMenuCollapsed.value;
}
</script>

<template>
    <div class="bg-white w-full flex flex-col shadow-md md:static">
        <div class="py-2 content-container flex items-center gap-2 md:px-16 md:py-3">
            <img class="h-8 md:h-12" src="/images/medrunner-logo.webp" alt="Medrunner Logo" />

            <h1 class="text-primary-900 font-Mohave text-header-3 font-bold md:text-header-1">
                MEDRUNNER
            </h1>

            <nav class="hidden gap-8 ml-auto font-Mohave font-semibold text-header-2 md:flex">
                <RouterLink to="/">HOME</RouterLink>
                <RouterLink to="/">EMERGENCY</RouterLink>
                <RouterLink class="ml-4" to="/">
                    <img
                        @click="switchUserMenuState()"
                        src="/icons/user-profile.svg"
                        alt="User profile"
                    />
                    <div v-if="userMenuCollapsed" class="top-16 right-4 absolute">
                        <svg
                            width="53"
                            height="21"
                            class="ml-[173px]"
                            viewBox="0 0 53 21"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <filter id="menuSvgFilter">
                                <feDropShadow dx="2" dy="2" stdDeviation="1" flood-opacity="0.3" />
                            </filter>
                            <g filter="url(#menuSvgFilter)">
                                <path d="M26.5 0L37 21H16L26.5 0Z" fill="white" />
                            </g>
                        </svg>
                        <div class="shadow shadow-lg flex py-4 px-4">
                            <p class="text-body font-semibold font-Inter">
                                {{ userStore.user?.rsiHandle }}
                            </p>
                            <button
                                @click.prevent="userStore.disconnectUser()"
                                class="button-primary button-24 ml-3"
                            >
                                Disconnect
                            </button>
                        </div>
                    </div>
                </RouterLink>
            </nav>

            <button @click="switchNavMenuSate()" class="ml-auto md:hidden">
                <img v-if="!navMenuCollapsed" src="/icons/burger-button.svg" alt="Open menu" />
                <img v-else src="/icons/close-button.svg" alt="Close menu" />
            </button>
        </div>

        <nav
            class="fixed w-full flex flex-col bg-white justify-end gap-16 py-4 content-container mt-14 font-semibold text-header-2 shadow shadow-lg z-10"
            v-if="navMenuCollapsed"
        >
            <div class="flex flex-col gap-4 font-Mohave">
                <RouterLink to="/">HOME</RouterLink>
                <RouterLink to="/">EMERGENCY</RouterLink>
            </div>
            <div class="flex gap-4">
                <p class="text-body font-semibold font-Inter">
                    {{ userStore.user?.rsiHandle }}
                </p>
                <button @click="userStore.disconnectUser()" class="button-primary button-24">
                    Disconnect
                </button>
            </div>
        </nav>
    </div>
</template>
