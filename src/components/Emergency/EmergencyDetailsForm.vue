<script setup lang="ts">
import type { EmergencyDetailsStep } from "@/utils/functions/emergencyDetailsFunctions.ts";
import { computed, onMounted, ref } from "vue";

import { useI18n } from "vue-i18n";
import { AlertColors } from "@/@types/types.ts";
import EmergencyRulesModal from "@/components/Modals/EmergencyRulesModal.vue";
import IgnoreEmergencyDetailsFormModal from "@/components/Modals/IgnoreEmergencyDetailsFormModal.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalLoader from "@/components/utils/GlobalLoader.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
import GlobalTextAreaInput from "@/components/utils/GlobalTextAreaInput.vue";
import GlobalTextBox from "@/components/utils/GlobalTextBox.vue";
import GlobalTextInput from "@/components/utils/GlobalTextInput.vue";
import { useAlertStore } from "@/stores/alertStore.ts";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useUserStore } from "@/stores/userStore";
import {
    canSendSkippedEmergencyDetailsMessage,
    createEmergencyDetailsStepMessage,
    createSkippedEmergencyDetailsMessage,
    loadEmergencyDetailsProgress,
} from "@/utils/functions/emergencyDetailsFunctions.ts";
import { errorString } from "@/utils/functions/stringFunctions.ts";
import { lineReturnRegex } from "@/utils/globalVars.ts";

const { t } = useI18n();
const emergencyStore = useEmergencyStore();
const userStore = useUserStore();
const alertStore = useAlertStore();

const currentFormPart = ref<EmergencyDetailsStep>(1);
const displayIgnoreModal = ref(false);
const displayRulesModal = ref(false);
const completedSteps = ref<EmergencyDetailsStep[]>([]);
const skippedDetails = ref(false);
const restartingDetails = ref(false);
const loadingDetailsProgress = ref(true);
const errorLoadingDetailsProgress = ref("");

const inputSituation = ref("");
const inputExactLocation = ref("");
const inputInjury = ref("");
const inputCrimestat = ref("");
const inputLocationType = ref("");
const inputLocationASDFacilityType = ref("");
const inputLocationQVStationType = ref("");
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

const emergencyDetailsSteps = [1, 2, 3, 4] as EmergencyDetailsStep[];
const emergencyDetailsStepLabels: Record<EmergencyDetailsStep, string> = {
    1: "formDetailed_situation",
    2: "formDetailed_locationDetails",
    3: "formDetailed_players",
    4: "formDetailed_remarks",
};
const isDetailsSkipped = computed(() => skippedDetails.value && !restartingDetails.value);
const areDetailsCompleted = computed(() => completedSteps.value.length === emergencyDetailsSteps.length);

onMounted(async () => {
    if (!userStore.syncedSettings.hideEmergencyRulesModal)
        displayRulesModal.value = true;

    await restoreDetailsProgress();
});

function confirmedRules(): void {
    displayRulesModal.value = false;
}

function getInputLocationString(): string {
    if (!inputLocationType.value)
        return "Unknown";

    if (inputLocationASDFacilityType.value) {
        return `${inputLocationType.value} (${inputLocationASDFacilityType.value})`;
    }
    else if (inputLocationQVStationType.value) {
        return `${inputLocationType.value} (${inputLocationQVStationType.value})`;
    }
    else {
        return inputLocationType.value;
    }
}

/** Restores progress from the client-authored key messages in the emergency chat. */
async function restoreDetailsProgress(): Promise<void> {
    loadingDetailsProgress.value = true;
    errorLoadingDetailsProgress.value = "";

    if (!emergencyStore.trackedEmergency) {
        loadingDetailsProgress.value = false;
        return;
    }

    try {
        const progress = await loadEmergencyDetailsProgress(
            paginationToken => emergencyStore.fetchChatHistory(emergencyStore.trackedEmergency!.id, paginationToken),
            userStore.user.id,
        );

        completedSteps.value = progress.completedSteps;
        skippedDetails.value = progress.skipped;

        const nextStep = getNextIncompleteStep();
        if (nextStep)
            currentFormPart.value = nextStep;
    }
    catch (error: any) {
        errorLoadingDetailsProgress.value = errorString(error, t("error_loadingTrackedEmergency"));
    }
    finally {
        loadingDetailsProgress.value = false;
    }
}

