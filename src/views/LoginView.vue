<script setup lang="ts">
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import { ref } from "vue";

const userStore = useUserStore();
const route = useRoute();

let formUsername = ref("");
const waitingForApi = ref(false);
const errorAlert = ref(false);

if (route.query.error) errorAlert.value = true;

const submittingLinkForm = () => {
    waitingForApi.value = true;
    errorAlert.value = false;
    userStore.linkUser(formUsername.value).then(res => {
        if (res === "error") {
            waitingForApi.value = false;
            errorAlert.value = true;
        }
    });
};
</script>

<template>
    <div class="pt-0 h-screen flex justify-center">
        <div
            v-if="errorAlert"
            class="absolute z-10 top-14 lg:top-10 bg-primary-100 font-Mohave font-bold py-4 px-8 border-2 border-primary-900"
        >
            <p>Something went wrong, please try again</p>
        </div>
        <div
            class="w-[55%] justify-center items-center bg-[url('/background-login.webp')] bg-center bg-cover hidden md:flex"
        ></div>
        <div
            class="flex flex-col justify-center items-center h-full md:w-[45%]"
        >
            <h1 class="title">Welcome to the</h1>
            <div class="flex items-center">
                <img
                    class="h-12 mr-2"
                    src="/medrunner-logo.webp"
                    alt="Medrunner Logo"
                />
                <h1 class="title">
                    <span class="text-primary-900">Medrunner</span> Portal
                </h1>
            </div>

            <div
                v-if="route.path === '/login/link'"
                class="flex w-4/5 md:w-3/5 flex-col mt-20"
            >
                <form
                    class="flex flex-col w-full xl:flex-row xl:items-end xl:justify-between"
                    @submit.prevent="submittingLinkForm()"
                >
                    <div class="w-full">
                        <div class="flex items-center mb-2">
                            <label
                                for="rsiHandle"
                                class="text-small font-semibold font-Inter text-neutral-900"
                                >Star Citizen username</label
                            >
                            <img
                                src="/info-icon.svg"
                                alt="Info label"
                                class="ml-2 h-4 w-4"
                            />
                        </div>
                        <input
                            type="text"
                            v-model="formUsername"
                            name="rsiHandle"
                            id="rsiHandle"
                            class="input-text w-full"
                            placeholder="Your username..."
                        />
                    </div>
                    <button
                        class="button-primary font-Inter font-semibold text-small px-10 py-[11px] xl:ml-8 mt-8 xl:mt-0"
                    >
                        <svg
                            v-if="waitingForApi"
                            class="animate-spin text-white w-full"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
                            />
                        </svg>
                        <p v-else>Continue</p>
                    </button>
                </form>
            </div>
            <div v-else class="flex flex-col mt-14">
                <button
                    class="button-primary button-48"
                    @click="userStore.loginUser()"
                >
                    Login with Discord
                </button>
                <button
                    class="button-secondary button-48 mt-5"
                    @click="userStore.registerUser()"
                >
                    Register with Discord
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.title {
    @apply uppercase text-neutral-900 text-title font-Mohave font-bold;
}
</style>
