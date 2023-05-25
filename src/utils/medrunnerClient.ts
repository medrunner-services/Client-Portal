import { MedrunnerApiClient } from "@medrunner-services/api-client";

export let api: MedrunnerApiClient;

export function initializeApi(refreshToken: string | undefined) {
    api = MedrunnerApiClient.buildClient(
        {
            baseUrl: import.meta.env.VITE_API_URL,
            refreshToken,
        },
        async newTokens => {
            localStorage.setItem("refreshToken", newTokens.refreshToken);
        },
    );
}
