<script setup lang="ts">
import type { Location, LocationDetail } from "@medrunner-services/api-client";
import { computed, onMounted, type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useUserStore } from "@/stores/userStore";

const emergencyStore = useEmergencyStore();
const userStore = useUserStore();
const { t } = useI18n();

const formSubmittingEmergency = ref(false);
const formErrorMessage = ref("");
const inputSystem = ref("");
const inputPlanet = ref("");
const inputLocation = ref("");
const inputThreatLevel = ref("");
const locationsInformation: Ref<LocationDetail[]> = ref([]);

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
    const locations: any = [{ value: "", label: t("form_selectALocation") }];

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

        await emergencyStore.sendEmergencyMessage({
            emergencyId: response.id,
            contents: "This emergency was submitted via the __**Client Portal**__",
        });

        formSubmittingEmergency.value = false;
        inputSystem.value = "Stanton";
        inputPlanet.value = "";
        inputLocation.value = "";
        inputThreatLevel.value = "";
    } catch (error: any) {
        formSubmittingEmergency.value = false;
        if (error.statusCode === 403) formErrorMessage.value = t("error_blockedUser");
        if (error.statusCode === 429) formErrorMessage.value = t("error_rateLimit");
        else formErrorMessage.value = t("error_generic");
    }
}

function clearPlanetsLocations(planets: boolean, locations: boolean) {
    if (planets) inputPlanet.value = "";
    if (locations) inputLocation.value = "";
}
</script>

<template>
    <div>
        <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("home_emergency") }}</h2>

        <form class="mt-8" @submit.prevent="submitEmergency()">
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:flex-row lg:gap-8">
                <GlobalSelectInput
                    class="w-full"
                    :options="getSystem"
                    :required="true"
                    :disabled="getSystem.length <= 2"
                    v-model="inputSystem"
                    @change="clearPlanetsLocations(true, true)"
                    :label="t('form_system')"
                    :helper="t('form_helpSystem')"
                />

                <GlobalSelectInput
                    class="w-full"
                    :options="getPlanets"
                    :required="true"
                    v-model="inputPlanet"
                    @change="clearPlanetsLocations(false, true)"
                    :disabled="!inputSystem || getPlanets.length <= 2"
                    :label="t('form_subSystem')"
                    :helper="t('form_helpSubSystem')"
                />

                <GlobalSelectInput
                    class="w-full"
                    :options="getLocations"
                    v-model="inputLocation"
                    :disabled="!inputPlanet || getLocations.length === 1"
                    :label="t('form_location')"
                    :helper="t('form_helpLocation')"
                />

                <GlobalSelectInput
                    class="w-full"
                    :options="[
                        { value: '', label: t('form_assessTheThreat'), hidden: true },
                        { value: '0', label: t('form_unknownThreat') },
                        { value: '1', label: t('form_lowThreat') },
                        { value: '2', label: t('form_mediumThreat') },
                        { value: '3', label: t('form_highThreat') },
                    ]"
                    :required="true"
                    v-model="inputThreatLevel"
                    :label="t('form_threatLevel')"
                    :helper="t('form_helpThreatLevel')"
                />
            </div>

            <GlobalButton class="mt-8" :submit="true" :error-text="formErrorMessage" :loading="formSubmittingEmergency">{{
                t("form_reportEmergency")
            }}</GlobalButton>
        </form>
    </div>
</template>

<style scoped></style>