<script setup lang="ts">
import DesktopInnerNavbar from "@/components/Navbar/DesktopInnerNavbar.vue";
import MobileInnerNavbar from "@/components/Navbar/MobileInnerNavbar.vue";
</script>

<template>
    <nav class="bg-white shadow-md dark:bg-gray-800 dark:shadow-gray-900">
        <div class="mx-auto font-medium">
            <DesktopInnerNavbar class="hidden lg:flex" />
            <MobileInnerNavbar class="block lg:hidden" />
        </div>
    </nav>
</template>

<style>
@reference "@/assets/main.css";

.router-link-active {
    @apply underline decoration-2 underline-offset-4;
}
</style>
