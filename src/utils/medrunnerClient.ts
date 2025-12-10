import type { HubConnection } from "@microsoft/signalr";
import { MedrunnerApiClient } from "@medrunner/api-client";

import { debugLogger } from "@/utils/debugLogger";

export let api: MedrunnerApiClient;
export let ws: HubConnection;

export function initializeApi() {
	api = MedrunnerApiClient.buildClient(
		{
			baseUrl: import.meta.env.VITE_API_URL,
			cookieAuth: true,
		},
		async () => {},
		{
			trace(message?: any) {
				debugLogger(message, "trace");
			},
			info(message?: any) {
				debugLogger(message, "info");
			},
			warn(message?: any) {
				debugLogger(message, "warn");
			},
			error(message?: any) {
				debugLogger(message, "error");
			},
			debug(message?: any) {
				debugLogger(message, "debug");
			},
		},
	);
}

export async function initializeWebsocket() {
	ws = await api.websocket.initialize();
	await ws.start();
}
