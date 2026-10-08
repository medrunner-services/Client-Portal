<script setup lang="ts">
import type { Level } from "@medrunner/api-client";
import { useI18n } from "vue-i18n";
import GlobalTooltip from "@/components/utils/GlobalTooltip.vue";

export interface Props {
    name?: string;
    level?: Level;
}

const props = defineProps<Props>();
const { t } = useI18n();

function splitOnLastZero(str: string): string[] {
    return str.includes("0") ? [str.slice(0, str.lastIndexOf("0")), str.slice(str.lastIndexOf("0") + 1)] : [str];
}
</script>

<template>
    <GlobalTooltip width="w-auto" :disable-hover="!props.level">
        <template #trigger>
            <p
                class="
                    w-fit cursor-help text-gray-500
                    dark:text-gray-400
                "
            >
                {{ name }}
            </p>
        </template>

        <template #content>
            <div v-if="props.level" class="flex items-center p-2">
                <img :src="`/icons/medals/${level}.svg`" alt="Success Medal" class="mr-2 size-5">
                <p>
                    {{
                        t("tracking_levelSection", {
                            levelNumber: splitOnLastZero(props.level.toString())[0],
                            sectionNumber: splitOnLastZero(props.level.toString())[1],
                        })
                    }}
                </p>
            </div>
        </template>
    </GlobalTooltip>
</template>

<style scoped></style>
