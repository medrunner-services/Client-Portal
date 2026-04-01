<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useLogicStore } from "@/stores/logicStore.ts";

const props = withDefaults(defineProps<Props>(), {
    userCloseModal: true,
});
const emit = defineEmits(["close"]);
export interface Props {
    title: string;
    userCloseModal?: boolean;
}
const logicStore = useLogicStore();

onMounted(() => {
    document.body.style.overflow = "hidden";
    logicStore.openedModalCounter++;
});

onUnmounted(() => {
    logicStore.openedModalCounter--;

    if (logicStore.openedModalCounter <= 0) {
        document.body.style.overflow = "auto";
    }
});

function closeModal() {
    emit("close");
}
</script>

<template>
    <teleport to="#modals">
        <div
            class="fixed inset-x-0 top-0 z-40 flex h-screen w-screen items-center justify-center overflow-auto bg-gray-600/75 py-24"
            @mousedown.self="props.userCloseModal ? closeModal() : undefined"
        >
            <div
                class="
                    content-container relative max-h-full w-11/12 overflow-y-auto rounded-lg bg-white p-4 shadow-sm
                    lg:w-1/2
                    2xl:w-1/3
                    dark:bg-gray-800
                "
            >
                <div class="flex w-full justify-between">
                    <p class="text-xl font-semibold">
                        {{ props.title }}
                    </p>
                    <svg
                        v-if="props.userCloseModal"
                        class="
                            ml-auto size-3 cursor-pointer text-gray-800
                            dark:text-white
                        "
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14"
                        @click="closeModal()"
                    >
                        <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                    </svg>
                </div>
                <div class="mt-2">
                    <slot :close="closeModal" />
                </div>
            </div>
        </div>
    </teleport>
</template>

<style scoped></style>
