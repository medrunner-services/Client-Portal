export function redirectToDiscordLogin(): void {
    window.location.replace(
        `https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${
            import.meta.env.VITE_CALLBACK_URL
        }/auth`,
    );
}

export function redirectToDiscordRegister(): void {
    window.location.replace(
        `https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${
            import.meta.env.VITE_CALLBACK_URL
        }/auth/register`,
    );
}