/** Returns the first step that has no durable client message yet. */
function getNextIncompleteStep(): EmergencyDetailsStep | undefined {
    return emergencyDetailsSteps.find(step => !completedSteps.value.includes(step));
}

/** Reports whether a step is complete in the current persisted attempt. */
function isStepCompleted(step: number): boolean {
    return completedSteps.value.includes(step as EmergencyDetailsStep);
}

/** Returns the body for the step currently visible to the client. */
function getCurrentStepContents(): string {
    switch (currentFormPart.value) {
        case 1:
            return `_The client's situation is:_  **${inputSituation.value || "Unknown"}**\n
            _Client death:_  **${
                inputDeathHours.value || inputDeathMinutes.value
                    ? `<t:${Math.round(Date.now() / 1000) + (inputDeathHours.value ?? 0) * 3600 + (inputDeathMinutes.value ?? 0) * 60}:R>`
                    : "Unknown"
            }**\n
            _Is the client injured:_  **${inputInjury.value || "Unknown"}**\n
            _Does the client have CrimeStat?_  **${inputCrimestat.value || "Unknown"}**${
                inputCrimestatDetails.value ? `\n\n${inputCrimestatDetails.value}` : ""
            }`;
        case 2:
            return `_The client type of location is:_  **${getInputLocationString()}**\n
            _The client exact location is:_  **${inputExactLocation.value || "Unknown"}**\n
            _Client ship:_  **${inputShip.value || "Unknown"}**`;
        case 3:
            return `_Has the client sent an IG beacon?_  **${inputBeacon.value === true ? "Yes" : inputBeacon.value === false ? "No" : "Unknown"}**${
                inputBeaconPlayer.value ? `\n\nName: ${inputBeaconPlayer.value}` : ""
            }\n${inputBeaconDistance.value ? `Distance: ${inputBeaconDistance.value}` : ""}\n
            _Is the client in a team?_  **${inputParty.value === true ? "Yes" : inputParty.value === false ? "No" : "Unknown"}**${
                inputParty.value === true && inputPartyDetails.value ? `\n\n${inputPartyDetails.value.filter(str => str !== "").join(", ")}` : ""
            }\n
            _Are there enemies nearby?_  **${inputEnemies.value === true ? "Yes" : inputEnemies.value === false ? "No" : "Unknown"}**${
                inputEnemiesDetails.value ? `\n\n${inputEnemiesDetails.value}` : ""
            }`;
        case 4:
            return `_Remarks:_${inputRemarks.value ? `\n>${inputRemarks.value.replace(lineReturnRegex, "\n")}` : "  <em>None provided</em>"}`;
    }
}

/** Sends the visible step and advances only after the chat API confirms it. */
async function submitCurrentStep(): Promise<void> {
    try {
        if (!emergencyStore.trackedEmergency) {
            alertStore.newAlert(AlertColors.RED, t("error_failedMessage"));
            return;
        }
        submittingDetails.value = true;

        await emergencyStore.sendEmergencyMessage({
            emergencyId: emergencyStore.trackedEmergency.id,
            contents: createEmergencyDetailsStepMessage(currentFormPart.value, getCurrentStepContents()),
        });

        formErrorMessage.value = "";
        skippedDetails.value = false;
        restartingDetails.value = false;

        if (!completedSteps.value.includes(currentFormPart.value))
            completedSteps.value.push(currentFormPart.value);

        const nextStep = getNextIncompleteStep();
        if (nextStep) {
            currentFormPart.value = nextStep;
            return;
        }

        resetInputs();
    }
    catch (error: any) {
        formErrorMessage.value = errorString(error);
    }
    finally {
        submittingDetails.value = false;
    }
}

