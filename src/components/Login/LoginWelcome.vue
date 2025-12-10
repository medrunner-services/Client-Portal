<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import { redirectToDiscordLogin, redirectToDiscordRegister } from "@/utils/discordRedirects";

const { t } = useI18n();
const route = useRoute();
</script>

<template>
	<div>
		<h1 class="mt-8 font-Mohave text-3xl font-bold">
			{{ t("login_welcomeBack") }}
		</h1>
		<p class="text-lg font-medium">
			{{ t("login_welcomeBackHelperText") }}
		</p>
		<p class="mt-2 text-gray-500">
			{{ t("login_welcomeBackHelperLink") }}<a target="_blank" class="ml-1 underline" href="https://medrunner.space">medrunner.space</a>.
		</p>
		<GlobalButton class="mt-8 w-full" size="full" @click="redirectToDiscordLogin(encodeURIComponent(route.query.redirect as string) ?? '')">
			{{ t("login_logInButton") }}
		</GlobalButton>
		<GlobalButton
			class="mt-4 w-full"
			type="secondary"
			size="full"
			@click="redirectToDiscordRegister(encodeURIComponent(route.query.redirect as string) ?? '')"
		>
			{{ t("login_registerButton") }}
		</GlobalButton>
	</div>
</template>

<style scoped></style>
