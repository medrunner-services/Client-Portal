<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { AxiosError } from "axios";
import { ref } from "vue";

import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const isUpdatingRsiHandle = ref(false);
const newRsiHandle = ref(userStore.user.rsiHandle);
const rsiHandleErrorMessage = ref("");
const rsiHandleApiUpdating = ref(false);

async function updateRsiHandle(): Promise<void> {
    if (!isUpdatingRsiHandle.value) {
        isUpdatingRsiHandle.value = true;
        return;
    }

    rsiHandleApiUpdating.value = true;
    try {
        await userStore.linkUser(newRsiHandle.value);
        isUpdatingRsiHandle.value = false;
    } catch (error: AxiosError | any) {
        if (error.message === "451") rsiHandleErrorMessage.value = "This account is blocked";
        if (error.message === "403")
            rsiHandleErrorMessage.value = "Missing Medrunner ID in RSI Bio";
        if (error.message === "404")
            rsiHandleErrorMessage.value = "Cannot find a RSI account with this username";

        rsiHandleApiUpdating.value = false;
    }
}
</script>

<template>
    <form class="xl:w-5/6">
        <div class="lg:w-[48%]">
            <div class="flex items-center">
                <label class="text-sm font-semibold">Star Citizen Username</label>
                <img
                    src="/icons/info-icon.svg"
                    alt="Info label"
                    class="ml-2 h-4 w-4 cursor-help"
                    title="The username of your RSI account"
                />
            </div>
            <div class="w-full flex mt-2">
                <input
                    type="text"
                    v-model="newRsiHandle"
                    :class="rsiHandleErrorMessage ? 'input-text-error' : 'input-text'"
                    :disabled="!isUpdatingRsiHandle"
                />
                <button
                    :disabled="rsiHandleApiUpdating"
                    @click.prevent="updateRsiHandle()"
                    class="border-2 border-primary-900 font-Inter flex justify-center items-center font-bold flex-grow lg:px-3 ml-3 min-w-[6rem]"
                >
                    <svg
                        v-if="rsiHandleApiUpdating"
                        class="animate-spin h-5 w-5 text-primary-900"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                        ></circle>
                        <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <span v-else>{{ isUpdatingRsiHandle ? "Confirm" : "Edit" }}</span>
                </button>
            </div>
            <p v-if="rsiHandleErrorMessage" class="mt-2 text-primary-400 text-xs w-full">
                {{ rsiHandleErrorMessage }}
            </p>
        </div>

        <div class="mt-10 lg:flex lg:justify-between lg:w-full">
            <div class="lg:w-[48%]">
                <div class="flex items-center">
                    <label class="text-sm font-semibold">System</label>
                    <img
                        src="/icons/info-icon.svg"
                        alt="Info label"
                        class="ml-2 h-4 w-4 cursor-help"
                        title="The system where you are stranded"
                    />
                </div>
                <div class="mt-2">
                    <select
                        class="w-full disabled:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
                        disabled
                    >
                        <option>Stanton</option>
                    </select>
                </div>
            </div>

            <div class="mt-5 lg:mt-0 lg:w-[48%]">
                <div class="flex items-center">
                    <label class="text-sm font-semibold">Nearest Planet</label>
                    <img
                        src="/icons/info-icon.svg"
                        alt="Info label"
                        class="ml-2 h-4 w-4 cursor-help"
                        title="The nearest planet where you are stranded"
                    />
                </div>
                <div class="mt-2">
                    <select class="w-full focus:ring-secondary-500 focus:border-secondary-500">
                        <option selected disabled hidden value>Select a planet</option>
                        <option>microTech</option>
                        <option>Hurston</option>
                        <option>Crusader</option>
                        <option>ArcCorp</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="mt-5 lg:flex lg:justify-between lg:w-full">
            <div class="lg:mt-0 lg:w-[48%]">
                <div class="flex items-center">
                    <label class="text-sm font-semibold">Threat Level</label>
                    <img
                        src="/icons/info-icon.svg"
                        alt="Info label"
                        class="ml-2 h-4 w-4 cursor-help"
                        title="The level of danger that the rescue team might encounter"
                    />
                </div>
                <div class="mt-2">
                    <select class="w-full focus:ring-secondary-500 focus:border-secondary-500">
                        <option selected disabled hidden value>Assess the threat</option>
                        <option>❓ Unknown threat</option>
                        <option>🟢 Low Threat</option>
                        <option>🟡 Medium threat</option>
                        <option>🔴 High threat</option>
                    </select>
                </div>
            </div>

            <div class="mt-5 lg:mt-0 lg:w-[48%]">
                <div class="flex items-center">
                    <label class="text-sm font-semibold">Remarks</label>
                    <img
                        src="/icons/info-icon.svg"
                        alt="Info label"
                        class="ml-2 h-4 w-4 cursor-help"
                        title="Any information that the rescue team should be aware of"
                    />
                </div>
                <div class="mt-2">
                    <textarea
                        class="w-full focus:ring-secondary-500 focus:border-secondary-500"
                        rows="1"
                    />
                </div>
            </div>
        </div>

        <input
            type="submit"
            value="Report Emergency"
            class="w-full cursor-pointer lg:w-fit my-10 lg:mt-[5.5rem] lg:mb-0 bg-primary-900 text-gray-50 px-6 py-3 font-medium"
        />
    </form>
</template>

<style scoped></style>
