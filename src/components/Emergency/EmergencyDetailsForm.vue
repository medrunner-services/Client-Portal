<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import EmergencyRulesModal from "@/components/Modals/EmergencyRulesModal.vue";
import IgnoreEmergencyDetailsFormModal from "@/components/Modals/IgnoreEmergencyDetailsFormModal.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
import GlobalTextAreaInput from "@/components/utils/GlobalTextAreaInput.vue";
import GlobalTextBox from "@/components/utils/GlobalTextBox.vue";
import GlobalTextInput from "@/components/utils/GlobalTextInput.vue";
import { useAlertStore } from "@/stores/alertStore.ts";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useUserStore } from "@/stores/userStore";
import { AlertColors } from "@/types.ts";
import { errorString } from "@/utils/functions/stringFunctions.ts";

const { t } = useI18n();
const emergencyStore = useEmergencyStore();
const userStore = useUserStore();
const alertStore = useAlertStore();

const emit = defineEmits(["submittedDetails"]);

const currentFormPart = ref(1);
const displayIgnoreModal = ref(false);
const displayRulesModal = ref(false);

const inputSituation = ref("");
const inputExactLocation = ref("");
const inputInjury = ref("");
const inputCrimestat = ref("");
const inputLocationType = ref("");
const inputCrimestatDetails = ref("");
const inputDeathHours = ref<number | undefined>(undefined);
const inputDeathMinutes = ref<number | undefined>(undefined);
const inputShip = ref("");
const inputBeacon = ref<boolean | undefined>(undefined);
const inputBeaconPlayer = ref("");
const inputBeaconDistance = ref("");
const inputEnemies = ref<boolean | undefined>(undefined);
const inputEnemiesDetails = ref("");
const inputParty = ref<boolean | undefined>(undefined);
const inputPartyDetails = ref([""]);
const inputRemarks = ref("");
const formErrorMessage = ref("");
const submittingDetails = ref(false);

onMounted(() => {
    if (!userStore.syncedSettings.hideEmergencyRulesModal) displayRulesModal.value = true;
});

function confirmedRules(): void {
    displayRulesModal.value = false;
}

async function sendDetails(): Promise<void> {
    try {
        if (!emergencyStore.trackedEmergency) {
            alertStore.newAlert(AlertColors.RED, t("error_failedMessage"));
            return;
        }
        submittingDetails.value = true;
        await emergencyStore.sendEmergencyMessage({
            emergencyId: emergencyStore.trackedEmergency!.id,
            contents: `## Emergency details from Client\n\n
            _The client's situation is:_  **${inputSituation.value ? inputSituation.value : "Unknown"}**\n
            _The client type of location is:_  **${inputLocationType.value ? inputLocationType.value : "Unknown"}**\n
            _The client exact location is:_  **${inputExactLocation.value ? inputExactLocation.value : "Unknown"}**\n
            _Client ship:_  **${inputShip.value ? inputShip.value : "Unknown"}**\n
            _Client death:_  **${
                inputDeathHours.value || inputDeathMinutes.value
                    ? `<t:${Math.round(Date.now() / 1000) + (inputDeathHours.value ?? 0) * 3600 + (inputDeathMinutes.value ?? 0) * 60}:R>`
                    : "Unknown"
            }**\n
            _Is the client injured:_  **${inputInjury.value ? inputInjury.value : "Unknown"}**\n
            _Has the client sent an IG beacon?_  **${inputBeacon.value === true ? "Yes" : inputBeacon.value === false ? "No" : "Unknown"}**${
                inputBeaconPlayer.value ? `\n\nName: ${inputBeaconPlayer.value}` : ""
            }\n${inputBeaconDistance.value ? `Distance: ${inputBeaconDistance.value}` : ""}\n
            _Is the client in a team?_  **${inputParty.value === true ? "Yes" : inputParty.value === false ? "No" : "Unknown"}**${
                inputParty.value === true && inputPartyDetails.value ? `\n\n${inputPartyDetails.value.filter((str) => str !== "").join(", ")}` : ""
            }\n
            _Are there enemies nearby?_  **${inputEnemies.value === true ? "Yes" : inputEnemies.value === false ? "No" : "Unknown"}**${
                inputEnemiesDetails.value ? `\n\n${inputEnemiesDetails.value}` : ""
            }\n
            _Does the client have CrimeStat?_  **${inputCrimestat.value ? inputCrimestat.value : "Unknown"}**${
                inputCrimestatDetails.value ? `\n\n${inputCrimestatDetails.value}` : ""
            }\n
            _Remarks:_\n\n${inputRemarks.value ? inputRemarks.value : "None"}`,
        });

        currentFormPart.value = 1;
        formErrorMessage.value = "";

        inputSituation.value = "";
        inputExactLocation.value = "";
        inputInjury.value = "";
        inputBeacon.value = false;
        inputBeaconPlayer.value = "";
        inputBeaconDistance.value = "";
        inputParty.value = false;
        inputPartyDetails.value = [""];
        inputEnemies.value = false;
        inputEnemiesDetails.value = "";
        inputRemarks.value = "";
        inputDeathHours.value = undefined;
        inputDeathMinutes.value = undefined;
        inputCrimestat.value = "";
        inputCrimestatDetails.value = "";
        inputShip.value = "";
        inputLocationType.value = "";

        emit("submittedDetails");
    } catch (error: any) {
        formErrorMessage.value = errorString(error.statusCode);
    } finally {
        submittingDetails.value = false;
    }
}
</script>

