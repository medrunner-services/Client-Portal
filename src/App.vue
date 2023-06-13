<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";

import Loader from "@/components/Loader.vue";
import Navbar from "@/components/Navbar.vue";
import { useLogicStore } from "@/stores/logicStore";

const route = useRoute();
const logicStore = useLogicStore();
</script>

<template>
    <Navbar v-if="route.name !== 'login' && route.name !== 'loginLink' && route.name !== 'auth'" />

    <Loader v-if="logicStore.isRouterLoading" class="flex h-[90vh] w-full items-center justify-center" />
    <RouterView v-else :class="{ 'my-14 lg:my-20': route.name !== 'login' && route.name !== 'loginLink' }" />
</template>

<style scoped></style>
