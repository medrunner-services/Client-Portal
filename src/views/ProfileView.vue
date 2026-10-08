<script setup lang="ts">
import ChangelogRecap from "@/components/Profile/ChangelogRecap.vue";
import CodesManagement from "@/components/Profile/CodesManagement.vue";
import TokenManagement from "@/components/Profile/TokenManagement.vue";
import UserAccount from "@/components/Profile/UserAccount.vue";
import UserSettings from "@/components/Profile/UserSettings.vue";
</script>

<template>
    <div
        class="
            content-container flex flex-col gap-10
            xl:flex-row
        "
    >
        <div class="xl:w-1/2">
            <UserSettings />

            <ChangelogRecap class="mt-10" />
        </div>

        <div class="xl:w-1/2">
            <UserAccount />

            <CodesManagement class="mt-10" />

            <TokenManagement class="mt-10" />
        </div>
    </div>
</template>
