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
}

export enum WSState {
    HEALTHY,
    RECONNECTING,
    DISCONNECTED,
}
