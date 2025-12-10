import { LocalStorageItems } from "@/@types/types.ts";

export function redirectToDiscordLogin(redirect: string): void {
	localStorage.removeItem(LocalStorageItems.ACCESS_TOKEN_EXPIRATION);
	localStorage.removeItem(LocalStorageItems.REFRESH_TOKEN_EXPIRATION);

	window.location.replace(
		`https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID}&scope=identify&response_type=code&state=${redirect}&redirect_uri=${
			import.meta.env.VITE_CALLBACK_URL
		}/auth`,
	);
}

export function redirectToDiscordRegister(redirect: string): void {
	localStorage.removeItem(LocalStorageItems.ACCESS_TOKEN_EXPIRATION);
	localStorage.removeItem(LocalStorageItems.REFRESH_TOKEN_EXPIRATION);

	window.location.replace(
		`https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID}&scope=identify&response_type=code&state=${redirect}&redirect_uri=${
			import.meta.env.VITE_CALLBACK_URL
		}/auth/register`,
	);
}