/** Records an explicit decline and shows the persisted skipped state. */
async function ignoreDetails(): Promise<void> {
    try {
        if (!emergencyStore.trackedEmergency) {
            alertStore.newAlert(AlertColors.RED, t("error_failedMessage"));
            return;
        }

        submittingDetails.value = true;

        const progress = await loadEmergencyDetailsProgress(
            paginationToken => emergencyStore.fetchChatHistory(emergencyStore.trackedEmergency!.id, paginationToken),
            userStore.user.id,
        );

        completedSteps.value = progress.completedSteps;
        skippedDetails.value = progress.skipped;

        if (!canSendSkippedEmergencyDetailsMessage(progress)) {
            formErrorMessage.value = "";
            displayIgnoreModal.value = false;
            restartingDetails.value = false;
            return;
        }

        await emergencyStore.sendEmergencyMessage({
            emergencyId: emergencyStore.trackedEmergency.id,
            contents: createSkippedEmergencyDetailsMessage(),
        });

        formErrorMessage.value = "";
        displayIgnoreModal.value = false;
        skippedDetails.value = true;
        restartingDetails.value = false;
    }
    catch (error: any) {
        formErrorMessage.value = errorString(error);
        displayIgnoreModal.value = false;
    }
    finally {
        submittingDetails.value = false;
    }
}

/** Lets a client who deliberately skipped start another detail attempt. */
function restartDetails(): void {
    skippedDetails.value = false;
    restartingDetails.value = true;
    currentFormPart.value = 1;
    formErrorMessage.value = "";
}

/** Clears form fields after all four detail messages were delivered. */
function resetInputs(): void {
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
    inputLocationASDFacilityType.value = "";
    inputLocationQVStationType.value = "";
}
</script>

