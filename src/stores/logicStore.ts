import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useLogicStore = defineStore("logic", () => {
    const isRouterLoading = ref(false);

    const userDevice = computed(() => {
        if (navigator.userAgent.includes("Android")) {
            return "android";
        } else if (navigator.userAgent.includes("iPhone")) {
            return "iphone";
        } else if (navigator.userAgent.includes("iPad")) {
            return "ipad";
        } else if (navigator.userAgent.includes("Windows")) {
            return "windows";
        }
    });

    const userBrowser = computed(() => {
        if (navigator.userAgent.includes("Firefox")) {
            return "firefox";
        } else if (navigator.userAgent.includes("Chrome")) {
            return "chrome";
        } else if (navigator.userAgent.includes("Safari")) {
            return "safari";
        }
    });

    const discordBaseUrl = computed(() => {
        if (navigator.userAgent.includes("Android")) {
            return "https://";
        } else {
            return "discord://";
        }
    });

    const medrunnerLogoUrl = computed(() => {
        if (import.meta.env.MODE === "development" || import.meta.env.MODE === "staging") {
            return "/images/medrunner-logo-dev.webp";
        } else {
            return "/images/medrunner-logo-beta.webp";
        }
    });

    return {
        isRouterLoading,
        userDevice,
        userBrowser,
        discordBaseUrl,
        medrunnerLogoUrl,
    };
});
