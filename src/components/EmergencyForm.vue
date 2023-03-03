<script setup lang="ts">
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
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
                    :value="userStore.user.rsiHandle"
                    class="disabled:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
                    disabled
                />
                <button
                    class="border-2 border-primary-900 font-Inter font-bold flex-grow lg:px-3 ml-3"
                >
                    Edit
                </button>
            </div>
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
                    <textarea class="w-full focus:ring-secondary-500 focus:border-secondary-500" />
                </div>
            </div>
        </div>

        <input
            type="submit"
            value="Report Emergency"
            class="w-full cursor-pointer lg:w-fit my-10 lg:mt-16 lg:mb-0 bg-primary-900 text-gray-50 px-6 py-3 font-medium"
        />
    </form>
</template>

<style scoped></style>
