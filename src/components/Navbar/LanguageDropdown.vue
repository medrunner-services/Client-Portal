<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import { useUserStore } from "@/stores/userStore";
import { getLanguageString } from "@/utils/functions/getStringsFunctions.ts";

const { locale, availableLocales } = useI18n({ useScope: "global" });
const userStore = useUserStore();

const showDropdown = ref(false);
const selectorDiv = ref<HTMLDivElement | null>(null);
const selectorParent = ref<HTMLDivElement | null>(null);

onMounted(() => {
	document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
	document.removeEventListener("click", handleClickOutside);
});

function handleClickOutside(event: MouseEvent) {
	if (
		selectorDiv.value
		&& selectorParent.value
		&& !event.composedPath().includes(selectorDiv.value)
		&& !event.composedPath().includes(selectorParent.value)
	) {
		showDropdown.value = false;
	}
}

async function changeLanguage(newLocal: string): Promise<void> {
	locale.value = newLocal;
	showDropdown.value = false;

	try {
		await userStore.setSettings({ selectedLanguage: newLocal });
	}
	catch (_e) {

	}
}
</script>

<template>
	<div class="relative">
		<button
			ref="selectorParent"
			class="
				flex w-full cursor-pointer items-center justify-between rounded-sm py-2 pr-4 pl-3
				lg:w-auto lg:border-0 lg:p-0 lg:hover:bg-transparent lg:dark:hover:bg-transparent
			"
			@click="showDropdown = !showDropdown"
		>
			<img :src="`/icons/flags/${locale}.svg`" alt="Flag" class="mr-2 h-6 w-6">
			{{ getLanguageString(locale) }}
			<svg
				class="ml-2.5 h-2.5 w-2.5"
				:class="showDropdown ? 'rotate-180' : ''"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 10 6"
			>
				<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
			</svg>
		</button>
		<div
			v-if="showDropdown"
			ref="selectorDiv"
			class="
				absolute top-14 left-1/2 z-10 w-44 -translate-x-1/2 transform rounded-lg border border-gray-200 bg-white font-normal shadow-lg
				dark:border-gray-700 dark:bg-gray-700 dark:shadow-gray-900
			"
		>
			<ul
				class="
					py-2 text-sm text-gray-700
					dark:text-gray-400
				"
			>
				<li
					v-for="language in availableLocales"
					:key="language"
					class="
						flex cursor-pointer items-center px-6 py-2
						hover:bg-gray-100
						dark:hover:bg-gray-600 dark:hover:text-white
					"
					@click="changeLanguage(language)"
				>
					<img :src="`/icons/flags/${language}.svg`" alt="Flag" class="mr-6 h-6 w-6">
					<p>{{ getLanguageString(language) }}</p>
				</li>
			</ul>
		</div>
	</div>
</template>

<style scoped></style>
