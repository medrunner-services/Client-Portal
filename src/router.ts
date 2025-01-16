import { createRouter, createWebHistory, type RouteLocationNormalized } from "vue-router";

import { useLogicStore } from "@/stores/logicStore.ts";
import { useUserStore } from "@/stores/userStore";
import { usePostHog } from "@/usePostHog";

const { posthog } = usePostHog();

import DashboardView from "./views/DashboardView.vue";

async function isUserComplete(to: RouteLocationNormalized): Promise<string | boolean> {
    const userStore = useUserStore();
    const logicStore = useLogicStore();

    if (!userStore.isAuthenticated) {
        if (to.fullPath.substring(1)) return `/login?redirect=${encodeURIComponent(to.fullPath)}`;
        else return "/login";
    }

    if (!userStore.user.rsiHandle && logicStore.medrunnerSettings && !logicStore.medrunnerSettings.anonymousAlertsEnabled) {
        return "/login/link";
    }

    return true;
}

async function isUserNotAuthenticated(): Promise<string | boolean> {
    const userStore = useUserStore();

    if (userStore.isAuthenticated) {
        return "/";
    }

    return true;
}

async function isUserAuthenticated(to: RouteLocationNormalized): Promise<string | boolean> {
    const userStore = useUserStore();

    if (!userStore.isAuthenticated) {
        if (to.fullPath.substring(1)) return `/login?redirect=${encodeURIComponent(to.fullPath)}`;
        else return "/login";
    }

    return true;
}

async function isUserNotLinked(): Promise<string | boolean> {
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
        } else if (to.hash) {
            return {
                el: to.hash,
                behavior: "smooth",
            };
        } else {
            return { top: 0 };
        }
    },
    routes: [
        {
            path: "/",
            name: "dashboard",
            component: DashboardView,
            beforeEnter: isUserComplete,
        },
        {
            path: "/emergency",
            name: "emergency",
            component: () => import("@/views/EmergencyView.vue"),
            beforeEnter: isUserComplete,
        },
        {
            path: "/profile",
            name: "profile",
            component: () => import("@/views/ProfileView.vue"),
            beforeEnter: isUserComplete,
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
            beforeEnter: isUserAuthenticated,
        },
        {
            path: "/:pathMatch(.*)*",
            name: "404",
            component: () => import("@/views/404View.vue"),
        },
    ],
});

router.beforeEach((to, from) => {
    const logicStore = useLogicStore();

    logicStore.isRouterLoading = true;

    if (from.path !== to.path) {
        posthog.capture("$pageleave");
    }
});

router.afterEach(() => {
    const logicStore = useLogicStore();

    logicStore.isRouterLoading = false;

    posthog.capture("$pageview");
});

export default router;
