<script setup lang="ts">
import { ref } from "vue";

const searchType = ref("");
const formName = ref("");
const formErrorMessage = ref("");
const formSubmittingSearch = ref(false);

function searchBlocklist() {
    formSubmittingSearch.value = true;
    console.log("⌛ Searching...");
}
</script>

<template>
    <div class="content-container">
        <h1 class="text-center text-3xl lg:text-4xl font-Mohave font-semibold uppercase">
            Medrunner Blacklist
        </h1>

        <form
            @submit.prevent="searchBlocklist()"
            class="lg:flex lg:w-full lg:justify-between mt-14"
        >
            <div class="flex lg:flex-grow lg:mr-8">
                <select
                    class="focus:ring-secondary-500 focus:border-secondary-500 border-r-0"
                    v-model="searchType"
                    required
                    :disabled="formSubmittingSearch"
                >
                    <option disabled hidden value class="text-gray-400"></option>
                    <option value="user">User</option>
                    <option value="org">Org</option>
                </select>

                <input
                    type="text"
                    v-model="formName"
                    class="w-full"
                    :class="formErrorMessage ? 'input-text-error' : 'input-text'"
                    :disabled="formSubmittingSearch"
                    placeholder="Star Citizen username or Organization name"
                    required
                />
            </div>

            <button
                type="submit"
                class="w-full lg:w-fit my-4 lg:my-0 bg-primary-900 text-gray-50 px-6 py-3 font-medium flex items-center justify-center"
                :disabled="formSubmittingSearch"
            >
                <svg
                    v-if="formSubmittingSearch"
                    class="animate-spin h-5 w-5 text-white mx-14 my-0.5"
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
                <span v-else>Search</span>
            </button>
            <p v-if="formErrorMessage" class="mt-2 text-primary-400 text-sm w-full">
                {{ formErrorMessage }}
            </p>
        </form>
    </div>
</template>

<style scoped></style>
