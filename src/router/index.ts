import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "@/stores/userStore";

import HomeView from "../views/HomeView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: HomeView,
        },
        {
            path: "/login",
            alias: "/login/link",
            name: "login",
            component: () => import("@/views/LoginView.vue"),
        },
        {
            path: "/auth",
            alias: "/auth/register",
            name: "auth",
            component: () => import("@/views/AuthView.vue"),
        },
    ],
});

router.beforeEach(async to => {
    const userStore = useUserStore();
    if (to.name !== "auth") {
        await userStore.getUser();
    }
});

export default router;
