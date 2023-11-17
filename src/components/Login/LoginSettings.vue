<script setup lang="ts">
import { useI18n } from "vue-i18n";

import UserSettings from "@/components/Profile/UserSettings.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalRangeSlider from "@/components/utils/GlobalRangeSlider.vue";
import GlobalToggle from "@/components/utils/GlobalToggle.vue";
import { useLogicStore } from "@/stores/logicStore";

const logicStore = useLogicStore();
const { t } = useI18n();
</script>

<template>
    <div>
        <UserSettings class="mt-6" />
        <div class="my-6 border border-gray-100"></div>
        <div>
            <GlobalToggle
                @input-click="logicStore.updateLoginAnimation()"
                v-model="logicStore.isLoginAnimationAllowed"
                :helper="t('login_helperSettingAnimation')"
                side="right"
                >{{ t("login_settingAnimation") }}
            </GlobalToggle>
            <GlobalRangeSlider
                @input-click="() => logicStore.saveAnimationSetting('loginAnimationSpeed', logicStore.loginAnimationSpeed)"
                v-model="logicStore.loginAnimationSpeed"
                class="mt-4"
                :min="0"
                :max="100"
                >{{ t("login_settingAnimationSpeed") }}
            </GlobalRangeSlider>
            <GlobalRangeSlider
                @input-click="() => logicStore.saveAnimationSetting('loginAnimationStarSize', logicStore.loginAnimationStarSize)"
                v-model="logicStore.loginAnimationStarSize"
                class="mt-4"
                :min="0"
                :max="100"
                >{{ t("login_settingAnimationStarSize") }}
            </GlobalRangeSlider>
            <GlobalRangeSlider
                @input-click="() => logicStore.saveAnimationSetting('loginAnimationGlowSize', logicStore.loginAnimationGlowSize)"
                v-model="logicStore.loginAnimationGlowSize"
                class="mt-4"
                :min="0"
                :max="100"
                >{{ t("login_settingAnimationStarGlow") }}
            </GlobalRangeSlider>
            <GlobalButton class="mt-6" type="outline" @click="logicStore.resetAnimationSettings()">{{ t("login_settingReset") }} </GlobalButton>
        </div>
    </div>
</template>

<style scoped></style>
