<script setup lang="ts">
import type { CreateEmergencyRequest } from "@medrunner/api-client";
import { ThreatLevel } from "@medrunner/api-client";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import UnlinkedUserCTA from "@/components/Dashboard/UnlinkedUserCTA.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
import GlobalTextInput from "@/components/utils/GlobalTextInput.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useLogicStore } from "@/stores/logicStore.ts";
import { useUserStore } from "@/stores/userStore";
import { getSelectableAlertLocations } from "@/utils/functions/locationFunctions.ts";
import { errorString } from "@/utils/functions/stringFunctions.ts";

const emergencyStore = useEmergencyStore();
const userStore = useUserStore();
const logicStore = useLogicStore();
const { t } = useI18n();

const formSubmittingEmergency = ref(false);
const formErrorMessage = ref("");
const inputLocationId = ref("");
const inputThreatLevel = ref("");
const inputRSIHandle = ref("");

const isEmergenciesDisabled = computed(() => {
    if (!logicStore.medrunnerSettings)
        return true;

    if (!userStore.user.rsiHandle) {
        return (
            !logicStore.medrunnerSettings.anonymousAlertsEnabled
            || !logicStore.medrunnerSettings.emergenciesEnabled
            || !userStore.user.allowAnonymousAlert
        );
    }
    else {
        return !logicStore.medrunnerSettings.emergenciesEnabled;
    }
});

const selectableLocations = computed(() => {
    const locations = logicStore.medrunnerSettings?.locationSettings.locations ?? [];

    return [
        { value: "", label: t("form_selectAMoon"), hidden: true },
        ...getSelectableAlertLocations(locations).map(option => ({
            value: option.id,
            label: option.label,
        })),
    ];
});

async function submitEmergency() {
    if (!inputLocationId.value || !inputThreatLevel.value) {
        formErrorMessage.value = t("error_missingFields");
        return;
    }
    try {
        formSubmittingEmergency.value = true;

        const payload: CreateEmergencyRequest = {
            locationId: inputLocationId.value,
            threatLevel: Number.parseInt(inputThreatLevel.value),
            rsiHandle: inputRSIHandle.value || null,
        };

        const response = await emergencyStore.createEmergency(payload);

        userStore.user.activeEmergency = response.id;

        formSubmittingEmergency.value = false;
        inputLocationId.value = "";
        inputThreatLevel.value = "";
    }
    catch (error: any) {
        formSubmittingEmergency.value = false;
        formErrorMessage.value = errorString(error.statusCode);
    }
}
</script>

<template>
    <div>
        <div class="min-h-11">
            <h2 class="font-Mohave text-2xl font-semibold uppercase">
                {{ t("home_emergency") }}
            </h2>
        </div>

        <UnlinkedUserCTA v-if="!userStore.user.rsiHandle" class="mt-4" />

        <form
            v-if="
                (logicStore.medrunnerSettings && logicStore.medrunnerSettings.anonymousAlertsEnabled && userStore.user.allowAnonymousAlert)
                    || userStore.user.rsiHandle
            "
            :class="userStore.user.rsiHandle ? 'mt-4' : 'mt-8'"
            @submit.prevent="submitEmergency()"
        >
            <GlobalTextInput
                v-if="!userStore.user.rsiHandle"
                v-model="inputRSIHandle"
                class="
                    mb-4 w-full
                    lg:mb-8
                "
                :required="true"
                :disabled="isEmergenciesDisabled"
                :label="t('user_RSIHandle')"
                :placeholder="t('user_rsiHandlePlaceholder')"
                :helper="t('user_rsiHandleHelper')"
            />

            <div
                class="
                    grid grid-cols-1 gap-4
                    lg:grid-cols-2 lg:flex-row lg:gap-8
                "
            >
                <GlobalSelectInput
                    v-model="inputLocationId"
                    class="w-full"
                    :options="selectableLocations"
                    :required="true"
                    :disabled="selectableLocations.length === 1 || isEmergenciesDisabled"
                    :label="t('history_location')"
                    :helper="t('form_helpMoon')"
                />

                <GlobalSelectInput
                    v-model="inputThreatLevel"
                    class="w-full"
                    :disabled="isEmergenciesDisabled"
                    :options="[
                        { value: '', label: t('form_assessTheThreat'), hidden: true },
                        { value: ThreatLevel.UNKNOWN.toString(), label: t('form_unknownThreat') },
                        { value: ThreatLevel.LOW.toString(), label: t('form_lowThreat') },
                        { value: ThreatLevel.MEDIUM.toString(), label: t('form_mediumThreat') },
                        { value: ThreatLevel.HIGH.toString(), label: t('form_highThreat') },
                    ]"
                    :required="true"
                    :label="t('form_threatLevel')"
                    :helper="t('form_helpThreatLevel')"
                />
            </div>

            <p
                class="
                    mt-6 rounded-lg bg-gray-100 p-4 text-sm text-gray-500
                    dark:bg-gray-700 dark:text-gray-400
                "
            >
                {{ t("emergency_termsOfService").split("~")[0] }}
                <a
                    class="
                        text-gray-900 underline underline-offset-2
                        dark:text-gray-100
                    "
                    href="https://www.medrunner.space/terms-of-service"
                    target="_blank"
                >{{ t("login_termsOfService").split("~")[1] }}.</a>
            </p>

            <GlobalButton
                class="
                    mt-8 w-full
                    lg:w-fit
                "
                :submit="true"
                size="full"
                :disabled="isEmergenciesDisabled"
                :loading="formSubmittingEmergency"
            >
                {{ t("form_reportEmergency") }}
            </GlobalButton>
        </form>
        <GlobalErrorText v-if="formErrorMessage" :text="formErrorMessage" :icon="false" class="mt-2 text-sm font-semibold" />
    </div>
</template>

<style scoped></style>
