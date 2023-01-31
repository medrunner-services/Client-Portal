<script setup lang="ts">
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
</script>

<template>
    <main>
        <h1
            @click="userStore.disconnectUser()"
            class="text-3xl font-bold underline"
        >
            Welcome to the Medrunner Portal
        </h1>
    </main>
</template>
