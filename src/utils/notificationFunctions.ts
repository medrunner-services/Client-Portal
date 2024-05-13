import { useLogicStore } from "@/stores/logicStore";

import notificationSound from "../assets/notification.mp3";

export async function sendBrowserNotification(title: string, body: string, onClick?: () => void) {
    const logicStore = useLogicStore();

    if (logicStore.isNotificationGranted && !document.hasFocus()) {
        const notification = new Notification(title, {
            body,
            icon: "/images/medrunner-logo-square.webp",
            silent: logicStore.customSoundNotification,
        });

        if (logicStore.customSoundNotification) {
            const audio = new Audio(notificationSound);
            audio.volume = 0.2;
            await audio.play();
        }

        if (onClick) notification.onclick = onClick;
    }
}
