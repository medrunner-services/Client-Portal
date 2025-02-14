<script setup lang="ts">
import type { CreateEmergencyRequest, Location, SpaceLocation } from "@medrunner/api-client";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import UnlinkedUserCTA from "@/components/Dashboard/UnlinkedUserCTA.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
import GlobalTextInput from "@/components/utils/GlobalTextInput.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useLogicStore } from "@/stores/logicStore.ts";
import { useUserStore } from "@/stores/userStore";
import { errorString } from "@/utils/functions/stringFunctions.ts";

const emergencyStore = useEmergencyStore();
const userStore = useUserStore();
const logicStore = useLogicStore();
const { t } = useI18n();

const formSubmittingEmergency = ref(false);
const formErrorMessage = ref("");
const inputSystem = ref("");
const inputPlanet = ref("");
const inputLocation = ref("");
const inputThreatLevel = ref("");
const inputRSIHandle = ref("");
const locationsInformation = ref<SpaceLocation[]>([]);

onMounted(async () => {
    if (logicStore.medrunnerSettings) locationsInformation.value = logicStore.medrunnerSettings.locationSettings.locations;

    if (getSystem.value.length === 2) inputSystem.value = getSystem.value[1].value;
    if (getPlanets.value.length === 2) inputPlanet.value = getPlanets.value[1].value;
});

const isEmergenciesDisabled = computed(() => {
    if (!logicStore.medrunnerSettings) return true;

    if (!userStore.user.rsiHandle)
        return (
            !logicStore.medrunnerSettings.anonymousAlertsEnabled ||
            !logicStore.medrunnerSettings.emergenciesEnabled ||
            !userStore.user.allowAnonymousAlert
        );
    else return !logicStore.medrunnerSettings.emergenciesEnabled;
});

const getSystem = computed(() => {
    const systems: any = [{ value: "", label: t("form_selectSystem"), hidden: true }];

    if (locationsInformation.value.length !== 0) {
        locationsInformation.value
            .filter((location) => location.enabled)
            .forEach((system) => {
                systems.push({
                    value: system.name,
                });
            });
    }

    return systems;
});

const getPlanets = computed(() => {
    const planets: any = [{ value: "", label: t("form_selectAPlanet"), hidden: true }];

    if (inputSystem.value) {
        const indexSystem = locationsInformation.value
            .filter((location) => location.enabled)
            .findIndex((system) => system.name === inputSystem.value);

        if (indexSystem !== -1) {
            locationsInformation.value[indexSystem].children
                .filter((location) => location.enabled)
                .forEach((planet) => {
                    planets.push({
                        value: planet.name,
                    });
                });
        }
    }

    return planets;
});

const getLocations = computed(() => {
    const locations: any = [{ value: "", label: t("form_selectAMoon") }];

    if (inputPlanet.value && inputSystem.value) {
        const indexSystem = locationsInformation.value
            .filter((location) => location.enabled)
            .findIndex((system) => system.name === inputSystem.value);
        if (indexSystem === -1) return locations;

        const indexPlanet = locationsInformation.value[indexSystem].children
            .filter((location) => location.enabled)
            .findIndex((planet) => planet.name === inputPlanet.value);

        if (indexPlanet !== -1) {
            locationsInformation.value[indexSystem].children[indexPlanet].children
                .filter((location) => location.enabled)
                .forEach((location) => {
                    locations.push({
                        value: location.name,
                    });
                });
        }
    }

    return locations;
});

async function submitEmergency() {
    if (!inputSystem.value || !inputPlanet.value || !inputThreatLevel.value) {
        formErrorMessage.value = t("error_missingFields");
        return;
    }
    try {
        formSubmittingEmergency.value = true;

        const formLocation: Location = {
            system: inputSystem.value,
            subsystem: inputPlanet.value,
            tertiaryLocation: inputLocation.value,
        };
        if (formLocation.tertiaryLocation === "") delete formLocation.tertiaryLocation;

        const payload: CreateEmergencyRequest = {
            location: formLocation,
            threatLevel: parseInt(inputThreatLevel.value),
        };
        if (inputRSIHandle.value) payload.rsiHandle = inputRSIHandle.value;

        const response = await emergencyStore.createEmergency(payload);

        userStore.user.activeEmergency = response.id;

        formSubmittingEmergency.value = false;
        inputSystem.value = "Stanton";
        inputPlanet.value = "";
        inputLocation.value = "";
        inputThreatLevel.value = "";
    } catch (error: any) {
        formSubmittingEmergency.value = false;
        formErrorMessage.value = errorString(error.statusCode);
    }
}

