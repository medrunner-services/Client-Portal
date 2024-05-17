<script setup lang="ts">
import { onBeforeUnmount, onMounted, type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";

const { locale, availableLocales } = useI18n({ useScope: "global" });
const logicStore = useLogicStore();
const userStore = useUserStore();

const showDropdown = ref(false);
const selectorDiv: Ref<HTMLDivElement | null> = ref(null);
const selectorParent: Ref<HTMLDivElement | null> = ref(null);

onMounted(() => {
    document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener("click", handleClickOutside);
});

const handleClickOutside = (event: MouseEvent) => {
    if (
        selectorDiv.value &&
        selectorParent.value &&
        !event.composedPath().includes(selectorDiv.value) &&
        !event.composedPath().includes(selectorParent.value)
    ) {
        showDropdown.value = false;
    }
};

async function changeLanguage(newLocal: string): Promise<void> {
    locale.value = newLocal;
    showDropdown.value = false;

    try {
        await userStore.setSettings({ selectedLanguage: newLocal });
    } catch (e) {
        return;
    }
}
</script>

<template>
    <div>
        <button
            ref="selectorParent"
            @click="showDropdown = !showDropdown"
            class="flex w-full items-center justify-between rounded py-2 pl-3 pr-4 lg:w-auto lg:border-0 lg:p-0 lg:hover:bg-transparent lg:dark:hover:bg-transparent"
        >
            <img :src="`/icons/flags/${locale}.svg`" alt="Flag" class="mr-2 h-6 w-6" />
            {{ logicStore.getLanguageString(locale) }}
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
            ref="selectorDiv"
            v-if="showDropdown"
            class="absolute z-10 mt-7 -translate-x-11 rounded-lg bg-white font-normal shadow-lg dark:bg-gray-700 dark:shadow-gray-900"
        >
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-400">
                <li
                    v-for="language in availableLocales"
                    :key="language"
                    @click="changeLanguage(language)"
                    class="flex cursor-pointer items-center px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                    <img :src="`/icons/flags/${language}.svg`" alt="Flag" class="mr-6 h-6 w-6" />
                    <p>{{ logicStore.getLanguageString(language) }}</p>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped></style>
