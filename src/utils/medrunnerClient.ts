import { MedrunnerApiClient } from "@medrunner-services/api-client";

export let api: MedrunnerApiClient;

export function initializeApi(refreshToken: string | undefined) {
    console.log("%cInitializing client: " + refreshToken, "color: red; font-size: 1.4em;");
    api = MedrunnerApiClient.buildClient(
        {
            baseUrl: import.meta.env.VITE_API_URL,
            refreshToken,
        },
        async newTokens => {
            console.log(
                "%cRefreshing tokens: " + newTokens.refreshToken,
                "color: red; font-size: 1.4em;",
            );
            localStorage.setItem("refreshToken", newTokens.refreshToken);
        },
        {
            trace: (_message?: any, ..._optionalParams: any[]) => {
                console.log(_message);
            },
            debug: (_message?: any, ..._optionalParams: any[]) => {
                console.log(_message);
            },
            info: (_message?: any, ..._optionalParams: any[]) => {
                console.log(_message);
            },
            warn: (_message?: any, ..._optionalParams: any[]) => {
                console.log(_message);
            },
            error: (_message?: any, ..._optionalParams: any[]) => {
                console.log(_message);
            },
        },
    );
}
