<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";

import BugReportModal from "@/components/BugReportModal.vue";
import UserModal from "@/components/UserModal.vue";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const logicStore = useLogicStore();
const route = useRoute();
const router = useRouter();
const { t, locale, availableLocales } = useI18n({ useScope: "global" });
const navMenuCollapsed = ref(false);
const newLocaleLanguage = ref("");
const currentPage = ref(route.path);
const scrollEnabled = ref(true);
const displayUserModal = ref(false);
const displayBugReportModal = ref(false);

onMounted(() => {
    const userLanguage = localStorage.getItem("selectedLanguage");
    const availableMainLocales = availableLocales.map(locale => locale.split("-")[0]);

    if (userLanguage) {
        newLocaleLanguage.value = userLanguage;
        locale.value = userLanguage;
    } else if (availableLocales.includes(navigator.language)) {
        newLocaleLanguage.value = navigator.language;
        locale.value = navigator.language;
    } else if (availableMainLocales.includes(navigator.language.split("-")[0])) {
        const fallbackLocal = availableLocales.find(item => item.indexOf(navigator.language.split("-")[0]) === 0);
        if (fallbackLocal) {
            newLocaleLanguage.value = fallbackLocal;
            locale.value = fallbackLocal;
        } else {
            newLocaleLanguage.value = "en-US";
            locale.value = "en-US";
        }
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

function switchBugReportModalSate(): void {
    displayBugReportModal.value = !displayBugReportModal.value;
}

function changeLanguage(): void {
    locale.value = newLocaleLanguage.value;
    localStorage.setItem("selectedLanguage", newLocaleLanguage.value);
    navMenuCollapsed.value = false;
    enableScrolling();
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
    <div class="flex w-full flex-col bg-white shadow-md md:static">
        <div class="content-container z-10 flex items-center gap-2 bg-white py-2 md:py-3">
            <img class="h-8 md:h-12" :src="logicStore.medrunnerLogoUrl" alt="Medrunner Logo" />

            <nav class="ml-auto hidden items-center gap-8 font-Mohave text-header-2 font-semibold md:flex">
                <RouterLink to="/" :class="currentPage === '/' ? 'current-link' : ''">{{ t("navbar_emergency") }}</RouterLink>
                <RouterLink to="/blocklist" :class="currentPage === '/blocklist' ? 'current-link' : ''">{{ t("navbar_blocklist") }} </RouterLink>
                <div
                    @click="switchBugReportModalSate()"
                    class="ml-8 flex w-fit cursor-pointer items-center font-Mohave font-semibold text-primary-900"
                >
                    {{ t("navbar_reportBug") }}
                </div>
                <div>
                    <select @change="changeLanguage" v-model="newLocaleLanguage">
                        <option value="da-DK">Dansk</option>
                        <option value="de-DE">Deutsch</option>
                        <option value="en-US">English</option>
                        <option value="fr-FR">Français</option>
                        <option value="it-IT">Italiano</option>
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

        <div @click.self="switchNavMenuSate()" v-if="navMenuCollapsed" class="absolute left-0 top-0 z-[5] h-screen w-screen bg-gray-400/50">
            <nav class="content-container absolute top-14 z-10 flex w-full flex-col justify-end bg-white py-4 text-header-2 font-semibold shadow-lg">
                <div class="flex flex-col gap-4 font-Mohave">
                    <RouterLink @click="switchNavMenuSate()" to="/" :class="currentPage === '/' ? 'current-link' : ''">{{
                        t("navbar_emergency")
                    }}</RouterLink>
                    <RouterLink @click="switchNavMenuSate()" to="/blocklist" :class="currentPage === '/blocklist' ? 'current-link' : ''">{{
                        t("navbar_blocklist")
                    }}</RouterLink>
                </div>
                <div
                    @click="switchBugReportModalSate()"
                    class="mt-16 flex w-fit cursor-pointer items-center font-Mohave font-semibold text-primary-900"
                >
                    {{ t("navbar_reportBug") }}
                </div>
                <div class="mt-5 flex w-full justify-between">
                    <select @change="changeLanguage" v-model="newLocaleLanguage">
                        <option value="da-DK">Dansk</option>
                        <option value="de-DE">Deutsch</option>
                        <option value="en-US">English</option>
                        <option value="fr-FR">Français</option>
                        <option value="it-IT">Italiano</option>
                    </select>
                    <div @click="switchUserModalSate()" class="cursor-pointer">
                        <img src="/icons/user-profile.svg" alt="User profile" />
                    </div>
                </div>
            </nav>
        </div>
    </div>

    <UserModal @click.self="switchUserModalSate()" v-if="displayUserModal" @disconnect-user="disconnect()" @close-modal="switchUserModalSate()" />
    <BugReportModal @click.self="switchBugReportModalSate()" v-if="displayBugReportModal" @close-modal="switchBugReportModalSate()" />
</template>

<style scoped>
.current-link {
    @apply underline decoration-[3px] underline-offset-8;
}
</style>
