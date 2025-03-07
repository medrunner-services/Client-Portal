import { i18n } from "@/i18n.ts";
import { useUserStore } from "@/stores/userStore.ts";

export function getTimeDifferenceString(startTimestamp: number, endTimestamp: number): string {
    const timeToAccept = Math.floor(endTimestamp / 1000) - Math.floor(startTimestamp / 1000);

    const days = Math.floor(timeToAccept / (60 * 60 * 24));
    const hours = Math.floor((timeToAccept % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((timeToAccept % (60 * 60)) / 60);
    const seconds = timeToAccept % 60;

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return `${seconds}s`;
    }
}

export function timestampToHours(timestamp: number | string): string {
    const { locale } = i18n.global;
    const userStore = useUserStore();

    const now = new Date();
    const date = new Date(timestamp);

    if (now.getFullYear() === date.getFullYear()) {
        if (now.getMonth() === date.getMonth() && now.getDate() === date.getDate()) {
            return date.toLocaleTimeString(locale.value, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: userStore.syncedSettings.hour12FormatingPreference,
            });
        } else {
            return date
                .toLocaleDateString(locale.value, {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: userStore.syncedSettings.hour12FormatingPreference,
                })
                .replace(",", "");
        }
    } else {
        return date
            .toLocaleDateString(locale.value, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: userStore.syncedSettings.hour12FormatingPreference,
            })
            .replace(",", "");
    }
}

export function timestampToDate(timestamp: number | string): string {
    const { locale } = i18n.global;
    const userStore = useUserStore();

    return new Date(timestamp).toLocaleDateString(locale.value, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour12: userStore.syncedSettings.hour12FormatingPreference,
    });
}

export function timestampToFullDate(timestamp: number | string): string {
    const { locale } = i18n.global;
    const userStore = useUserStore();

    return new Date(timestamp).toLocaleDateString(locale.value, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: userStore.syncedSettings.hour12FormatingPreference,
    });
}

export function timestampToFullDateTimeZone(timestamp: number | string): string {
    const { locale } = i18n.global;
    const userStore = useUserStore();

    return new Date(timestamp).toLocaleDateString(locale.value, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
        hour12: userStore.syncedSettings.hour12FormatingPreference,
    });
}
