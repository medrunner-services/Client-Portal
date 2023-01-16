<script setup lang="ts">
import { watch, onMounted } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";

import {useUserStore} from "@/stores/userStore";
import Navbar from "@/components/Navbar.vue";

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

onMounted(() => {

})

watch(route, () => {
    if (userStore.isLoggedIn && route.path !== '/login') {
        router.push({name: 'login'})
    }
})
</script>

<template>
    <Navbar v-if="route.name !== 'login'"></Navbar>
    <RouterView class="pt-14 md:pt-0" />
</template>

<style scoped></style>
