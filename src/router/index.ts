import { createRouter, createWebHistory } from "vue-router";

import { type User, useUserStore } from "@/stores/userStore";

import HomeView from "../views/HomeView.vue";

function isUserAuthenticated(): string | boolean {
    const userStore = useUserStore();
    return userStore.isAuthenticated ? "/" : true;
}

function isUserNotLinked(): string | boolean {
    const userStore = useUserStore();
    return userStore.isAuthenticated && !userStore.user.rsiHandle ? true : "/";
}

function getSuccessRedirection(user: User): string | boolean {
    const userStore = useUserStore();
    userStore.user = user;
    userStore.isAuthenticated = true;

    if (!user.active) {
        return "/login";
    }

    if (user.rsiHandle) {
        return true;
    } else {
        return "/login/link";
    }
}

async function getRedirection(): Promise<any> {
    const userStore = useUserStore();

    let redirection: string | boolean = true;

    await userStore.fetchUser(
        await userStore.getToken(),
        user => (redirection = getSuccessRedirection(user)),
        () => (redirection = "/login"),
    );

    return redirection;
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: HomeView,
            beforeEnter: getRedirection,
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
