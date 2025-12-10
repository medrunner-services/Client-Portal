import { HubConnectionState } from "@microsoft/signalr";

import { LocalStorageItems, WSState } from "@/@types/types.ts";
import { useLogicStore } from "@/stores/logicStore.ts";
import { ws } from "@/utils/medrunnerClient.ts";

export async function restartWebsocket() {
	const logicStore = useLogicStore();

	try {
		logicStore.wsManualReconnect = true;

		await ws.stop();
		localStorage.removeItem(LocalStorageItems.ACCESS_TOKEN_EXPIRATION);
		await ws.start();
		if (ws.state === HubConnectionState.Connected)
			logicStore.currentWSState = WSState.HEALTHY;
	}
	catch (error) {
		throw error;
	}
	finally {
		logicStore.wsManualReconnect = false;
	}
}

export async function stopWebsocket() {
	const logicStore = useLogicStore();

	try {
		logicStore.wsManualReconnect = true;

		await ws.stop();
		await new Promise(resolve => setTimeout(resolve, 2000));
	}
	catch (error) {
		throw error;
	}
	finally {
		logicStore.wsManualReconnect = false;
	}
}
