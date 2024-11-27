import { type Person } from "@medrunner/api-client";

import { useUserStore } from "@/stores/userStore";

export function personUpdate(newUser: Person) {
    const userStore = useUserStore();

    userStore.user = newUser;
}
