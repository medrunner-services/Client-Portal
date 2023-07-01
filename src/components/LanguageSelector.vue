<script setup lang="ts">
import { onBeforeUnmount, onMounted, type Ref, ref } from "vue";

import { useLogicStore } from "@/stores/logicStore";

const logicStore = useLogicStore();

const props = defineProps(["availableLocales", "selectorParent"]);

const emit = defineEmits<{
    (e: "changeLanguage", language: string): void;
    (e: "closeSelector"): void;
}>();

const selectorDiv: Ref<HTMLDivElement | null> = ref(null);

onMounted(() => {
    document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener("click", handleClickOutside);
});

const handleClickOutside = (event: MouseEvent) => {
    if (
        selectorDiv.value &&
        props.selectorParent &&
        !event.composedPath().includes(selectorDiv.value) &&
        !event.composedPath().includes(props.selectorParent)
    ) {
        emit("closeSelector");
    }
};
</script>

<template>
    <div ref="selectorDiv">
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
    </div>
</template>

<style scoped></style>
