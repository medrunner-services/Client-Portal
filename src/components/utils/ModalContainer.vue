<script setup lang="ts">
const emit = defineEmits(["close"]);

document.body.style.overflow = "hidden";

function closeModal() {
    document.body.style.overflow = "auto";
    emit("close");
}
</script>

<template>
    <teleport to="#modals">
        <div
            @click.self="closeModal()"
            class="fixed left-0 right-0 top-0 z-40 flex h-screen w-screen items-center justify-center overflow-auto bg-gray-600/75 py-24"
        >
            <div
                class="content-container relative max-h-full w-11/12 overflow-y-auto rounded-lg bg-white p-4 shadow dark:bg-gray-800 lg:w-1/2 2xl:w-1/3"
            >
                <div class="w-full">
                    <svg
                        @click="closeModal()"
                        class="ml-auto h-3 w-3 cursor-pointer text-gray-800 dark:text-white"
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
                </div>
                <div class="mt-4">
                    <slot :close="closeModal" />
                </div>
            </div>
        </div>
    </teleport>
</template>

<style scoped></style>
