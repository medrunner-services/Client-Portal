export enum MessageNotification {
	ALL,
	PING,
	OFF,
}

export enum AlertColors {
	RED = "red",
	GREEN = "green",
	BLUE = "blue",
	YELLOW = "yellow",
}

export interface SyncedSettings {
	hideEmergencyRulesModal: boolean;
	globalNotifications: boolean;
	emergencyUpdateNotification: boolean;
	customSoundNotification: boolean;
	chatMessageNotification: MessageNotification;
	globalAnalytics: boolean;
	selectedLanguage: string;
	lastConfirmedWarningId: string;
	hour12FormatingPreference?: boolean;
}

export enum WSState {
	HEALTHY,
	RECONNECTING,
	DISCONNECTED,
}

export enum LocalStorageItems {
	ACCESS_TOKEN_EXPIRATION = "accessTokenExpiration",
	REFRESH_TOKEN_EXPIRATION = "refreshTokenExpiration",
	DARK_MODE = "darkMode",
	IS_DISCORD_OPEN_WEB = "isDiscordOpenWeb",
	SELECTED_PAGE_SIZE = "selectedPageSize",
	IS_DEBUG_LOGGER_ENABLED = "isDebugLoggerEnabled",
	LOGIN_ANIMATION = "loginAnimation",
	LOGIN_ANIMATION_GLOW_SIZE = "loginAnimationGlowSize",
	LOGIN_ANIMATION_STAR_SIZE = "loginAnimationStarSize",
	LOGIN_ANIMATION_SPEED = "loginAnimationSpeed",
}

export type AlertIcons = "info" | "warning";

export interface WebSocketMessage {
	id: string;
}