<template>
    <div>
        <ol
            class="
                mb-6 grid w-full grid-cols-1 gap-y-3 text-sm font-medium text-gray-500
                sm:grid-cols-[auto_minmax(2rem,1fr)_auto_minmax(2rem,1fr)_auto_minmax(2rem,1fr)_auto] sm:text-base
                lg:mb-8
                dark:text-gray-400
            "
        >
            <template v-for="step in emergencyDetailsSteps" :key="step">
                <li
                    class="
                        flex items-center gap-2
                        sm:block sm:text-center
                    "
                    :class="{
                        'text-primary-600 dark:text-red-700': isStepCompleted(step) || (!isDetailsSkipped && currentFormPart === step),
                        'line-through opacity-60': isDetailsSkipped,
                    }"
                >
                    <svg
                        v-if="isStepCompleted(step)"
                        class="
                            size-6 shrink-0
                            sm:mx-auto sm:mb-2
                        "
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    <div
                        v-else class="
                            flex size-6 shrink-0 items-center justify-center
                            sm:mx-auto sm:mb-2
                        "
                    >
                        {{ step }}
                    </div>
                    <span>{{ t(emergencyDetailsStepLabels[step]) }}</span>
                </li>
                <li
                    v-if="step !== 4"
                    aria-hidden="true"
                    class="
                        hidden border-t border-gray-200
                        sm:mt-3 sm:block
                        dark:border-gray-700
                    "
                />
            </template>
        </ol>

        <div v-if="loadingDetailsProgress" class="flex h-56 w-full items-center justify-center">
            <GlobalLoader width="w-8" height="h-8" text-size="text-md" spacing="mb-4" />
        </div>

        <div v-else-if="errorLoadingDetailsProgress" class="my-24 flex flex-col items-center gap-4">
            <GlobalErrorText :text="errorLoadingDetailsProgress" />
            <GlobalButton size="full" @click="restoreDetailsProgress()">
                {{ t("formDetailed_retryLoading") }}
            </GlobalButton>
        </div>

        <div v-else-if="isDetailsSkipped">
            <GlobalTextBox>{{ t("formDetailed_skippedDetails") }}</GlobalTextBox>

            <div
                class="
                    mt-8 flex flex-col gap-4
                    lg:flex-row
                "
            >
                <GlobalButton size="full" @click="restartDetails()">
                    {{ t("formDetailed_restartDetails") }}
                </GlobalButton>
            </div>

            <GlobalErrorText v-if="formErrorMessage" :text="formErrorMessage" :icon="false" class="mt-2 text-sm font-semibold" />
        </div>

        <GlobalTextBox v-else-if="areDetailsCompleted">
            {{ t("formDetailed_completedDetails") }}
        </GlobalTextBox>

        <template v-else>
            <GlobalTextBox>{{ t("formDetailed_infoSpeakEnglish") }}</GlobalTextBox>

            <div
                v-if="currentFormPart === 1" class="
                    mt-4 grid grid-cols-1 gap-4
                    lg:grid-cols-2 lg:flex-row lg:gap-8
                "
            >
                <GlobalSelectInput
                    v-model="inputSituation"
                    class="w-full"
                    :options="[
                        { value: '', label: t('formDetailed_selectSituation'), hidden: true },
                        { value: 'Unconscious', label: t('formDetailed_situationUnconscious') },
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
                        { value: '', label: t('formDetailed_selectInjuryTier'), hidden: true },
                        { value: 'No', label: t('formDetailed_no') },
                        { value: 'Tier 1', label: `${t('formDetailed_injuryTier', { number: '1' })}` },
                        { value: 'Tier 2', label: `${t('formDetailed_injuryTier', { number: '2' })}` },
                        { value: 'Tier 3', label: `${t('formDetailed_injuryTier', { number: '3' })}` },
                    ]"
                    :label="t('formDetailed_injury')"
                    :helper="t('formDetailed_helpInjury')"
                />

                <div>
                    <GlobalSelectInput
                        v-model="inputCrimestat"
                        class="w-full"
                        :options="[
                            { value: '', label: t('formDetailed_selectCrimeStat'), hidden: true },
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

                <div>
                    <label
                        class="
                            mb-2 block text-sm font-medium text-gray-900
                            dark:text-white
                        "
                    >{{ t("formDetailed_death") }}</label>

                    <div class="flex items-center justify-between">
                        <GlobalTextInput v-model="inputDeathHours" class="w-full" type="number" />
                        <p class="mx-4">
                            {{ t("formDetailed_hours") }}
                        </p>
                        <GlobalTextInput v-model="inputDeathMinutes" class="w-full" type="number" />
                        <p class="mx-4">
                            {{ t("formDetailed_minutes") }}
                        </p>
                    </div>
                </div>
            </div>

            <div
                v-if="currentFormPart === 2" class="
                    mt-4 grid grid-cols-1 gap-4
                    lg:grid-cols-2 lg:flex-row lg:gap-8
                "
            >
                <div>
                    <GlobalSelectInput
                        v-model="inputLocationType"
                        class="w-full"
                        :options="[
                            { value: '', label: t('formDetailed_selectLocationType'), hidden: true },
                            { value: 'Bunker', label: t('formDetailed_locationTypeBunker') },
                            { value: 'Outpost', label: t('formDetailed_locationTypeOutpost') },
                            { value: 'Distribution Center', label: t('formDetailed_locationTypeDistributionCenter') },
                            { value: 'Contested Zones', label: t('formDetailed_locationTypeContestedZones') },
                            { value: 'Orbital Laser Platform', label: t('formDetailed_locationTypeOLP') },
                            { value: 'Platform Alignment Facility', label: t('formDetailed_locationTypePAF') },
                            { value: 'Space', label: t('formDetailed_locationTypeSpace') },
                            { value: 'Surface', label: t('formDetailed_locationTypeSurface') },
                            { value: 'ASD Facility', label: t('formDetailed_locationTypeASDFacility') },
                            { value: 'QV Station', label: t('formDetailed_locationTypeQVStation') },
                            { value: 'Breaker Station', label: t('formDetailed_locationTypeQVBreakerStation') },
                            { value: 'Other', label: t('formDetailed_locationTypeOther') },
                        ]"
                        :label="t('formDetailed_locationType')"
                        :helper="t('formDetailed_helpLocationType')"
                    />

                    <GlobalSelectInput
                        v-if="inputLocationType === 'ASD Facility'"
                        v-model="inputLocationASDFacilityType"
                        class="mt-2 w-full"
                        :options="[
                            { value: '', label: t('formDetailed_selectASDLocationType'), hidden: true },
                            { value: 'Lazarus', label: t('formDetailed_ASDLocationLazarus') },
                            { value: 'Farro', label: t('formDetailed_ASDLocationFarro') },
                            { value: 'Onyx', label: t('formDetailed_ASDLocationOnyx') },
                        ]"
                    />

                    <GlobalSelectInput
                        v-else-if="inputLocationType === 'QV Station'"
                        v-model="inputLocationQVStationType"
                        class="mt-2 w-full"
                        :options="[
                            { value: '', label: t('formDetailed_selectQVLocationType'), hidden: true },
                            { value: 'Logistics Station', label: t('formDetailed_locationTypeQVLogisticsStation') },
                            { value: 'Breaker Station', label: t('formDetailed_locationTypeQVBreakerStation') },
                            { value: 'Extraction Station', label: t('formDetailed_locationTypeQVExtractionStation') },
                        ]"
                    />
                </div>

                <GlobalTextInput
                    v-model="inputExactLocation"
                    class="w-full"
                    :label="t('formDetailed_location')"
                    :placeholder="t('formDetailed_placeholderLocation')"
                    :helper="t('formDetailed_helpLocation')"
                />

                <GlobalTextInput
                    v-model="inputShip"
                    class="w-full"
                    :label="t('formDetailed_ship')"
                    :placeholder="t('formDetailed_placeholderShip')"
                    :helper="t('formDetailed_helpShip')"
                />
            </div>

            <div
                v-if="currentFormPart === 3" class="
                    mt-4 grid grid-cols-1 gap-4
                    lg:grid-cols-2 lg:flex-row lg:gap-8
                "
            >
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
                    <p
                        v-if="inputBeacon" class="
                            mt-2 text-sm font-medium text-primary-600
                            dark:text-red-700
                        "
                    >
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
                            class="
                                size-4 cursor-pointer text-gray-800
                                dark:text-white
                            "
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
                            class="
                                ml-4 size-4 cursor-pointer text-gray-800
                                dark:text-white
                            "
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

            <div
                v-if="currentFormPart === 4" class="
                    mt-4 grid grid-cols-1 gap-4
                    lg:gap-8
                "
            >
                <GlobalTextAreaInput
                    v-model="inputRemarks"
                    class="w-full"
                    :label="t('formDetailed_remarks')"
                    :placeholder="t('formDetailed_placeholderRemarks')"
                    :helper="t('formDetailed_helperRemarks')"
                    :rows="8"
                />
            </div>

            <div
                class="
                    mt-8 flex flex-col gap-4
                    lg:flex-row
                "
            >
                <div>
                    <GlobalButton
                        :loading="submittingDetails" class="
                            w-full
                            lg:w-fit
                        " size="full" @click="submitCurrentStep()"
                    >
                        {{
                            currentFormPart === 4 ? t("formDetailed_sendButton") : t("login_continue")
                        }}
                    </GlobalButton>
                </div>
                <GlobalErrorText v-if="formErrorMessage" :text="formErrorMessage" :icon="false" class="mt-2 text-sm font-semibold" />

                <div v-if="currentFormPart === 1">
                    <GlobalButton
                        class="
                            w-full
                            lg:w-fit
                        "
                        size="full"
                        type="secondary"
                        icon="cross"
                        @click="displayIgnoreModal = true"
                    >
                        {{ t("button_ignore") }}
                    </GlobalButton>
                </div>
            </div>
        </template>

        <EmergencyRulesModal v-if="displayRulesModal" @close="displayRulesModal = false" @confirmed="confirmedRules()" />
        <IgnoreEmergencyDetailsFormModal
            v-if="displayIgnoreModal"
            :loading="submittingDetails"
            @ignore-details="ignoreDetails()"
            @close="displayIgnoreModal = false"
        />
    </div>
</template>

<style scoped></style>
