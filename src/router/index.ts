import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "@/stores/userStore";

import HomeView from "../views/HomeView.vue";

function isUserAuthenticated(): string | boolean {
    const userStore = useUserStore();
    return userStore.isAuthenticated ? "/" : true;
}

function isUserNotLinked(): string | boolean {
    const userStore = useUserStore();
    return userStore.isAuthenticated && !userStore.user.rsiHandle ? true : "/";
}

async function isUserComplete(): Promise<string | boolean> {
    const userStore = useUserStore();

    try {
        const user = await userStore.fetchUser(await userStore.getToken());

        userStore.user = user;
        userStore.isAuthenticated = true;

        if (!user.active) return "/login";
        return user.rsiHandle ? true : "/login/link";
    } catch (error) {
        return "/login";
    }
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
    ],
});

export default router;
