import { apm } from "@elastic/apm-rum";

import { LocalStorageItems } from "@/@types/types.ts";
import { i18n } from "@/i18n";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";
import { handleDarkModeUpdate } from "@/utils/functions/settingsFunctions.ts";
import { api } from "@/utils/medrunnerClient";

export function initializeSettingDarkMode() {
	if (
		(window.matchMedia("(prefers-color-scheme: dark)").matches && localStorage.getItem(LocalStorageItems.DARK_MODE) == null)
		|| localStorage.getItem(LocalStorageItems.DARK_MODE) === "true"
	) {
		handleDarkModeUpdate(true);
	}
}

export function initializeSettingDiscordLinks() {
	const logicStore = useLogicStore();

	if (localStorage.getItem(LocalStorageItems.IS_DISCORD_OPEN_WEB) === "true") {
		logicStore.isDiscordOpenWeb = true;
	}
}

export function initializeSettingDebugLogger() {
	const logicStore = useLogicStore();

	if (localStorage.getItem(LocalStorageItems.IS_DEBUG_LOGGER_ENABLED) === "true") {
		logicStore.isDebugLoggerEnabled = true;
	}
}

export function initializeSettingNotifications() {
	const logicStore = useLogicStore();
	const userStore = useUserStore();

	if (userStore.isAuthenticated) {
		if ("Notification" in window && Notification.permission === "granted" && userStore.syncedSettings.globalNotifications !== false) {
			logicStore.isNotificationGranted = true;
		}
		else if (
			userStore.isAuthenticated
			&& "Notification" in window
			&& Notification.permission === "default"
			&& userStore.syncedSettings.globalNotifications
		) {
			logicStore.showNotificationPermissionModal = true;
		}
	}
}

export function initializeSettingLanguage(availableLocales: string[]): string {
	const userStore = useUserStore();
	let userLanguage: string | undefined;

	if (userStore.isAuthenticated) {
		userLanguage = userStore.syncedSettings.selectedLanguage ? userStore.syncedSettings.selectedLanguage : undefined;
	}

	const availableMainLocales = availableLocales.map(locale => locale.split("-")[0]);

	if (userLanguage) {
		return userLanguage;
	}
	else if (availableLocales.includes(navigator.language)) {
		return navigator.language;
	}
	else if (availableMainLocales.includes(navigator.language.split("-")[0])) {
		const fallbackLocal = availableLocales.find(item => item.indexOf(navigator.language.split("-")[0]) === 0);
		if (fallbackLocal) {
			return fallbackLocal;
		}
		else {
			return "en-US";
		}
	}
	else {
		return "en-US";
	}
}

export function initializeAnalytics() {
	const userStore = useUserStore();
	const { locale } = i18n.global;

	if (userStore.isAuthenticated && userStore.syncedSettings.globalAnalytics) {
		apm.setUserContext({ id: userStore.user.id });
		apm.setCustomContext({
			discordId: userStore.user.discordId,
			rsiHandle: userStore.user.rsiHandle ?? "",
			selectedLanguage: locale.value,
			debugModeEnabled: localStorage.getItem(LocalStorageItems.IS_DEBUG_LOGGER_ENABLED) === "true",
			darkModeEnabled: localStorage.getItem(LocalStorageItems.DARK_MODE) === "true",
			discordWebLinks: localStorage.getItem(LocalStorageItems.IS_DISCORD_OPEN_WEB) === "true",
			historyTablePageSize: localStorage.getItem(LocalStorageItems.SELECTED_PAGE_SIZE) ?? "10",
		});
	}
}

export async function initializeMedrunnerSettings() {
	const logicStore = useLogicStore();
	const userStore = useUserStore();

	if (userStore.isAuthenticated) {
		try {
			const response = await api.orgSettings.getPublicSettings();
			logicStore.medrunnerSettings = response.data;
		}
		catch (_e) {

		}
	}
}

export function initializeTabChecker() {
	const logicStore = useLogicStore();

	const tabChannel = new BroadcastChannel("tab-check");

	tabChannel.postMessage(`checkTab`);

	tabChannel.onmessage = (event) => {
		if (event.data === "checkTab") {
			tabChannel.postMessage("exists");
		}
		else if (event.data === "exists") {
			logicStore.isFirstInstance = false;
		}
	};
}
