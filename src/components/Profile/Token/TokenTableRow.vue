<script setup lang="ts">
import type { ApiToken } from "@medrunner/api-client";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import DeleteTokenModal from "@/components/Modals/DeleteTokenModal.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalLocalizedDate from "@/components/utils/GlobalLocalizedDate.vue";
import { getTokenScopeString } from "@/utils/functions/getStringsFunctions.ts";

const props = defineProps<Props>();

const emit = defineEmits(["tokenDeleted"]);

const { t } = useI18n();

export interface Props {
    token: ApiToken;
    parentDiv: HTMLDivElement | null;
}
const displayDeleteTokenModal = ref(false);
const showDetails = ref(false);
const detailsDiv = ref<HTMLDivElement | null>(null);
const rowParent = ref<HTMLDivElement | null>(null);

onMounted(() => {
    document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener("click", handleClickOutside);
});

const isTokenExpired = computed(() => {
    if (!props.token.expirationDate)
        return false;
    return Date.now() / 1000 > new Date(props.token.expirationDate).getTime();
});

function handleClickOutside(event: MouseEvent) {
    if (
        detailsDiv.value
        && rowParent.value
        && props.parentDiv
        && !event.composedPath().includes(detailsDiv.value)
        && !event.composedPath().includes(rowParent.value)
        && event.composedPath().includes(props.parentDiv)
    ) {
        showDetails.value = false;
    }
}
</script>

<template>
    <div
        ref="rowParent"
        class="
            grid cursor-pointer grid-cols-12 items-center border-b px-3 py-3
            last:border-b-0
            hover:bg-gray-200
            dark:border-gray-700 dark:hover:bg-gray-700
        "
        :class="showDetails ? `
            bg-gray-200
            dark:bg-gray-700
        ` : ''"
        @click="showDetails = !showDetails"
    >
        <div class="px-1">
            <svg
                class="
                    h-3 w-3 text-gray-500
                    dark:text-gray-400
                "
                :class="showDetails ? `
                    rotate-180 text-gray-900
                    dark:text-gray-200
                ` : ''"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
            >
                <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1"
                />
            </svg>
        </div>
        <div
            class="
                col-span-5 col-start-2 font-medium text-gray-900
                dark:text-white
            "
        >
            {{ props.token.name }}
        </div>

        <div class="col-span-3">
            <GlobalLocalizedDate v-if="props.token.lastUsed" :date="props.token.lastUsed" format="toDate" />
            <p v-else>
                {{ t("developer_tokenNever") }}
            </p>
        </div>

        <div
            class="col-span-3"
        >
            <GlobalLocalizedDate
                v-if="props.token.expirationDate"
                :class="isTokenExpired ? 'font-medium text-red-600' : ''"
                :date="props.token.expirationDate"
                format="toDate"
            />
            <p v-else class="font-medium text-yellow-400">
                {{ t("developer_tokenNever") }}
            </p>
        </div>

        <!--        <div -->
        <!--            class=" -->
        <!--                col-span-1 flex items-center justify-end font-medium text-red-600 -->
        <!--                md:col-span-2 -->
        <!--            " -->
        <!--        > -->
        <!--            <div -->
        <!--                class=" -->
        <!--                    flex cursor-pointer gap-2 rounded-lg p-2 -->
        <!--                    hover:bg-red-600/10 -->
        <!--                " @click="displayDeleteTokenModal = true" -->
        <!--            > -->
        <!--                <svg class="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20"> -->
        <!--                    <path -->
        <!--                        d="M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z" -->
        <!--                    /> -->
        <!--                </svg> -->
        <!--                <p -->
        <!--                    class=" -->
        <!--                        hidden -->
        <!--                        md:block -->
        <!--                    " -->
        <!--                > -->
        <!--                    {{ t("developer_tokenDelete") }} -->
        <!--                </p> -->
        <!--            </div> -->
        <!--        </div> -->
    </div>

    <div
        v-if="showDetails" ref="detailsDiv" class="
            w-full overflow-x-auto bg-gray-50
            dark:bg-gray-900
        "
    >
        <div
            class="
                border-b p-4
                dark:border-gray-700
            "
        >
            <div class="flex flex-wrap gap-2">
                <GlobalCard v-for="scope in props.token.scopes" :key="scope" border-color="gray" class="w-fit p-2!">
                    <p class="font-medium text-gray-900">
                        {{ getTokenScopeString(scope) }}
                    </p>
                    <p class="mt-1 text-xs text-gray-400">
                        {{ scope }}
                    </p>
                </GlobalCard>
            </div>

            <div class="mt-4">
                <GlobalButton type="outline-solid" size="full" @click="displayDeleteTokenModal = true">
                    {{ t("developer_deleteTokenButton") }}
                </GlobalButton>
            </div>
        </div>
    </div>

    <DeleteTokenModal
        v-if="displayDeleteTokenModal"
        :token="props.token"
        @close="displayDeleteTokenModal = false"
        @token-deleted="
            (id) => {
                emit('tokenDeleted', id);
            }
        "
    />
</template>

<style scoped></style>
