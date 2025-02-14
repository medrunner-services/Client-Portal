import type { PublicOrgSettings } from "@medrunner/api-client";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { WSState } from "@/types.ts";

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
    const isFirstInstance = ref(true);
    const sentNotificationTags = ref<Set<string>>(new Set());
    const showNewUpdateBanner = ref(false);

    const isLoginAnimationAllowed = ref(
        localStorage.getItem("loginAnimation")
            ? localStorage.getItem("loginAnimation") === "true"
            : !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    const loginAnimationSpeed = ref(parseInt(localStorage.getItem("loginAnimationSpeed") ?? "1"));
    const loginAnimationStarSize = ref(parseInt(localStorage.getItem("loginAnimationStarSize") ?? "2"));
    const loginAnimationGlowSize = ref(parseInt(localStorage.getItem("loginAnimationGlowSize") ?? "2"));

    const medrunnerLogoUrl = computed(() => {
        if (import.meta.env.MODE === "development" || import.meta.env.MODE === "staging") {
            return "/images/medrunner-logo-dev.svg";
        } else {
            return "/images/medrunner-logo-stable.svg";
        }
    });

    const medrunnerStaffPortalUrl = computed(() => {
        if (import.meta.env.MODE === "development" || import.meta.env.MODE === "staging") {
            return "https://staff.medrunner.dev";
        } else {
            return "https://staff.medrunner.space";
        }
    });

    const userDevice = computed(() => {
        if (navigator.userAgent.includes("Android")) {
            return "android";
        } else if (navigator.userAgent.includes("iPhone")) {
            return "iphone";
        } else if (navigator.userAgent.includes("iPad")) {
            return "ipad";
        } else if (navigator.userAgent.includes("Windows")) {
            return "windows";
        } else if (navigator.userAgent.includes("Macintosh")) {
            return "macintosh";
        } else return "unknown";
    });

    const discordBaseUrl = computed(() => {
        if (!isDiscordOpenWeb.value) {
            if (userDevice.value === "android") {
                return "https://";
            } else {
                return "discord://";
            }
        } else return "https://";
    });

    return {
        isRouterLoading,
        isNotificationGranted,
        darkMode,
        isDiscordOpenWeb,
        isDebugLoggerEnabled,
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
        medrunnerStaffPortalUrl,
        isFirstInstance,
        sentNotificationTags,
        showNewUpdateBanner,
    };
});
