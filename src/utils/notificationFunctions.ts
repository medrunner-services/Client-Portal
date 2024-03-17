import { useLogicStore } from "@/stores/logicStore";

export function sendBrowserNotification(title: string, body: string) {
    const logicStore = useLogicStore();

    if (logicStore.isNotificationGranted && !document.hasFocus()) {
        const notification = new Notification(title, {
            body,
            icon: "/images/medrunner-logo-square.webp",
        });

        notification.onclick = () => {
            window.focus();
        };
    }
}
