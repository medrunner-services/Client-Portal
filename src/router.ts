import type { RouteLocationNormalized } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";

import { AlertColors, WSState } from "@/@types/types.ts";
import { i18n } from "@/i18n.ts";
import { useAlertStore } from "@/stores/alertStore.ts";
import { useLogicStore } from "@/stores/logicStore.ts";
import { useUserStore } from "@/stores/userStore";

import DashboardView from "./views/DashboardView.vue";

function isUserComplete(to: RouteLocationNormalized, requiresWS: boolean = false): string | boolean {
    const { t } = i18n.global;
    const userStore = useUserStore();
    const logicStore = useLogicStore();
    const alertStore = useAlertStore();

    if (!userStore.isAuthenticated) {
        if (to.fullPath.substring(1))
            return `/login?redirect=${encodeURIComponent(to.fullPath)}`;
        else return "/login";
    }

    if (!userStore.user.rsiHandle && logicStore.medrunnerSettings && !logicStore.medrunnerSettings.anonymousAlertsEnabled) {
        return "/login/link";
    }

    if (requiresWS && logicStore.currentWSState !== WSState.HEALTHY) {
        alertStore.newAlert(AlertColors.RED, t("error_wsDisconnectedPageAccessError"), false, "warning", 5000);
        return false;
    }

    return true;
}

function isUserNotAuthenticated(): string | boolean {
    const userStore = useUserStore();

    if (userStore.isAuthenticated) {
        return "/";
    }

    return true;
}

function isUserAuthenticated(to: RouteLocationNormalized, requiresWS: boolean = false): string | boolean {
    const { t } = i18n.global;
    const userStore = useUserStore();
    const logicStore = useLogicStore();
    const alertStore = useAlertStore();

    if (!userStore.isAuthenticated) {
        if (to.fullPath.substring(1))
            return `/login?redirect=${encodeURIComponent(to.fullPath)}`;
        else return "/login";
    }

    if (requiresWS && logicStore.currentWSState !== WSState.HEALTHY) {
        alertStore.newAlert(AlertColors.RED, t("error_wsDisconnectedPageAccessError"), false, "warning", 5000);
        return false;
    }

    return true;
}

function isUserNotLinked(): string | boolean {
    const userStore = useUserStore();

    if (!userStore.isAuthenticated) {
        return "/login";
    }

    if (userStore.user?.rsiHandle) {
        return "/";
    }

    return true;
}

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        else if (to.hash) {
            return {
                el: to.hash,
                behavior: "smooth",
            };
        }
        else {
            return { top: 0 };
        }
    },
    routes: [
        {
            path: "/",
            name: "dashboard",
            component: DashboardView,
            beforeEnter: to => isUserComplete(to),
        },
        {
            path: "/emergency",
            name: "emergency",
            component: () => import("@/views/EmergencyView.vue"),
            beforeEnter: to => isUserComplete(to, true),
        },
        {
            path: "/profile",
            name: "profile",
            component: () => import("@/views/ProfileView.vue"),
            beforeEnter: to => isUserComplete(to),
        },
        {
            path: "/login",
            name: "login",
            component: () => import("@/views/LoginView.vue"),
            beforeEnter: isUserNotAuthenticated,
        },
        {
            path: "/login/link",
            name: "loginLink",
            component: () => import("@/views/LoginView.vue"),
            beforeEnter: isUserNotLinked,
        },
        {
            path: "/auth",
            alias: "/auth/register",
            name: "auth",
            component: () => import("@/views/AuthView.vue"),
        },
        {
            path: "/redeem",
            name: "redeem",
            component: () => import("@/views/RedeemView.vue"),
            beforeEnter: to => isUserAuthenticated(to),
        },
        {
            path: "/:pathMatch(.*)*",
            name: "404",
            component: () => import("@/views/404View.vue"),
        },
    ],
});

router.beforeEach(() => {
    const logicStore = useLogicStore();

    logicStore.isRouterLoading = true;
});

router.afterEach(() => {
    const logicStore = useLogicStore();

    logicStore.isRouterLoading = false;
});

export default router;
