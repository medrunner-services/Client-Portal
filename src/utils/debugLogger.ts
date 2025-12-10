/* eslint no-console: "off" */

import { LocalStorageItems } from "@/@types/types.ts";

export function debugLogger(message: string, type?: "trace" | "info" | "warn" | "error" | "debug") {
	if (localStorage.getItem(LocalStorageItems.IS_DEBUG_LOGGER_ENABLED) === "true") {
		console.log(`[${new Date().toUTCString().slice(0, -4)}] ${type ? type.toUpperCase() : "LOG"}: ${message}`);
	}
}
