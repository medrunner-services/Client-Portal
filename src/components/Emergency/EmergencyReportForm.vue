<script setup lang="ts">
import type { Location, LocationDetail } from "@medrunner/api-client";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useUserStore } from "@/stores/userStore";
import { errorString } from "@/utils/stringUtils";

const emergencyStore = useEmergencyStore();
const userStore = useUserStore();
const { t } = useI18n();

const formSubmittingEmergency = ref(false);
const formErrorMessage = ref("");
const inputSystem = ref("");
const inputPlanet = ref("");
const inputLocation = ref("");
const inputThreatLevel = ref("");
const locationsInformation = ref<LocationDetail[]>([]);

onMounted(async () => {
    locationsInformation.value = await emergencyStore.fetchMetaLocations();

    if (getSystem.value.length === 2) inputSystem.value = getSystem.value[1].value;
    if (getPlanets.value.length === 2) inputPlanet.value = getPlanets.value[1].value;
});

const getSystem = computed(() => {
    const systems: any = [{ value: "", label: t("form_selectSystem"), hidden: true }];

    if (locationsInformation.value.length !== 0) {
        locationsInformation.value.forEach((system) => {
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
        const indexSystem = locationsInformation.value.findIndex((system) => system.name === inputSystem.value);

        if (indexSystem !== -1) {
            locationsInformation.value[indexSystem].children.forEach((planet) => {
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
        const indexSystem = locationsInformation.value.findIndex((system) => system.name === inputSystem.value);
        if (indexSystem === -1) return locations;

        const indexPlanet = locationsInformation.value[indexSystem].children.findIndex((planet) => planet.name === inputPlanet.value);

        if (indexPlanet !== -1) {
            locationsInformation.value[indexSystem].children[indexPlanet].children.forEach((location) => {
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

        const response = await emergencyStore.createEmergency({
            location: formLocation,
            threatLevel: parseInt(inputThreatLevel.value),
        });

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

        <form class="mt-8" @submit.prevent="submitEmergency()">
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:flex-row lg:gap-8">
                <GlobalSelectInput
                    v-model="inputSystem"
                    class="w-full"
                    :options="getSystem"
                    :required="true"
                    :disabled="getSystem.length <= 2"
                    :label="t('form_system')"
                    :helper="t('form_helpSystem')"
                    @change="clearPlanetsLocations(true, true)"
                />

                <GlobalSelectInput
                    v-model="inputPlanet"
                    class="w-full"
                    :options="getPlanets"
                    :required="true"
                    :disabled="!inputSystem || getPlanets.length <= 2"
                    :label="t('form_subSystem')"
                    :helper="t('form_helpSubSystem')"
                    @change="clearPlanetsLocations(false, true)"
                />

                <GlobalSelectInput
                    v-model="inputLocation"
                    class="w-full"
                    :options="getLocations"
                    :disabled="!inputPlanet || getLocations.length === 1"
                    :label="t('form_moon')"
                    :helper="t('form_helpMoon')"
                />

                <GlobalSelectInput
                    v-model="inputThreatLevel"
                    class="w-full"
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

            <GlobalButton class="mt-8" :submit="true" :error-text="formErrorMessage" :loading="formSubmittingEmergency">{{
                t("form_reportEmergency")
            }}</GlobalButton>
        </form>
    </div>
</template>

<style scoped></style>
