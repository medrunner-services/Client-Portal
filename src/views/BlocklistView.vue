<script setup lang="ts">
import BlocklistCard from "@/components/BlocklistCard.vue";
import BlocklistForm from "@/components/BlocklistForm.vue";
</script>

<template>
    <div class="content-container flex flex-col items-center">
        <h1 class="text-center text-3xl lg:text-4xl font-Mohave font-semibold uppercase">
            Medrunner Blocklist
        </h1>

        <BlocklistForm />
        <BlocklistCard />
    </div>
</template>

<style scoped></style>
