<script setup lang="ts">
import LoginAnimation from "@/components/Login/LoginAnimation.vue";
import CodeRedeemModal from "@/components/Modals/CodeRedeemModal.vue";
import { useLogicStore } from "@/stores/logicStore";

const logicStore = useLogicStore();
</script>

<template>
    <div id="animation-bg" class="flex h-screen justify-center">
        <LoginAnimation
            class="hidden md:block"
            :animation-status="logicStore.isLoginAnimationAllowed"
            :speed="logicStore.isLoginAnimationAllowed ? logicStore.loginAnimationSpeed : 0"
            :glow-size="logicStore.loginAnimationGlowSize"
            :star-size="logicStore.loginAnimationStarSize"
        />

        <CodeRedeemModal :can-close-modal="false" />
    </div>
</template>
