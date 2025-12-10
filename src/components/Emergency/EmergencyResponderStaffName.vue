<script setup lang="ts">
import type { Level } from "@medrunner/api-client";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

export interface Props {
	name?: string;
	level?: Level;
}

const props = defineProps<Props>();
const { t } = useI18n();

const showPopover = ref(false);

function splitOnLastZero(str: string): string[] {
	return str.includes("0") ? [str.slice(0, str.lastIndexOf("0")), str.slice(str.lastIndexOf("0") + 1)] : [str];
}
</script>

<template>
	<div class="relative">
		<p
			class="
				w-fit cursor-help text-gray-500
				dark:text-gray-400
			" @mouseenter="showPopover = true" @mouseleave="showPopover = false"
		>
			{{ name }}
		</p>
		<div
			v-if="showPopover"
			role="tooltip"
			class="
				absolute bottom-5 z-30 mb-1 inline-block rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500 shadow-xs
				dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400
			"
		>
			<div v-if="props.level" class="flex items-center p-2">
				<img :src="`/icons/medals/${level}.svg`" alt="Success Medal" class="mr-2 h-5 w-5">
				<p>
					{{
						t("tracking_levelSection", {
							levelNumber: splitOnLastZero(props.level.toString())[0],
							sectionNumber: splitOnLastZero(props.level.toString())[1],
						})
					}}
				</p>
			</div>
		</div>
	</div>
</template>

<style scoped></style>
