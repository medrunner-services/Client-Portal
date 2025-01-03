import type { Person, TeamMember } from "@medrunner/api-client";
import DOMPurify from "dompurify";
import MarkdownIt from "markdown-it";

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
            case 423:
                defaultMessage = t("error_featureDisabled");
                break;
        }

        return `${defaultMessage} (${errorCode})`;
    }
}

export function parseMarkdown(text: string) {
    const mdIt = MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        breaks: true,
    });

    mdIt.disable("code");

    const defaultRender =
        mdIt.renderer.rules.link_open ||
        mdIt.renderer.rules.em_open ||
        mdIt.renderer.rules.em_close ||
        function (tokens, idx, options, env, self) {
            return self.renderToken(tokens, idx, options);
        };

    mdIt.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        tokens[idx].attrSet("target", "_blank");

        return defaultRender(tokens, idx, options, env, self);
    };

    mdIt.renderer.rules.em_open = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        if (token.markup === "_") {
            token.tag = "u";
        }

        return defaultRender(tokens, idx, options, env, self);
    };

    mdIt.renderer.rules.em_close = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        if (token.markup === "_") {
            token.tag = "u";
        }

        return defaultRender(tokens, idx, options, env, self);
    };

    const manipulatedText = text.replace(/\\n/g, "<br>").replace(/<t:(\d+):([A-Za-z])>/g, (match, timestamp, format) => {
        // TODO: Implement hammer time formating - timestamp is the unix timestamp and format is the letter specifying the desired format
        if (typeof timestamp !== "string" || typeof format !== "string") return timestamp;

        switch (format) {
            case "d":
                return timestamp;
            case "D":
                return timestamp;
            case "t":
                return timestamp;
            case "T":
                return timestamp;
            case "f":
                return timestamp;
            case "F":
                return timestamp;
            case "R":
                return timestamp;
            default:
                return timestamp;
        }
    });

    const sanitizedText = DOMPurify.sanitize(manipulatedText);
    return mdIt.render(sanitizedText);
}
