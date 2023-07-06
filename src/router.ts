import { createRouter, createWebHistory } from "vue-router";

import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";

import HomeView from "./views/HomeView.vue";

function isUserAuthenticated(): string | boolean {
    const userStore = useUserStore();
    return userStore.isAuthenticated ? "/" : true;
}

function isUserNotLinked(): string | boolean {
    const userStore = useUserStore();
    return userStore.isAuthenticated && !userStore.user?.rsiHandle ? true : "/";
}

async function isUserComplete(): Promise<string | boolean> {
    const userStore = useUserStore();
    const logicStore = useLogicStore();
    logicStore.isRouterLoading = true;

    if (!localStorage.getItem("refreshToken")) {
        logicStore.isRouterLoading = false;
        return "/login";
    } else if (!userStore.isAuthenticated) {
        try {
            userStore.user = await userStore.fetchUser();
            userStore.isAuthenticated = true;
        } catch (error) {
            logicStore.isRouterLoading = false;
            return "/login";
        }
    } else if (!userStore.user.active) {
        logicStore.isRouterLoading = false;
        return "/login";
    } else if (!userStore.user.rsiHandle) {
        logicStore.isRouterLoading = false;
        return "/login/link";
    }

    logicStore.isRouterLoading = false;
    return true;
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: HomeView,
            beforeEnter: isUserComplete,
        },
        {
            path: "/login",
            name: "login",
            component: () => import("@/views/LoginView.vue"),
            beforeEnter: isUserAuthenticated,
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
            path: "/blocklist",
            name: "blocklist",
            component: () => import("@/views/BlocklistView.vue"),
            beforeEnter: isUserComplete,
        },
        {
            path: "/developer",
            name: "developer",
            component: () => import("@/views/DeveloperView.vue"),
            beforeEnter: isUserComplete,
        },
    ],
});

export default router;