<template>
    <div>
        <div class="flex min-h-11 items-center">
            <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("home_OngoingEmergency") }}</h2>
            <span class="relative mb-[0.35rem] ml-5 flex h-3 w-3">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-600 opacity-75"></span>
                <span class="relative inline-flex h-3 w-3 rounded-full bg-primary-600"></span>
            </span>
        </div>

        <GlobalCard class="mt-8">
            <p class="font-Mohave text-3xl font-bold text-primary-600 dark:text-red-700">
                {{ t("formDetailed_infoCardTitle") }}
            </p>

            <p class="mt-1 font-medium">
                {{ t("formDetailed_infoCardDescription") }}
            </p>
        </GlobalCard>

        <div class="mt-8">
            <ol class="mb-6 flex items-center text-center text-sm font-medium text-gray-500 dark:text-gray-400 sm:text-base lg:mb-8">
                <li
                    class="after:border-1 flex items-center after:mx-6 after:hidden after:h-1 after:w-12 after:border-b after:border-gray-200 dark:text-red-700 dark:after:border-gray-700 sm:after:inline-block sm:after:content-[''] xl:after:mx-10"
                >
                    <div
                        class="flex items-center text-primary-600 after:mx-2 after:font-light after:text-gray-200 after:content-['/'] dark:text-red-700 dark:after:text-gray-500 sm:block sm:after:hidden"
                    >
                        <svg
                            class="mr-2 h-4 w-4 sm:mx-auto sm:mb-2 sm:h-6 sm:w-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd"
                            ></path>
                        </svg>
                        {{ t("formDetailed_situation") }}
                    </div>
                </li>
                <li
                    class="after:border-1 flex items-center after:mx-6 after:hidden after:h-1 after:w-12 after:border-b after:border-gray-200 after:content-[''] dark:after:border-gray-700 sm:after:inline-block xl:after:mx-10"
                >
                    <div
                        class="flex items-center after:mx-2 after:font-light after:text-gray-200 after:content-['/'] dark:after:text-gray-500 sm:block sm:after:hidden"
                        :class="currentFormPart >= 2 ? 'text-primary-600 dark:text-red-700' : ''"
                    >
                        <svg
                            v-if="currentFormPart >= 2"
                            class="mr-2 h-4 w-4 sm:mx-auto sm:mb-2 sm:h-6 sm:w-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd"
                            ></path>
                        </svg>
                        <div v-else class="mr-2 sm:mx-auto sm:mb-2">2</div>
                        {{ t("formDetailed_players") }}
                    </div>
                </li>
                <li class="flex items-center sm:block" :class="currentFormPart >= 3 ? 'text-primary-600 dark:text-red-700' : ''">
                    <svg
                        v-if="currentFormPart >= 3"
                        class="mr-2 h-4 w-4 sm:mx-auto sm:mb-2 sm:h-6 sm:w-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                        ></path>
                    </svg>
                    <div v-else class="mr-2 sm:mx-auto sm:mb-2">3</div>
                    {{ t("formDetailed_remarks") }}
                </li>
            </ol>
        </div>

        <GlobalTextBox>{{ t("formDetailed_infoSpeakEnglish") }}</GlobalTextBox>

        <div v-if="currentFormPart === 1" class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:flex-row lg:gap-8">
            <GlobalSelectInput
                v-model="inputSituation"
                class="w-full"
                :options="[
                    { value: '', label: t('formDetailed_selectSituation'), hidden: true },
                    { value: 'Unconscious', label: t('formDetailed_situationUnconscious') },
                    { value: 'Out of fuel', label: t('formDetailed_situationFuel') },
                    { value: 'Stranded', label: t('formDetailed_situationStranded') },
                    { value: 'Other', label: t('formDetailed_situationOther') },
                ]"
                :label="t('formDetailed_situation')"
                :helper="t('formDetailed_helpSituation')"
            />

            <GlobalSelectInput
                v-model="inputInjury"
                class="w-full"
                :options="[
                    { value: '', label: t('formDetailed_selectSituation'), hidden: true },
                    { value: 'No', label: t('formDetailed_no') },
                    { value: 'Tier 1', label: `${t('formDetailed_injuryTier', { number: '1' })}` },
                    { value: 'Tier 2', label: `${t('formDetailed_injuryTier', { number: '2' })}` },
                    { value: 'Tier 3', label: `${t('formDetailed_injuryTier', { number: '3' })}` },
                ]"
                :label="t('formDetailed_injury')"
                :helper="t('formDetailed_helpInjury')"
            />

            <GlobalSelectInput
                v-model="inputLocationType"
                class="w-full"
                :options="[
                    { value: '', label: t('formDetailed_selectLocationType'), hidden: true },
                    { value: 'Bunker', label: t('formDetailed_locationTypeBunker') },
                    { value: 'Outpost', label: t('formDetailed_locationTypeOutpost') },
                    { value: 'Distribution Center', label: t('formDetailed_locationTypeDistributionCenter') },
                    { value: 'Contested Zones', label: t('formDetailed_locationTypeContestedZones') },
                    { value: 'Space', label: t('formDetailed_locationTypeSpace') },
                    { value: 'Surface', label: t('formDetailed_locationTypeSurface') },
                    { value: 'Other', label: t('formDetailed_locationTypeOther') },
                ]"
                :label="t('formDetailed_locationType')"
                :helper="t('formDetailed_helpLocationType')"
            />

            <GlobalTextInput
                v-model="inputExactLocation"
                class="w-full"
                :label="t('formDetailed_location')"
                :placeholder="t('formDetailed_placeholderLocation')"
                :helper="t('formDetailed_helpLocation')"
            />

            <div>
                <GlobalSelectInput
                    v-model="inputCrimestat"
                    class="w-full"
                    :options="[
                        { value: '', label: t('formDetailed_selectSituation'), hidden: true },
                        { value: 'No', label: t('formDetailed_no') },
                        { value: 'Level 1', label: `${t('formDetailed_level', { number: '1' })}` },
                        { value: 'Level 2', label: `${t('formDetailed_level', { number: '2' })}` },
                        { value: 'Level 3', label: `${t('formDetailed_level', { number: '3' })}` },
                        { value: 'Level 4', label: `${t('formDetailed_level', { number: '4' })}` },
                        { value: 'Level 5', label: `${t('formDetailed_level', { number: '5' })}` },
                    ]"
                    :label="t('formDetailed_crimestat')"
                    :helper="t('formDetailed_helpCrimestat')"
                />

                <GlobalTextInput
                    v-if="inputCrimestat && inputCrimestat !== 'No'"
                    v-model="inputCrimestatDetails"
                    class="mt-2 w-full"
                    :placeholder="t('formDetailed_placeholderCrimestat')"
                />
            </div>

            <GlobalTextInput
                v-model="inputShip"
                class="w-full"
                :label="t('formDetailed_ship')"
                :placeholder="t('formDetailed_placeholderShip')"
                :helper="t('formDetailed_helpShip')"
            />

            <div>
                <label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{{ t("formDetailed_death") }}</label>

                <div class="flex items-center justify-between">
                    <GlobalTextInput v-model="inputDeathHours" class="w-full" type="number" />
                    <p class="mx-4">{{ t("formDetailed_hours") }}</p>
                    <GlobalTextInput v-model="inputDeathMinutes" class="w-full" type="number" />
                    <p class="mx-4">{{ t("formDetailed_minutes") }}</p>
                </div>
            </div>
        </div>

        <div v-if="currentFormPart === 2" class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:flex-row lg:gap-8">
            <div>
                <GlobalSelectInput
                    v-model="inputBeacon"
                    class="w-full"
                    :options="[
                        { value: undefined, label: t('formDetailed_selectSituation'), hidden: true },
                        { value: true, label: t('formDetailed_yes') },
                        { value: false, label: t('formDetailed_no') },
                    ]"
                    :label="t('formDetailed_beacon')"
                    :helper="t('formDetailed_helpBeacon')"
                />
                <GlobalTextInput
                    v-if="inputBeacon"
                    v-model="inputBeaconPlayer"
                    class="mt-2 w-full"
                    :placeholder="t('formDetailed_placeholderBeaconPlayer')"
                />
                <GlobalTextInput
                    v-if="inputBeacon"
                    v-model="inputBeaconDistance"
                    class="mt-2 w-full"
                    :placeholder="t('formDetailed_placeholderBeaconDistance')"
                />
                <p v-if="inputBeacon" class="mt-2 text-sm font-medium text-primary-600 dark:text-red-700">
                    {{ t("formDetailed_beaconCancelMessage") }}
                </p>
            </div>

            <div>
                <GlobalSelectInput
                    v-model="inputEnemies"
                    class="w-full"
                    :options="[
                        { value: undefined, label: t('formDetailed_selectSituation'), hidden: true },
                        { value: true, label: t('formDetailed_yes') },
                        { value: false, label: t('formDetailed_no') },
                    ]"
                    :label="t('formDetailed_enemies')"
                    :helper="t('formDetailed_helpEnemies')"
                />
                <GlobalTextInput
                    v-if="inputEnemies"
                    v-model="inputEnemiesDetails"
                    class="mt-2 w-full"
                    :placeholder="t('formDetailed_placeholderEnemies')"
                />
            </div>

            <GlobalSelectInput
                v-model="inputParty"
                class="w-full"
                :options="[
                    { value: undefined, label: t('formDetailed_selectSituation'), hidden: true },
                    { value: true, label: t('formDetailed_yes') },
                    { value: false, label: t('formDetailed_no') },
                ]"
                :label="t('formDetailed_team')"
                :helper="t('formDetailed_helpTeam')"
            />

            <div v-if="inputParty">
                <div class="mt-1 flex justify-end">
                    <svg
                        class="h-4 w-4 cursor-pointer text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 18 18"
                        @click="inputPartyDetails.push('')"
                    >
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16" />
                    </svg>

                    <svg
                        v-if="inputPartyDetails.length > 1"
                        class="ml-4 h-4 w-4 cursor-pointer text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 18 2"
                        @click="inputPartyDetails.pop()"
                    >
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16" />
                    </svg>
                </div>
                <GlobalTextInput
                    v-for="index in inputPartyDetails.length"
                    :key="index"
                    v-model="inputPartyDetails[index - 1]"
                    class="mt-2 w-full"
                    :placeholder="t('formDetailed_placeholderTeam')"
                />
            </div>
        </div>

        <div v-if="currentFormPart === 3" class="mt-4 grid grid-cols-1 gap-4 lg:gap-8">
            <GlobalTextAreaInput
                v-model="inputRemarks"
                class="w-full"
                :label="t('formDetailed_remarks')"
                :placeholder="t('formDetailed_placeholderRemarks')"
                :helper="t('formDetailed_helperRemarks')"
                :rows="8"
            />
        </div>

        <div class="mt-8 flex flex-col gap-4 lg:flex-row">
            <div>
                <GlobalButton
                    v-if="currentFormPart === 3"
                    :error-text="formErrorMessage"
                    :loading="submittingDetails"
                    class="w-full lg:w-fit"
                    size="full"
                    @click="sendDetails()"
                    >{{ t("formDetailed_sendButton") }}</GlobalButton
                >
                <GlobalButton v-else class="w-full lg:w-fit" size="full" @click="currentFormPart++">{{ t("login_continue") }}</GlobalButton>
            </div>

            <div>
                <GlobalButton
                    v-if="currentFormPart === 1"
                    class="w-full lg:w-fit"
                    size="full"
                    type="secondary"
                    icon="cross"
                    @click="displayIgnoreModal = true"
                    >{{ t("button_ignore") }}</GlobalButton
                >

                <GlobalButton v-else class="w-full lg:w-fit" size="full" type="secondary" icon="arrowLeft" @click="currentFormPart--">{{
                    t("tracking_backCancelButton")
                }}</GlobalButton>
            </div>
        </div>

        <EmergencyRulesModal v-if="displayRulesModal" @close="displayRulesModal = false" @confirmed="confirmedRules()" />
        <IgnoreEmergencyDetailsFormModal v-if="displayIgnoreModal" @ignore-details="$emit('submittedDetails')" @close="displayIgnoreModal = false" />
    </div>
</template>

<style scoped></style>
