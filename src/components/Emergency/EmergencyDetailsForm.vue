<script setup lang="ts">
import { onMounted, type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import EmergencyRulesModal from "@/components/Modals/EmergencyRulesModal.vue";
import IgnoreEmergencyDetailsFormModal from "@/components/Modals/IgnoreEmergencyDetailsFormModal.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
import GlobalTextAreaInput from "@/components/utils/GlobalTextAreaInput.vue";
import GlobalTextBox from "@/components/utils/GlobalTextBox.vue";
import GlobalTextInput from "@/components/utils/GlobalTextInput.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useUserStore } from "@/stores/userStore";

const { t } = useI18n();
const emergencyStore = useEmergencyStore();
const userStore = useUserStore();

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
const inputDeathHours: Ref<number | undefined> = ref(undefined);
const inputDeathMinutes: Ref<number | undefined> = ref(undefined);
const inputShip = ref("");
const inputBeacon: Ref<boolean | undefined> = ref(undefined);
const inputBeaconPlayer = ref("");
const inputBeaconDistance = ref("");
const inputEnemies: Ref<boolean | undefined> = ref(undefined);
const inputEnemiesDetails = ref("");
const inputParty: Ref<boolean | undefined> = ref(undefined);
const inputPartyDetails = ref([""]);
const inputRemarks = ref("");
const formErrorMessage = ref("");
const submittingDetails = ref(false);

onMounted(() => {
    const modalVisibilityPreference =
        "hideEmergencyRulesModal" in userStore.user.clientPortalPreferences
            ? (userStore.user.clientPortalPreferences.hideEmergencyRulesModal as boolean)
            : false;

    if (!modalVisibilityPreference) displayRulesModal.value = true;
});

function confirmedRules(): void {
    displayRulesModal.value = false;
}

async function sendDetails(): Promise<void> {
    try {
        submittingDetails.value = true;
        await emergencyStore.sendEmergencyMessage({
            emergencyId: emergencyStore.trackedEmergency.id,
            contents: `
            ## Emergency details from Client

            __The client's situation is:__  **${inputSituation.value ? inputSituation.value : "Unknown"}**\n
            __The client type of location is:__  **${inputLocationType.value ? inputLocationType.value : "Unknown"}**\n
            __The client exact location is:__  **${inputExactLocation.value ? inputExactLocation.value : "Unknown"}**\n
            __Client ship:__  **${inputShip.value ? inputShip.value : "Unknown"}**\n
            __Time until client death:__  **${
                inputDeathHours.value || inputDeathMinutes.value
                    ? `<t:${Math.round(Date.now() / 1000) + (inputDeathHours.value ?? 0) * 3600 + (inputDeathMinutes.value ?? 0) * 60}:R>`
                    : "Unknown"
            }**\n
            __Is the client injured:__  **${inputInjury.value ? inputInjury.value : "Unknown"}**\n
            __Has the client sent an IG beacon?__  **${inputBeacon.value === true ? "Yes" : inputBeacon.value === false ? "No" : "Unknown"}**${
                inputBeaconPlayer.value ? `\n\n> Name: ${inputBeaconPlayer.value}` : ""
            }\n${inputBeaconDistance.value ? `> Distance: ${inputBeaconDistance.value}` : ""}\n
            __Is the client in a team?__  **${inputParty.value === true ? "Yes" : inputParty.value === false ? "No" : "Unknown"}**${
                inputParty.value === true && inputPartyDetails.value ? `\n\n> ${inputPartyDetails.value.filter((str) => str !== "").join(", ")}` : ""
            }\n
            __Are there enemies nearby?__  **${inputEnemies.value === true ? "Yes" : inputEnemies.value === false ? "No" : "Unknown"}**${
                inputEnemiesDetails.value ? `\n\n> ${inputEnemiesDetails.value}` : ""
            }\n
            __Does the client have CrimeStat?__  **${inputCrimestat.value ? inputCrimestat.value : "Unknown"}**${
                inputCrimestatDetails.value ? `\n\n> ${inputCrimestatDetails.value}` : ""
            }\n
            __Remarks:__\n\n> ${inputRemarks.value ? inputRemarks.value : "None"}`,
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
        if (error.statusCode === 403) formErrorMessage.value = t("error_blockedUser");
        else if (error.statusCode === 429) formErrorMessage.value = t("error_rateLimit");
        else formErrorMessage.value = t("error_generic");
    }

    submittingDetails.value = false;
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
                            class="mr-2 h-4 w-4 sm:mx-auto sm:mb-2 sm:h-6 sm:w-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                            v-if="currentFormPart >= 2"
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
                        class="mr-2 h-4 w-4 sm:mx-auto sm:mb-2 sm:h-6 sm:w-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                        v-if="currentFormPart >= 3"
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
                class="w-full"
                :options="[
                    { value: '', label: t('formDetailed_selectSituation'), hidden: true },
                    { value: 'Unconscious', label: t('formDetailed_situationUnconscious') },
                    { value: 'Out of fuel', label: t('formDetailed_situationFuel') },
                    { value: 'Stranded', label: t('formDetailed_situationStranded') },
                    { value: 'Other', label: t('formDetailed_situationOther') },
                ]"
                v-model="inputSituation"
                :label="t('formDetailed_situation')"
                :helper="t('formDetailed_helpSituation')"
            />

            <GlobalSelectInput
                class="w-full"
                :options="[
                    { value: '', label: t('formDetailed_selectSituation'), hidden: true },
                    { value: 'No', label: t('formDetailed_no') },
                    { value: 'Tier 1', label: `${t('formDetailed_injuryTier', { number: '1' })}` },
                    { value: 'Tier 2', label: `${t('formDetailed_injuryTier', { number: '2' })}` },
                    { value: 'Tier 3', label: `${t('formDetailed_injuryTier', { number: '3' })}` },
                ]"
                v-model="inputInjury"
                :label="t('formDetailed_injury')"
                :helper="t('formDetailed_helpInjury')"
            />

            <GlobalSelectInput
                class="w-full"
                :options="[
                    { value: '', label: t('formDetailed_selectLocationType'), hidden: true },
                    { value: 'Bunker', label: t('formDetailed_locationTypeBunker') },
                    { value: 'Outpost', label: t('formDetailed_locationTypeOutpost') },
                    { value: 'Space', label: t('formDetailed_locationTypeSpace') },
                    { value: 'Surface', label: t('formDetailed_locationTypeSurface') },
                    { value: 'Other', label: t('formDetailed_locationTypeOther') },
                ]"
                v-model="inputLocationType"
                :label="t('formDetailed_locationType')"
                :helper="t('formDetailed_helpLocationType')"
            />

            <GlobalTextInput
                class="w-full"
                v-model="inputExactLocation"
                :label="t('formDetailed_location')"
                :placeholder="t('formDetailed_placeholderLocation')"
                :helper="t('formDetailed_helpLocation')"
            />

            <div>
                <GlobalSelectInput
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
                    v-model="inputCrimestat"
                    :label="t('formDetailed_crimestat')"
                    :helper="t('formDetailed_helpCrimestat')"
                />

                <GlobalTextInput
                    v-if="inputCrimestat && inputCrimestat !== 'No'"
                    class="mt-2 w-full"
                    v-model="inputCrimestatDetails"
                    :placeholder="t('formDetailed_placeholderCrimestat')"
                />
            </div>

            <GlobalTextInput
                class="w-full"
                v-model="inputShip"
                :label="t('formDetailed_ship')"
                :placeholder="t('formDetailed_placeholderShip')"
                :helper="t('formDetailed_helpShip')"
            />

            <div>
                <label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{{ t("formDetailed_death") }}</label>

                <div class="flex items-center justify-between">
                    <GlobalTextInput class="w-full" type="number" v-model="inputDeathHours" />
                    <p class="mx-4">{{ t("formDetailed_hours") }}</p>
                    <GlobalTextInput class="w-full" type="number" v-model="inputDeathMinutes" />
                    <p class="mx-4">{{ t("formDetailed_minutes") }}</p>
                </div>
            </div>
        </div>

        <div v-if="currentFormPart === 2" class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:flex-row lg:gap-8">
            <div>
                <GlobalSelectInput
                    class="w-full"
                    :options="[
                        { value: undefined, label: t('formDetailed_selectSituation'), hidden: true },
                        { value: true, label: t('formDetailed_yes') },
                        { value: false, label: t('formDetailed_no') },
                    ]"
                    v-model="inputBeacon"
                    :label="t('formDetailed_beacon')"
                    :helper="t('formDetailed_helpBeacon')"
                />
                <GlobalTextInput
                    v-if="inputBeacon"
                    class="mt-2 w-full"
                    v-model="inputBeaconPlayer"
                    :placeholder="t('formDetailed_placeholderBeaconPlayer')"
                />
                <GlobalTextInput
                    v-if="inputBeacon"
                    class="mt-2 w-full"
                    v-model="inputBeaconDistance"
                    :placeholder="t('formDetailed_placeholderBeaconDistance')"
                />
                <p v-if="inputBeacon" class="mt-2 text-sm font-medium text-primary-600 dark:text-red-700">
                    {{ t("formDetailed_beaconCancelMessage") }}
                </p>
            </div>

            <div>
                <GlobalSelectInput
                    class="w-full"
                    :options="[
                        { value: undefined, label: t('formDetailed_selectSituation'), hidden: true },
                        { value: true, label: t('formDetailed_yes') },
                        { value: false, label: t('formDetailed_no') },
                    ]"
                    v-model="inputEnemies"
                    :label="t('formDetailed_enemies')"
                    :helper="t('formDetailed_helpEnemies')"
                />
                <GlobalTextInput
                    v-if="inputEnemies"
                    class="mt-2 w-full"
                    v-model="inputEnemiesDetails"
                    :placeholder="t('formDetailed_placeholderEnemies')"
                />
            </div>

            <GlobalSelectInput
                class="w-full"
                :options="[
                    { value: undefined, label: t('formDetailed_selectSituation'), hidden: true },
                    { value: true, label: t('formDetailed_yes') },
                    { value: false, label: t('formDetailed_no') },
                ]"
                v-model="inputParty"
                :label="t('formDetailed_team')"
                :helper="t('formDetailed_helpTeam')"
            />

            <div v-if="inputParty">
                <div class="mt-1 flex justify-end">
                    <svg
                        class="h-4 w-4 cursor-pointer text-gray-800 dark:text-white"
                        @click="inputPartyDetails.push('')"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 18 18"
                    >
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16" />
                    </svg>

                    <svg
                        v-if="inputPartyDetails.length > 1"
                        @click="inputPartyDetails.pop()"
                        class="ml-4 h-4 w-4 cursor-pointer text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 18 2"
                    >
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16" />
                    </svg>
                </div>
                <GlobalTextInput
                    v-for="index in inputPartyDetails.length"
                    :key="index"
                    class="mt-2 w-full"
                    v-model="inputPartyDetails[index - 1]"
                    :placeholder="t('formDetailed_placeholderTeam')"
                />
            </div>
        </div>

        <div v-if="currentFormPart === 3" class="mt-4 grid grid-cols-1 gap-4 lg:gap-8">
            <GlobalTextAreaInput
                class="w-full"
                v-model="inputRemarks"
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
                    @click="sendDetails()"
                    :error-text="formErrorMessage"
                    :loading="submittingDetails"
                    class="w-full lg:w-fit"
                    size="full"
                    >{{ t("formDetailed_sendButton") }}</GlobalButton
                >
                <GlobalButton v-else class="w-full lg:w-fit" size="full" @click="currentFormPart++">{{ t("login_continue") }}</GlobalButton>
            </div>

            <div>
                <GlobalButton
                    v-if="currentFormPart === 1"
                    @click="displayIgnoreModal = true"
                    class="w-full lg:w-fit"
                    size="full"
                    type="secondary"
                    icon="cross"
                    >{{ t("button_ignore") }}</GlobalButton
                >

                <GlobalButton v-else class="w-full lg:w-fit" size="full" type="secondary" icon="arrowLeft" @click="currentFormPart--">{{
                    t("tracking_backCancelButton")
                }}</GlobalButton>
            </div>
        </div>

        <EmergencyRulesModal v-if="displayRulesModal" @close="displayRulesModal = false" @confirmed="confirmedRules()" />
        <IgnoreEmergencyDetailsFormModal v-if="displayIgnoreModal" @ignoreDetails="$emit('submittedDetails')" @close="displayIgnoreModal = false" />
    </div>
</template>

<style scoped></style>