function clearPlanetsLocations(planets: boolean, locations: boolean) {
    if (planets) inputPlanet.value = "";
    if (locations) inputLocation.value = "";
}
</script>

<template>
    <div>
        <div class="min-h-11">
            <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("home_emergency") }}</h2>
        </div>

        <UnlinkedUserCTA v-if="!userStore.user.rsiHandle" class="mt-4" />

        <form
            v-if="
                (logicStore.medrunnerSettings && logicStore.medrunnerSettings.anonymousAlertsEnabled && userStore.user.allowAnonymousAlert) ||
                userStore.user.rsiHandle
            "
            :class="userStore.user.rsiHandle ? 'mt-4' : 'mt-8'"
            @submit.prevent="submitEmergency()"
        >
            <GlobalTextInput
                v-if="!userStore.user.rsiHandle"
                v-model="inputRSIHandle"
                class="mb-4 w-full lg:mb-8"
                :required="true"
                :disabled="isEmergenciesDisabled"
                :label="t('user_RSIHandle')"
                :placeholder="t('user_rsiHandlePlaceholder')"
                :helper="t('user_rsiHandleHelper')"
            />

            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:flex-row lg:gap-8">
                <GlobalSelectInput
                    v-model="inputSystem"
                    class="w-full"
                    :options="getSystem"
                    :required="true"
                    :disabled="getSystem.length <= 2 || isEmergenciesDisabled"
                    :label="t('form_system')"
                    :helper="t('form_helpSystem')"
                    @change="clearPlanetsLocations(true, true)"
                />

                <GlobalSelectInput
                    v-model="inputPlanet"
                    class="w-full"
                    :options="getPlanets"
                    :required="true"
                    :disabled="!inputSystem || getPlanets.length <= 2 || isEmergenciesDisabled"
                    :label="t('form_subSystem')"
                    :helper="t('form_helpSubSystem')"
                    @change="clearPlanetsLocations(false, true)"
                />

                <GlobalSelectInput
                    v-model="inputLocation"
                    class="w-full"
                    :options="getLocations"
                    :disabled="!inputPlanet || getLocations.length === 1 || isEmergenciesDisabled"
                    :label="t('form_moon')"
                    :helper="t('form_helpMoon')"
                />

                <GlobalSelectInput
                    v-model="inputThreatLevel"
                    class="w-full"
                    :disabled="isEmergenciesDisabled"
                    :options="[
                        { value: '', label: t('form_assessTheThreat'), hidden: true },
                        { value: '0', label: t('form_unknownThreat') },
                        { value: '1', label: t('form_lowThreat') },
                        { value: '2', label: t('form_mediumThreat') },
                        { value: '3', label: t('form_highThreat') },
                    ]"
                    :required="true"
                    :label="t('form_threatLevel')"
                    :helper="t('form_helpThreatLevel')"
                />
            </div>

            <p class="mt-6 rounded-lg bg-gray-100 p-4 text-sm text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                {{ t("emergency_termsOfService").split("~")[0] }}
                <a
                    class="text-gray-900 underline underline-offset-2 dark:text-gray-100"
                    href="https://www.medrunner.space/terms-of-service"
                    target="_blank"
                    >{{ t("login_termsOfService").split("~")[1] }}.</a
                >
            </p>

            <GlobalButton
                class="mt-8 w-full lg:w-fit"
                :submit="true"
                size="full"
                :disabled="isEmergenciesDisabled"
                :error-text="formErrorMessage"
                :loading="formSubmittingEmergency"
                >{{ t("form_reportEmergency") }}</GlobalButton
            >
        </form>
    </div>
</template>

<style scoped></style>
