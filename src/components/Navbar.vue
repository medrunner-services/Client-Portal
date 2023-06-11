<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";

import UserModal from "@/components/UserModal.vue";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const { t, locale, availableLocales } = useI18n({ useScope: "global" });
const navMenuCollapsed = ref(false);
const newLocaleLanguage = ref("");
const currentPage = ref(route.path);
const scrollEnabled = ref(true);
const displayUserModal = ref(false);

onMounted(() => {
    const userLanguage = localStorage.getItem("selectedLanguage");

    if (userLanguage) {
        newLocaleLanguage.value = userLanguage;
        locale.value = userLanguage;
    } else if (availableLocales.includes(navigator.language)) {
        newLocaleLanguage.value = navigator.language;
        locale.value = navigator.language;
    } else {
        newLocaleLanguage.value = "en-US";
        locale.value = "en-US";
    }
});

watch(route, async (oldRoute, newRoute) => {
    currentPage.value = newRoute.path;
});

function switchNavMenuSate(): void {
    navMenuCollapsed.value = !navMenuCollapsed.value;
    scrollEnabled.value ? disableScrolling() : enableScrolling();
}

function switchUserModalSate(): void {
    displayUserModal.value = !displayUserModal.value;
}

function changeLanguage(): void {
    locale.value = newLocaleLanguage.value;
    localStorage.setItem("selectedLanguage", newLocaleLanguage.value);
    navMenuCollapsed.value = false;
}

async function disconnect(): Promise<void> {
    await userStore.disconnectUser();
    await router.push("/login");
}

function disableScrolling(): void {
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden";

    scrollEnabled.value = false;
}

function enableScrolling(): void {
    document.body.style.height = "auto";
    document.body.style.overflow = "auto";

    scrollEnabled.value = true;
}
</script>

<template>
    <div class="bg-white w-full flex flex-col shadow-md md:static">
        <div class="py-2 content-container bg-white flex items-center gap-2 z-10 md:px-16 md:py-3">
            <img class="h-8 md:h-12" src="/images/medrunner-logo.webp" alt="Medrunner Logo" />

            <h1 class="text-primary-900 font-Mohave text-header-3 font-bold md:text-header-1">MEDRUNNER</h1>

            <nav class="hidden gap-8 ml-auto font-Mohave font-semibold text-header-2 md:flex items-center">
                <RouterLink to="/" :class="currentPage === '/' ? 'current-link' : ''">{{ t("navbar_emergency") }}</RouterLink>
                <RouterLink to="/blocklist" :class="currentPage === '/blocklist' ? 'current-link' : ''">{{ t("navbar_blocklist") }} </RouterLink>
                <div>
                    <select @change="changeLanguage" v-model="newLocaleLanguage">
                        <option value="en-US">English</option>
                        <option value="fr-FR">Français</option>
                    </select>
                </div>
                <div v-if="userStore.isAuthenticated">
                    <div @click="switchUserModalSate()" class="cursor-pointer">
                        <img src="/icons/user-profile.svg" alt="User profile" />
                    </div>
                </div>
            </nav>

            <button @click="switchNavMenuSate()" class="ml-auto md:hidden">
                <img v-if="!navMenuCollapsed" src="/icons/burger-button.svg" alt="Open menu" />
                <img v-else src="/icons/close-button.svg" alt="Close menu" />
            </button>
        </div>

        <div @click.self="switchNavMenuSate()" v-if="navMenuCollapsed" class="absolute top-0 left-0 h-screen w-screen bg-gray-400/50 z-[5]">
            <nav class="w-full absolute top-14 flex flex-col bg-white justify-end py-4 content-container font-semibold text-header-2 shadow-lg z-10">
                <div class="flex flex-col gap-4 font-Mohave">
                    <RouterLink @click="switchNavMenuSate()" to="/" :class="currentPage === '/' ? 'current-link' : ''">{{
                        t("navbar_emergency")
                    }}</RouterLink>
                    <RouterLink @click="switchNavMenuSate()" to="/blocklist" :class="currentPage === '/blocklist' ? 'current-link' : ''">{{
                        t("navbar_blocklist")
                    }}</RouterLink>
                </div>
                <div class="mt-16 flex justify-between w-full">
                    <select @change="changeLanguage" v-model="newLocaleLanguage">
                        <option value="en-US">English</option>
                        <option value="fr-FR">Français</option>
                    </select>
                    <div @click="switchUserModalSate()" class="cursor-pointer">
                        <img src="/icons/user-profile.svg" alt="User profile" />
                    </div>
                </div>
            </nav>
        </div>
    </div>

    <UserModal @click.self="switchUserModalSate()" v-if="displayUserModal" @disconnect-user="disconnect()" @close-modal="switchUserModalSate()" />
</template>

<style scoped>
.current-link {
    @apply underline underline-offset-8 decoration-[3px];
}
</style>
