<script setup lang="ts">
import { useI18n } from "vue-i18n";

export interface Props {
    type?: "primary" | "secondary" | "outline";
    submit?: boolean;
    loading?: boolean;
    errorText?: string;
    size?: "fit" | "full";
    icon?: "link" | "pencil" | "logout" | "plus" | "cross" | "arrowLeft" | "cancel";
    iconPosition?: "left" | "right";
}

const props = withDefaults(defineProps<Props>(), {
    type: "primary",
    loading: false,
    size: "fit",
    iconPosition: "left",
    submit: false,
});

const { t } = useI18n();
</script>

<template>
    <div :class="props.size === 'fit' ? 'w-fit' : ''">
        <button
            :type="props.submit ? 'submit' : 'button'"
            class="flex cursor-pointer items-center justify-center rounded-lg border px-5 py-2.5 text-sm font-medium focus:outline-none"
            :class="{
                'border-primary-600 bg-primary-600 text-white hover:bg-primary-600/90': props.type === 'primary',
                'border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-600 dark:hover:bg-gray-700':
                    props.type === 'secondary',
                'border-primary-600 bg-transparent text-primary-600 hover:bg-gray-50 dark:border-red-700 dark:text-red-700  dark:hover:bg-gray-700':
                    props.type === 'outline',
                'cursor-progress bg-primary-600': props.loading,
                'w-full': props.size === 'full',
            }"
            :disabled="props.loading"
        >
            <span v-if="props.loading" class="flex items-center">
                <svg
                    aria-hidden="true"
                    role="status"
                    class="mr-3 inline h-4 w-4 animate-spin text-white"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="#E5E7EB"
                    />
                    <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentColor"
                    />
                </svg>
                {{ t("home_loading") }}
            </span>
            <span v-else class="flex items-center" :class="props.iconPosition === 'right' ? 'flex-row-reverse' : ''">
                <span v-if="props.icon" :class="props.iconPosition === 'right' ? 'ml-4' : 'mr-4'">
                    <svg
                        v-if="props.icon === 'link'"
                        class="h-3.5 w-3.5"
                        :class="{
                            'text-white': props.type === 'primary',
                            'text-primary-600 ': props.type === 'outline',
                            'text-gray-800 dark:text-white': props.type === 'secondary',
                        }"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 18 18"
                    >
                        <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"
                        />
                    </svg>

                    <svg
                        v-else-if="props.icon === 'pencil'"
                        class="h-3.5 w-3.5"
                        :class="{
                            'text-white': props.type === 'primary',
                            'text-primary-600 ': props.type === 'outline',
                            'text-gray-800 dark:text-white': props.type === 'secondary',
                        }"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z"
                        />
                    </svg>

                    <svg
                        v-else-if="props.icon === 'logout'"
                        class="h-5 w-5"
                        :class="{
                            'text-white': props.type === 'primary',
                            'text-primary-600 ': props.type === 'outline',
                            'text-gray-800 dark:text-white': props.type === 'secondary',
                        }"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z"
                            clip-rule="evenodd"
                        />
                    </svg>

                    <svg
                        v-else-if="props.icon === 'plus'"
                        class="h-4 w-4"
                        :class="{
                            'text-white': props.type === 'primary',
                            'text-primary-600 ': props.type === 'outline',
                            'text-gray-800 dark:text-white': props.type === 'secondary',
                        }"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 18 18"
                    >
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16" />
                    </svg>

                    <svg
                        v-else-if="props.icon === 'cross'"
                        class="h-4 w-4"
                        :class="{
                            'text-white': props.type === 'primary',
                            'text-primary-600 ': props.type === 'outline',
                            'text-gray-800 dark:text-white': props.type === 'secondary',
                        }"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14"
                    >
                        <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                    </svg>

                    <svg
                        v-else-if="props.icon === 'arrowLeft'"
                        class="h-4 w-4"
                        :class="{
                            'text-white': props.type === 'primary',
                            'text-primary-600 ': props.type === 'outline',
                            'text-gray-800 dark:text-white': props.type === 'secondary',
                        }"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 10"
                    >
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H1m0 0 4 4M1 5l4-4" />
                    </svg>

                    <svg
                        v-else-if="props.icon === 'cancel'"
                        class="h-4 w-4"
                        :class="{
                            'text-white': props.type === 'primary',
                            'text-primary-600 ': props.type === 'outline',
                            'text-gray-800 dark:text-white': props.type === 'secondary',
                        }"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2.5"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                    </svg>
                </span>
                <slot />
            </span>
        </button>

        <p v-if="props.errorText" class="mt-2 text-sm font-semibold text-red-600 dark:text-red-500">{{ props.errorText }}</p>
    </div>
</template>

<style scoped></style>
