import { createRouter, createWebHistory } from "vue-router";

import { ampli } from "@/ampli";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";

import DashboardView from "./views/DashboardView.vue";

async function isUserAuthenticated(): Promise<string | boolean> {
    const userStore = useUserStore();

    if (!localStorage.getItem("refreshToken")) {
        return "/login";
    } else if (!userStore.isAuthenticated) {
        try {
            userStore.user = await userStore.fetchUser();
            userStore.isAuthenticated = true;
        } catch (error) {
            return "/login?error=generic";
        }
    }

    if (!userStore.user.active) {
        await userStore.disconnectUser();
        return "/login?error=deactivated";
    } else if (!userStore.user.rsiHandle) {
        return "/login/link";
    }

    return true;
}

async function isUserNotAuthenticated(): Promise<string | boolean> {
    const userStore = useUserStore();
    if (userStore.isAuthenticated && localStorage.getItem("refreshToken")) {
        return "/";
    } else if (localStorage.getItem("refreshToken")) {
        try {
            userStore.user = await userStore.fetchUser();
            userStore.isAuthenticated = true;
            return "/";
        } catch (error: any) {
            return true;
        }
    }

    return true;
}

async function isUserNotLinked(): Promise<string | boolean> {
    const userStore = useUserStore();

    if (!userStore.isAuthenticated && localStorage.getItem("refreshToken")) {
        try {
            userStore.user = await userStore.fetchUser();
            userStore.isAuthenticated = true;
        } catch (error: any) {
            return "/login";
        }
    }

    return userStore.isAuthenticated && !userStore.user?.rsiHandle ? true : "/";
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "dashboard",
            component: DashboardView,
            beforeEnter: isUserAuthenticated,
        },
        {
            path: "/emergency",
            name: "emergency",
            component: () => import("@/views/EmergencyView.vue"),
            beforeEnter: isUserAuthenticated,
        },
        {
            path: "/blocklist",
            name: "blocklist",
            component: () => import("@/views/BlocklistView.vue"),
            beforeEnter: isUserAuthenticated,
        },
        {
            path: "/profile",
            name: "profile",
            component: () => import("@/views/ProfileView.vue"),
            beforeEnter: isUserAuthenticated,
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
            path: "/:pathMatch(.*)*",
            name: "404",
            component: () => import("@/views/404View.vue"),
        },
    ],
});

router.afterEach(async () => {
    const userStore = useUserStore();
    const logicStore = useLogicStore();

    if (userStore.isAuthenticated && !ampli.isLoaded && logicStore.isAnalyticsAllowed) {
        ampli.load({
            client: {
                apiKey: import.meta.env.VITE_AMPLITUDE_KEY,
                configuration: {
                    appVersion: __APP_VERSION__,
                    identityStorage: "none",
                    trackingOptions: { ipAddress: false, language: false },
                    defaultTracking: {
                        fileDownloads: false,
                        formInteractions: false,
                        attribution: false,
                        pageViews: { trackHistoryChanges: "pathOnly" },
                    },
                },
            },
        });
        ampli.identify(userStore.user.id, {
            Username: userStore.user.rsiHandle,
            "App Language": localStorage.getItem("selectedLanguage") ?? "en-US",
        });
    }
});

export default router;
