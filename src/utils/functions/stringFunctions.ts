import type { Person, TeamMember } from "@medrunner/api-client";
import DOMPurify from "dompurify";
import MarkdownIt from "markdown-it";

import { i18n } from "@/i18n.ts";
import { useUserStore } from "@/stores/userStore.ts";
import { timestampToFullDateTimeZone } from "@/utils/functions/dateTimeFunctions.ts";

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
	}
	else {
		return message.replace(new RegExp(`<@${user.discordId}>`, "g"), `@${user.rsiHandle}`).replace(/<@(\d+)>/g, (match, memberId) => {
			return memberIdToNameMap[memberId] ? `@${memberIdToNameMap[memberId]}` : match;
		});
	}
}

export function errorString(errorCode: number, customMessage?: string): string {
	const { t } = i18n.global;

	if (customMessage) {
		return `${customMessage} (${errorCode ?? "internal"})`;
	}
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

		return `${defaultMessage} (${errorCode ?? "internal"})`;
	}
}

export function parseMarkdown(text: string) {
	const { locale } = i18n.global;
	const userStore = useUserStore();

	const mdIt = MarkdownIt({
		html: true,
		linkify: true,
		typographer: true,
		breaks: true,
	});

	mdIt.disable("code");

	const defaultRender
		= mdIt.renderer.rules.link_open
			|| mdIt.renderer.rules.em_open
			|| mdIt.renderer.rules.em_close
			|| function (tokens, idx, options, env, self) {
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
		if (typeof timestamp !== "string" || typeof format !== "string")
			return timestamp;
		const date = new Date(Number.parseInt(timestamp) * 1000);
		let dateString;

		switch (format) {
			case "d":
				dateString = date.toLocaleDateString(locale.value, {
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
				});
				break;
			case "D":
				dateString = date.toLocaleDateString(locale.value, {
					day: "numeric",
					month: "long",
					year: "numeric",
				});
				break;
			case "t":
				dateString = date.toLocaleTimeString(locale.value, {
					hour: "numeric",
					minute: "2-digit",
					hour12: userStore.syncedSettings.hour12FormatingPreference,
				});
				break;
			case "T":
				dateString = date.toLocaleTimeString(locale.value, {
					hour: "numeric",
					minute: "2-digit",
					second: "2-digit",
					hour12: userStore.syncedSettings.hour12FormatingPreference,
				});
				break;
			case "f":
				dateString = date.toLocaleString(locale.value, {
					day: "numeric",
					month: "long",
					year: "numeric",
					hour: "numeric",
					minute: "2-digit",
					hour12: userStore.syncedSettings.hour12FormatingPreference,
				});
				break;
			case "F":
				dateString = date.toLocaleString(locale.value, {
					weekday: "long",
					day: "numeric",
					month: "long",
					year: "numeric",
					hour: "numeric",
					minute: "2-digit",
					hour12: userStore.syncedSettings.hour12FormatingPreference,
				});
				break;
				// This is not the correct format, as it would require reactivity to update the time every second/minute/hour
				// This is so the discord bot shows the reactive time and the portal the static time format we want
			case "R":
				dateString = date.toLocaleTimeString(locale.value, {
					hour: "numeric",
					minute: "2-digit",
					hour12: userStore.syncedSettings.hour12FormatingPreference,
				});
				break;
			default:
				dateString = date.toLocaleDateString(locale.value, {
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
				});
				break;
		}

		return `<span class="cursor-help underline decoration-dotted" title="${timestampToFullDateTimeZone(Number.parseInt(timestamp) * 1000)}">${dateString}</span>`;
	});

	const sanitizedText = DOMPurify.sanitize(manipulatedText);
	return mdIt.render(sanitizedText);
}
