import { DateFormatingSetting } from "@/@types/types.ts";
import { i18n } from "@/i18n.ts";
import { useUserStore } from "@/stores/userStore.ts";

export function toUserDateString(date: Date, dateFormatOptions: Intl.DateTimeFormatOptions, forceLocalFormat = false, showTime = false) {
    const { locale } = i18n.global;
    const userStore = useUserStore();

    if (!dateFormatOptions.hour12)
        dateFormatOptions.hour12 = userStore.syncedSettings.hour12FormatingPreference;

    if (userStore.syncedSettings.shortDateFormatPreference && dateFormatOptions.year)
        dateFormatOptions.year = "2-digit";
    if (userStore.syncedSettings.shortDateFormatPreference && dateFormatOptions.month)
        dateFormatOptions.month = "numeric";
    if (userStore.syncedSettings.shortDateFormatPreference && dateFormatOptions.day)
        dateFormatOptions.day = "numeric";

    if (userStore.syncedSettings.dateFormatingPreference !== DateFormatingSetting.AUTO && !forceLocalFormat) {
        const formatter = new Intl.DateTimeFormat(locale.value, dateFormatOptions);
        const parts = formatter.formatToParts(date);

        const month = parts.find(part => part.type === "month")?.value || "";
        const day = parts.find(part => part.type === "day")?.value || "";
        const year = parts.find(part => part.type === "year")?.value || "";
        const separator = parts.find(part => part.type === "literal")?.value || "/";

        let dateString = "";
        switch (userStore.syncedSettings.dateFormatingPreference) {
            case DateFormatingSetting.DMY:
                if (year)
                    dateString = `${day}${separator}${month}${separator}${year}`;
                else dateString = `${day}${separator}${month}`;
                break;
            case DateFormatingSetting.YMD:
                if (year)
                    dateString = `${year}${separator}${month}${separator}${day}`;
                else dateString = `${month}${separator}${day}`;
                break;
            case DateFormatingSetting.MDY:
                if (year)
                    dateString = `${month}${separator}${day}${separator}${year}`;
                else dateString = `${month}${separator}${day}`;
                break;
        }
        if (showTime) {
            const firstTimePart = parts.findIndex(part =>
                part.type === "hour" || part.type === "minute" || part.type === "second",
            );

            const timeString = firstTimePart !== -1
                ? parts.slice(firstTimePart).map(part => part.value).join("")
                : "";

            return `${dateString} ${timeString}`;
        }
        else {
            return dateString;
        }
    }

    else {
        if (showTime) {
            return date
                .toLocaleTimeString(locale.value, dateFormatOptions);
        }
        else {
            return date
                .toLocaleDateString(locale.value, dateFormatOptions);
        }
    }
}

export function getTimeDifferenceString(startDate: string, endDate: string): string {
    const timeToAccept = Math.floor(new Date(endDate).getTime() / 1000) - Math.floor(new Date(startDate).getTime() / 1000);

    const days = Math.floor(timeToAccept / (60 * 60 * 24));
    const hours = Math.floor((timeToAccept % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((timeToAccept % (60 * 60)) / 60);
    const seconds = timeToAccept % 60;

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    }
    else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    else if (minutes > 0) {
        return `${minutes}m`;
    }
    else {
        return `${seconds}s`;
    }
}

export function timestampToHours(timestamp: number | string): string {
    const now = new Date();
    const date = new Date(timestamp);

    if (now.getFullYear() === date.getFullYear()) {
        if (now.getMonth() === date.getMonth() && now.getDate() === date.getDate()) {
            return toUserDateString(date, {
                hour: "2-digit",
                minute: "2-digit",
            }, false, true);
        }
        else {
            return toUserDateString(date, {
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            }, false, true);
        }
    }
    else {
        return toUserDateString(date, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
}

export function timestampToDate(timestamp: number | string): string {
    return toUserDateString(new Date(timestamp), {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

export function timestampToFullDate(timestamp: number | string): string {
    return toUserDateString(new Date(timestamp), {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function timestampToFullDateTimeZone(timestamp: number | string): string {
    return toUserDateString(new Date(timestamp), {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
    }, true);
}
