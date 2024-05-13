import { MedrunnerApiClient } from "@medrunner/api-client";
import { HubConnection } from "@microsoft/signalr";

export let api: MedrunnerApiClient;
export let ws: HubConnection;

export async function initializeApi(refreshToken: string | undefined) {
    api = MedrunnerApiClient.buildClient(
        {
            baseUrl: import.meta.env.VITE_API_URL,
            refreshToken,
        },
        async (newTokens) => {
            localStorage.setItem("refreshToken", newTokens.refreshToken);
        },
    );
}

export async function initializeWebsocket() {
    ws = await api.websocket.initialize();
    await ws.start();
}
