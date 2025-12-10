<script setup lang="ts">
export interface Props {
	color?: "gray" | "yellow" | "outline-solid";
	icon?: "warning";
	fontWeight?: "normal" | "medium";
}

const props = withDefaults(defineProps<Props>(), {
	color: "gray",
	fontWeight: "medium",
});
</script>

<template>
	<div
		class="flex items-center rounded-lg border p-2.5 text-sm"
		:class="{
			'border-gray-200 dark:border-gray-700': props.color === 'gray',
			'border-yellow-300 bg-yellow-100 text-yellow-800 dark:border-yellow-400 dark:bg-yellow-800 dark:text-yellow-300':
				props.color === 'yellow',
			'border-primary-600 dark:border-primary-300': props.color === 'outline-solid',
			'font-medium': props.fontWeight === 'medium',
		}"
	>
		<svg
			v-if="icon === 'warning'"
			class="me-2 inline h-5 w-5 shrink-0"
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			fill="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				fill-rule="evenodd"
				d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm11-4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z"
				clip-rule="evenodd"
			/>
		</svg>
		<div>
			<slot />
		</div>
	</div>
</template>

<style scoped></style>
