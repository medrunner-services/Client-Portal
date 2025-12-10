<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import { parseMarkdown } from "@/utils/functions/stringFunctions.ts";

const props = withDefaults(defineProps<Props>(), {
	color: "yellow",
	icon: "info",
	fontWeight: "normal",
	showButton: false,
	buttonFunction: () => {},
});

const { t } = useI18n();

export interface Props {
	message: string;
	color?: "yellow" | "red";
	icon?: "info" | "warning";
	fontWeight?: "normal" | "medium";
	showButton?: boolean;
	buttonText?: string;
	buttonFunction?: () => void;
}

const getButtonOutlineColors = computed(() => {
	return props.color === "yellow"
		? {
				outlineTextColor: "text-yellow-800",
				outlineBorderColor: "border-yellow-800",
				outlineHoverColor: "hover:bg-gray-200/10",
			}
		: {
				outlineTextColor: "text-red-800",
				outlineBorderColor: "border-red-800",
				outlineHoverColor: "hover:bg-gray-200/10",
			};
});
</script>

<template>
	<div
		class="
			w-full border border-b border-gray-200 px-4 py-3
			lg:py-2.5
			dark:border-0
		"
		:class="{
			'bg-yellow-100 text-yellow-800': props.color === 'yellow',
			'bg-red-100 text-red-800': props.color === 'red',
		}"
	>
		<div
			class="
				content-container flex w-full flex-col items-start justify-between
				md:flex-row md:items-center md:gap-8
			"
		>
			<div
				class="
					sm:flex
					lg:items-center
				"
			>
				<svg
					v-if="props.icon === 'info'"
					class="
						mr-3 hidden size-5 shrink-0
						sm:mb-0
						lg:flex
					"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill-rule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
						clip-rule="evenodd"
					/>
				</svg>

				<svg
					v-if="props.icon === 'warning'"
					class="
						mr-3 hidden size-7 shrink-0
						sm:mb-0
						lg:flex
					"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
					/>
				</svg>

				<p
					class="
						markdown-extras mb-4 wrap-anywhere
						md:mb-0
					"
					:class="{
						'font-medium': props.fontWeight === 'medium',
					}"
					v-html="parseMarkdown(props.message)"
				/>
			</div>
			<div
				v-if="props.showButton" class="
					flex w-full shrink-0 items-center space-x-4
					md:w-fit
					lg:pl-10
				"
			>
				<GlobalButton
					type="outline-solid"
					size="full"
					class="
						w-full
						md:w-fit
					"
					:outline-text-color="getButtonOutlineColors.outlineTextColor"
					:outline-border-color="getButtonOutlineColors.outlineBorderColor"
					:outline-hover-color="getButtonOutlineColors.outlineHoverColor"
					@click="props.buttonFunction"
				>
					{{ props.buttonText ?? t("tracking_finishButton") }}
				</GlobalButton>
			</div>
		</div>
	</div>
</template>

<style scoped>
:deep(.markdown-extras a) {
    text-decoration: underline;
}
</style>
