<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";

import Navbar from "@/components/Navbar.vue";

const route = useRoute();
</script>

<template>
    <Navbar v-if="route.name !== 'login' && route.name !== 'loginLink'"></Navbar>
    <RouterView
        :class="{ 'my-14 lg:my-36': route.name !== 'login' && route.name !== 'loginLink' }"
    />
</template>

<style scoped></style>
