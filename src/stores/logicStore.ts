import type { PublicOrgSettings } from "@medrunner/api-client";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { LocalStorageItems, WSState } from "@/@types/types.ts";

export const useLogicStore = defineStore("logic", () => {
    const isRouterLoading = ref(false);
    const isNotificationGranted = ref(false);
    const darkMode = ref(false);
    const isDiscordOpenWeb = ref(false);
    const isDebugLoggerEnabled = ref(false);
    const showNotificationPermissionModal = ref(false);
    const medrunnerSettings = ref<PublicOrgSettings>();
    const isMOTDBannerVisible = ref(true);
    const currentWSState = ref(WSState.HEALTHY);
    const wsManualReconnect = ref(false);
    const isFirstInstance = ref(true);
    const isChatHidden = ref(false);
    const sentNotificationTags = ref<Set<string>>(new Set());
    const showNewUpdateBanner = ref(false);
    const errorInitializingApp = ref("");

    const isLoginAnimationAllowed = ref(
        localStorage.getItem(LocalStorageItems.LOGIN_ANIMATION)
            ? localStorage.getItem(LocalStorageItems.LOGIN_ANIMATION) === "true"
            : !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    const loginAnimationSpeed = ref(Number.parseInt(localStorage.getItem(LocalStorageItems.LOGIN_ANIMATION_SPEED) ?? "1"));
    const loginAnimationStarSize = ref(Number.parseInt(localStorage.getItem(LocalStorageItems.LOGIN_ANIMATION_STAR_SIZE) ?? "2"));
    const loginAnimationGlowSize = ref(Number.parseInt(localStorage.getItem(LocalStorageItems.LOGIN_ANIMATION_GLOW_SIZE) ?? "2"));

    const medrunnerLogoUrl = computed(() => {
        if (import.meta.env.MODE === "development" || import.meta.env.MODE === "staging") {
            return "/images/medrunner-logo-dev.svg";
        }
        else {
            return "/images/medrunner-logo-stable.svg";
        }
    });

    const medrunnerStaffPortalUrl = computed(() => {
        if (import.meta.env.MODE === "development" || import.meta.env.MODE === "staging") {
            return "https://staff.medrunner.dev";
        }
        else {
            return "https://staff.medrunner.space";
        }
    });

    const userDevice = computed(() => {
        if (navigator.userAgent.includes("Android")) {
            return "android";
        }
        else if (navigator.userAgent.includes("iPhone")) {
            return "iphone";
        }
        else if (navigator.userAgent.includes("iPad")) {
            return "ipad";
        }
        else if (navigator.userAgent.includes("Windows")) {
            return "windows";
        }
        else if (navigator.userAgent.includes("Macintosh")) {
            return "macintosh";
        }
        else {
            return "unknown";
        }
    });

    const discordBaseUrl = computed(() => {
        if (!isDiscordOpenWeb.value) {
            if (userDevice.value === "android") {
                return "https://";
            }
            else {
                return "discord://";
            }
        }
        else {
            return "https://";
        }
    });

    return {
        isRouterLoading,
        isNotificationGranted,
        darkMode,
        isDiscordOpenWeb,
        isDebugLoggerEnabled,
        errorInitializingApp,
        isLoginAnimationAllowed,
        loginAnimationSpeed,
        loginAnimationStarSize,
        loginAnimationGlowSize,
        medrunnerLogoUrl,
        userDevice,
        discordBaseUrl,
        showNotificationPermissionModal,
        medrunnerSettings,
        isMOTDBannerVisible,
        currentWSState,
        wsManualReconnect,
        medrunnerStaffPortalUrl,
        isFirstInstance,
        isChatHidden,
        sentNotificationTags,
        showNewUpdateBanner,
    };
});
