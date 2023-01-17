<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView, useRoute } from "vue-router";

import {useUserStore} from "@/stores/userStore";
import Navbar from "@/components/Navbar.vue";

const userStore = useUserStore()
const route = useRoute()

// onMounted(() => {
//     userStore.getUser()
// })
</script>

<template>
    <Navbar v-if="route.name !== 'login'"></Navbar>
    <RouterView class="pt-14 md:pt-0" />
</template>

<style scoped></style>
