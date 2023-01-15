<script setup lang="ts">
import { RouterView } from "vue-router";
import Navbar from "@/components/Navbar.vue";
</script>

<template>
    <Navbar></Navbar>
    <RouterView class="pt-14 md:pt-0" />
</template>

<style scoped></style>
