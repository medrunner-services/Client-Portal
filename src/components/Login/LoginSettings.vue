<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { LocalStorageItems } from "@/@types/types.ts";
import UserSettings from "@/components/Profile/UserSettings.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalRangeSlider from "@/components/utils/GlobalRangeSlider.vue";
import GlobalToggle from "@/components/utils/GlobalToggle.vue";
import { useLogicStore } from "@/stores/logicStore";

const logicStore = useLogicStore();
const { t } = useI18n();

function updateAnimationState(): void {
    if (logicStore.isLoginAnimationAllowed) {
        logicStore.isLoginAnimationAllowed = false;
        localStorage.setItem(LocalStorageItems.LOGIN_ANIMATION, "false");
    }
    else {
        logicStore.isLoginAnimationAllowed = true;
        localStorage.setItem(LocalStorageItems.LOGIN_ANIMATION, "true");
    }
}

function resetAnimationSettings(): void {
    logicStore.loginAnimationSpeed = 1;
    logicStore.loginAnimationStarSize = 2;
    logicStore.loginAnimationGlowSize = 2;
    logicStore.isLoginAnimationAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    localStorage.removeItem(LocalStorageItems.LOGIN_ANIMATION_SPEED);
    localStorage.removeItem(LocalStorageItems.LOGIN_ANIMATION_STAR_SIZE);
    localStorage.removeItem(LocalStorageItems.LOGIN_ANIMATION_GLOW_SIZE);
    localStorage.removeItem(LocalStorageItems.LOGIN_ANIMATION);
}

function saveAnimationSetting(setting: string, value: number): void {
    localStorage.setItem(setting, value.toString());
}
</script>

<template>
    <div>
        <UserSettings class="mt-6" />
        <div class="my-6 border border-gray-100" />
        <div>
            <GlobalToggle
                v-model="logicStore.isLoginAnimationAllowed"
                :helper="t('login_helperSettingAnimation')"
                side="right"
                @input-click="updateAnimationState()"
            >
                {{ t("login_settingAnimation") }}
            </GlobalToggle>
            <GlobalRangeSlider
                v-model="logicStore.loginAnimationSpeed"
                class="mt-4"
                :min="0"
                :max="100"
                @input-click="() => saveAnimationSetting('loginAnimationSpeed', logicStore.loginAnimationSpeed)"
            >
                {{ t("login_settingAnimationSpeed") }}
            </GlobalRangeSlider>
            <GlobalRangeSlider
                v-model="logicStore.loginAnimationStarSize"
                class="mt-4"
                :min="0"
                :max="100"
                @input-click="() => saveAnimationSetting('loginAnimationStarSize', logicStore.loginAnimationStarSize)"
            >
                {{ t("login_settingAnimationStarSize") }}
            </GlobalRangeSlider>
            <GlobalRangeSlider
                v-model="logicStore.loginAnimationGlowSize"
                class="mt-4"
                :min="0"
                :max="100"
                @input-click="() => saveAnimationSetting('loginAnimationGlowSize', logicStore.loginAnimationGlowSize)"
            >
                {{ t("login_settingAnimationStarGlow") }}
            </GlobalRangeSlider>
            <GlobalButton class="mt-6" type="outline-solid" @click="resetAnimationSettings()">
                {{ t("login_settingReset") }}
            </GlobalButton>
        </div>
    </div>
</template>

<style scoped></style>
