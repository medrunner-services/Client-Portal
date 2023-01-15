<script setup lang="ts"></script>

<template>
    <div class="w-100 py-6 px-20 flex items-center gap-2 shadow-md">
        <img class="h-14" src="/medrunner-logo.webp" alt="Medrunner Logo" />

        <h1 class="text-primary-900 font-Mohave font-bold text-header-1">
            MEDRUNNER
        </h1>

        <nav class="flex gap-8 ml-auto font-Mohave text-header-2 font-semibold">
            <RouterLink to="/">HOME</RouterLink>
            <RouterLink to="/">EMERGENCY</RouterLink>
            <RouterLink class="ml-4" to="/"
                ><img src="/user-profile.svg" alt="User profile"
            /></RouterLink>
        </nav>
    </div>
</template>
