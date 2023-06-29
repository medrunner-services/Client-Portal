<script setup lang="ts">
import { useLogicStore } from "@/stores/logicStore";

const logicStore = useLogicStore();

defineProps<{
    availableLocales: string[];
}>();

const emit = defineEmits<{
    (e: "changeLanguage", language: string): void;
}>();
</script>

<template>
    <div class="grid grid-cols-2 gap-4">
        <div
            v-for="language in availableLocales"
            :key="language"
            @click="$emit('changeLanguage', language)"
            class="flex w-fit cursor-pointer items-center gap-2"
        >
            <img :src="`/icons/flags/${language.split('-')[1].toLowerCase()}.svg`" class="h-4 w-5" alt="flag" />
            <p class="font-Mohave text-xl">{{ logicStore.getLanguageString(language) }}</p>
        </div>
    </div>
</template>

<style scoped></style>
