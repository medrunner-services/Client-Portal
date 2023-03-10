import * as signalR from "@microsoft/signalr";

export const establishConnection = (token: string) => {
    return new signalR.HubConnectionBuilder()
        .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: () => 5000,
        })
        .withUrl(`${import.meta.env.VITE_API_URL}/hub/emergency`, {
            accessTokenFactory: async () => token,
        })
        .configureLogging(signalR.LogLevel.None)
        .build();
};
