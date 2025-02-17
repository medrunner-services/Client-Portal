import { i18n } from "@/i18n.ts";

export function timestampToHours(timestamp: number | string): string {
    const { locale } = i18n.global;
    const now = new Date();
    const date = new Date(timestamp);

    if (now.getFullYear() === date.getFullYear()) {
        if (now.getMonth() === date.getMonth() && now.getDate() === date.getDate()) {
            return date.toLocaleTimeString(locale.value, {
                hour: "2-digit",
                minute: "2-digit",
            });
        } else {
            return date
                .toLocaleDateString(locale.value, {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
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
            })
            .replace(",", "");
    }
}

export function timestampToDate(timestamp: number | string): string {
    const { locale } = i18n.global;
    return new Date(timestamp).toLocaleDateString(locale.value, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

export function timestampToFullDate(timestamp: number | string): string {
    const { locale } = i18n.global;
    return new Date(timestamp).toLocaleDateString(locale.value, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        hour12: false,
        minute: "2-digit",
    });
}
