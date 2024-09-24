import type { Person, TeamMember } from "@medrunner/api-client";

import { i18n } from "@/i18n";

export function replaceAtMentions(message: string, senderId: string, html: boolean, members: TeamMember[], user: Person): string {
    const memberIdToNameMap: any = {};
    members.forEach((member) => {
        memberIdToNameMap[member.discordId] = member.rsiHandle;
    });

    if (html) {
        return message
            .replace(
                new RegExp(`@${user.rsiHandle}`, "g"),
                `<span class=" p-1 font-medium ${senderId === user.id ? "bg-white/30" : "bg-gray-500/20 dark:bg-gray-400/20"} rounded-lg">@${
                    user.rsiHandle
                }</span>`,
            )
            .replace(
                new RegExp(`@${user.discordId}`, "g"),
                `<span class=" p-1 font-medium ${senderId === user.id ? "bg-white/30" : "bg-gray-500/20 dark:bg-gray-400/20"} rounded-lg">@${
                    user.rsiHandle
                }</span>`,
            )
            .replace(/@\d+/g, (match) => {
                const memberId = match.substring(1);
                return memberIdToNameMap[memberId] ? `@${memberIdToNameMap[memberId]}` : match;
            });
    } else {
        return message.replace(new RegExp(`<@${user.discordId}>`, "g"), `@${user.rsiHandle}`).replace(/<@(\d+)>/g, (match, memberId) => {
            return memberIdToNameMap[memberId] ? `@${memberIdToNameMap[memberId]}` : match;
        });
    }
}

export function errorString(errorCode: number, customMessage?: string): string {
    const { t } = i18n.global;

    if (customMessage) return `${customMessage} (${errorCode})`;
    else {
        let defaultMessage = t("error_generic");

        switch (errorCode) {
            case 429:
                defaultMessage = t("error_rateLimit");
                break;
            case 403:
                defaultMessage = t("error_blockedUser");
                break;
        }

        return `${defaultMessage} (${errorCode})`;
    }
}
