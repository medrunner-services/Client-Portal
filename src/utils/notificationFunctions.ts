import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore.ts";

import notificationSound from "../assets/notification.mp3";

export async function sendBrowserNotification(title: string, tag: string, body: string, onClick?: () => void) {
    const logicStore = useLogicStore();
    const userStore = useUserStore();

    if (logicStore.isNotificationGranted && !document.hasFocus() && logicStore.isFirstInstance) {
        const notification = new Notification(title, {
            body,
            tag,
            icon: "/images/medrunner-logo-square.webp",
            silent: userStore.syncedSettings.customSoundNotification,
        });

        if (userStore.syncedSettings.customSoundNotification) {
            const audio = new Audio(notificationSound);
            audio.volume = 0.2;
            await audio.play();
        }

        if (onClick) notification.onclick = onClick;
    }
}
