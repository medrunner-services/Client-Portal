<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute()
</script>

<template>
    <div class="pt-0 h-screen flex justify-center">
        <div class="w-[55%] justify-center items-center bg-[url('/background-login.webp')] bg-center bg-cover hidden md:flex"></div>
        <div class="flex flex-col justify-center items-center h-full md:w-[45%]">
            <h1 class="title">Welcome to the</h1>
            <div class="flex items-center">
                <img class="h-12 mr-2" src="/medrunner-logo.webp" alt="Medrunner Logo" />
                <h1 class="title"><span class="text-primary-900">Medrunner</span> Portal</h1>
            </div>

            <div v-if="route.path === '/login/link'" class="flex flex-col mt-14">
                SC username...
            </div>
            <div v-else class="flex flex-col mt-14">
                <button class="button-primary button-48">Login with Discord</button>
                <button class="button-secondary button-48 mt-5">Register with Discord</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.title{
    @apply uppercase text-neutral-900 text-title font-Mohave font-bold
}
</style>
