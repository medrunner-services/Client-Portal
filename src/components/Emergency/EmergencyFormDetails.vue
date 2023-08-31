<script setup lang="ts">
import { MinusIcon, PlusIcon } from "@heroicons/vue/24/outline";
import { type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import LabelInput from "@/components/LabelInput.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";

const emergencyStore = useEmergencyStore();
const { t } = useI18n();

const emit = defineEmits(["close"]);

const formErrorMessage = ref("");
const formSubmittingEmergency = ref(false);
const formSituation = ref("");
const formLocation = ref("");
const formInjuries = ref("");
const formIGBeacon: Ref<boolean | undefined> = ref();
const formTeam: Ref<boolean | undefined> = ref();
const formTeamDetails: Ref<string[]> = ref([""]);
const formEnemies: Ref<boolean | undefined> = ref();
const formEnemiesDetails = ref("");
const formRemarks = ref("");
const formTimeDeathHours: Ref<number | undefined> = ref();
const formTimeDeathMinutes: Ref<number | undefined> = ref();
const formCrimeStat = ref("");
const formCrimeStatReason = ref("");
const formShip = ref("");

async function sendDetails(): Promise<void> {
    try {
        formSubmittingEmergency.value = true;

        await emergencyStore.sendEmergencyMessage({
            emergencyId: emergencyStore.trackedEmergency.id,
            contents: `
            ## Emergency details from Client

            __The client's situation is:__  **${formSituation.value ? formSituation.value : "Unknown"}**\n
            __The client is located:__  **${formLocation.value ? formLocation.value : "Unknown"}**\n
            __Client ship:__  **${formShip.value ? formShip.value : "Unknown"}**\n
            __Time until client death:__  **${
                formTimeDeathHours.value || formTimeDeathMinutes.value
                    ? `<t:${Math.round(Date.now() / 1000) + (formTimeDeathHours.value ?? 0) * 3600 + (formTimeDeathMinutes.value ?? 0) * 60}:R>`
                    : "Unknown"
            }**\n
            __Is the client injured:__  **${formInjuries.value ? formInjuries.value : "Unknown"}**\n
            __Has the client sent an IG beacon:__  **${formIGBeacon.value === true ? "Yes" : formIGBeacon.value === false ? "No" : "Unknown"}**\n
            __Is the client in a team?__  **${formTeam.value === true ? "Yes" : formTeam.value === false ? "No" : "Unknown"}**${
                formTeam.value === true && formTeamDetails.value ? `\n\n> ${formTeamDetails.value.filter(str => str !== "").join(", ")}` : ""
            }\n
            __Are there enemies nearby?__  **${formEnemies.value === true ? "Yes" : formEnemies.value === false ? "No" : "Unknown"}**${
                formEnemiesDetails.value ? `\n\n> ${formEnemiesDetails.value}` : ""
            }\n
            __Does the client have CrimeStat?__  **${formCrimeStat.value ? formCrimeStat.value : "Unknown"}**${
                formCrimeStatReason.value ? `\n\n> ${formCrimeStatReason.value}` : ""
            }\n
            __Remarks:__\n\n> ${formRemarks.value ? formRemarks.value : "None"}`,
        });

        formSubmittingEmergency.value = false;
        formErrorMessage.value = "";
        formSubmittingEmergency.value = false;
        formSituation.value = "";
        formLocation.value = "";
        formInjuries.value = "";
        formIGBeacon.value = false;
        formTeam.value = false;
        formTeamDetails.value = [""];
        formEnemies.value = false;
        formEnemiesDetails.value = "";
        formRemarks.value = "";
        formTimeDeathHours.value = undefined;
        formTimeDeathMinutes.value = undefined;
        formCrimeStat.value = "";
        formCrimeStatReason.value = "";
        formShip.value = "";

        emit("close");
    } catch (error: any) {
        formSubmittingEmergency.value = false;
        if (error.statusCode === 403) formErrorMessage.value = t("error_blockedUser");
        if (error.statusCode === 429) formErrorMessage.value = t("error_rateLimit");
        else formErrorMessage.value = t("error_generic");
    }
}
</script>

<template>
    <form class="mt-10" @submit.prevent="sendDetails()">
        <div class="lg:flex lg:gap-4">
            <div class="w-full">
                <LabelInput title-local="formDetailed_situation" description-local="formDetailed_helpSituation" />
                <div class="mt-2">
                    <select
                        class="w-full focus:border-secondary-500 focus:ring-secondary-500"
                        :class="formErrorMessage ? 'border-red-500 dark:border-red-500' : 'border-gray-400'"
                        v-model="formSituation"
                        :disabled="formSubmittingEmergency"
                    >
                        <option hidden value>{{ t("formDetailed_selectSituation") }}</option>
                        <option value="Unconscious">{{ t("formDetailed_situationUnconscious") }}</option>
                        <option value="Out of fuel">{{ t("formDetailed_situationFuel") }}</option>
                        <option value="Stranded">{{ t("formDetailed_situationStranded") }}</option>
                        <option value="Other">{{ t("formDetailed_situationOther") }}</option>
                    </select>
                </div>
            </div>

            <div class="mt-5 w-full lg:mt-0">
                <LabelInput title-local="formDetailed_location" description-local="formDetailed_helpLocation" />
                <div class="mt-2 flex w-full">
                    <input
                        type="text"
                        class="input-text w-full flex-grow"
                        :class="formErrorMessage ? 'border-red-500 dark:border-red-500' : 'border-gray-400'"
                        :disabled="formSubmittingEmergency"
                        v-model="formLocation"
                        :placeholder="t('formDetailed_placeholderLocation')"
                    />
                </div>
            </div>
        </div>

        <div class="mt-5 lg:mt-10 lg:flex lg:gap-4">
            <div class="w-full">
                <LabelInput title-local="formDetailed_injury" description-local="formDetailed_helpInjury" />
                <div class="mt-2 flex w-full flex-col">
                    <select
                        class="w-full focus:border-secondary-500 focus:ring-secondary-500"
                        :class="formErrorMessage ? 'border-red-500 dark:border-red-500' : 'border-gray-400'"
                        v-model="formInjuries"
                        :disabled="formSubmittingEmergency"
                    >
                        <option value="No">{{ t("formDetailed_no") }}</option>
                        <option value="Tier 1">{{ t("formDetailed_injuryTier") }} 1</option>
                        <option value="Tier 2">{{ t("formDetailed_injuryTier") }} 2</option>
                        <option value="Tier 3">{{ t("formDetailed_injuryTier") }} 3</option>
                    </select>
                </div>
            </div>

            <div class="mt-5 w-full lg:mt-0">
                <LabelInput title-local="formDetailed_beacon" description-local="formDetailed_helpBeacon" alignment="left" />
                <div class="mt-2 flex w-full flex-col">
                    <select
                        class="w-full focus:border-secondary-500 focus:ring-secondary-500"
                        :class="formErrorMessage ? 'border-red-500 dark:border-red-500' : 'border-gray-400'"
                        v-model="formIGBeacon"
                        :disabled="formSubmittingEmergency"
                    >
                        <option :value="true">{{ t("formDetailed_yes") }}</option>
                        <option :value="false">{{ t("formDetailed_no") }}</option>
                    </select>
                    <p v-if="formIGBeacon" class="mt-2 italic text-primary-900">{{ t("formDetailed_beaconCancelMessage") }}</p>
                </div>
            </div>
        </div>

        <div class="mt-5 lg:mt-10 lg:flex lg:gap-4">
            <div class="w-full lg:mt-0">
                <LabelInput title-local="formDetailed_team" description-local="formDetailed_helpTeam" />
                <div class="mt-2 flex w-full flex-col">
                    <select
                        class="w-full focus:border-secondary-500 focus:ring-secondary-500"
                        :class="formErrorMessage ? 'border-red-500 dark:border-red-500' : 'border-gray-400'"
                        v-model="formTeam"
                        :disabled="formSubmittingEmergency"
                    >
                        <option :value="true">{{ t("formDetailed_yes") }}</option>
                        <option :value="false">{{ t("formDetailed_no") }}</option>
                    </select>
                    <div v-if="formTeam" v-auto-animate>
                        <div v-for="index in formTeamDetails.length" :key="index" class="mt-2 flex items-center justify-between gap-4">
                            <input
                                type="text"
                                class="input-text w-full flex-grow text-sm"
                                :class="formErrorMessage ? 'border-red-500 dark:border-red-500' : 'border-gray-400'"
                                :disabled="formSubmittingEmergency"
                                v-model="formTeamDetails[index - 1]"
                                :placeholder="t('formDetailed_placeholderTeam')"
                            />
                            <PlusIcon v-if="formTeamDetails.length === index" class="h-6 w-6 cursor-pointer" @click="formTeamDetails.push('')" />
                            <MinusIcon v-else class="h-6 w-6 cursor-pointer" @click="formTeamDetails.splice(index - 1, 1)" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-5 w-full lg:mt-0">
                <LabelInput title-local="formDetailed_enemies" description-local="formDetailed_helpEnemies" />
                <div class="mt-2 flex w-full flex-col">
                    <select
                        class="w-full focus:border-secondary-500 focus:ring-secondary-500"
                        :class="formErrorMessage ? 'border-red-500 dark:border-red-500' : 'border-gray-400'"
                        v-model="formEnemies"
                        :disabled="formSubmittingEmergency"
                    >
                        <option :value="true">{{ t("formDetailed_yes") }}</option>
                        <option :value="false">{{ t("formDetailed_no") }}</option>
                    </select>
                    <input
                        type="text"
                        class="input-text mt-2 w-full flex-grow"
                        v-if="formEnemies"
                        :class="formErrorMessage ? 'border-red-500 dark:border-red-500' : 'border-gray-400'"
                        :disabled="formSubmittingEmergency"
                        v-model="formEnemiesDetails"
                        :placeholder="t('formDetailed_placeholderEnemies')"
                    />
                </div>
            </div>
        </div>

        <div class="mt-5 lg:mt-10 lg:flex lg:gap-4">
            <div class="w-full lg:mt-0">
                <LabelInput title-local="formDetailed_death" description-local="formDetailed_helpDeath" />
                <div class="mt-2 flex w-full items-center">
                    <input
                        type="number"
                        max="24"
                        min="0"
                        class="input-text w-20"
                        :class="formErrorMessage ? 'border-red-500 dark:border-red-500' : 'border-gray-400'"
                        :disabled="formSubmittingEmergency"
                        v-model="formTimeDeathHours"
                    />
                    <p class="ml-2 mr-4">{{ t("formDetailed_hours") }}</p>

                    <input
                        type="number"
                        max="60"
                        min="0"
                        class="input-text w-20"
                        :class="formErrorMessage ? 'border-red-500 dark:border-red-500' : 'border-gray-400'"
                        :disabled="formSubmittingEmergency"
                        v-model="formTimeDeathMinutes"
                    />
                    <p class="ml-2">{{ t("formDetailed_minutes") }}</p>
                </div>
            </div>

            <div class="mt-5 w-full lg:mt-0">
                <LabelInput title-local="formDetailed_crimestat" description-local="formDetailed_helpCrimestat" />
                <div class="mt-2 flex w-full flex-col">
                    <select
                        class="w-full focus:border-secondary-500 focus:ring-secondary-500"
                        :class="formErrorMessage ? 'border-red-500 dark:border-red-500' : 'border-gray-400'"
                        v-model="formCrimeStat"
                        :disabled="formSubmittingEmergency"
                    >
                        <option value="No">{{ t("formDetailed_no") }}</option>
                        <option value="Level 1">{{ t("formDetailed_level") }} 1</option>
                        <option value="Level 2">{{ t("formDetailed_level") }} 2</option>
                        <option value="Level 3">{{ t("formDetailed_level") }} 3</option>
                        <option value="Level 4">{{ t("formDetailed_level") }} 4</option>
                        <option value="Level 5">{{ t("formDetailed_level") }} 5</option>
                    </select>
                    <input
                        type="text"
                        class="input-text mt-2 w-full flex-grow"
                        v-if="formCrimeStat && formCrimeStat !== 'No'"
                        :class="formErrorMessage ? 'border-red-500 dark:border-red-500' : 'border-gray-400'"
                        :disabled="formSubmittingEmergency"
                        v-model="formCrimeStatReason"
                        :placeholder="t('formDetailed_placeholderCrimestat')"
                    />
                </div>
            </div>
        </div>

        <div class="mt-5 w-full lg:mt-10">
            <LabelInput title-local="formDetailed_ship" description-local="formDetailed_helpShip" />
            <div class="mt-2 flex w-full">
                <input
                    type="text"
                    class="input-text w-full flex-grow"
                    :class="formErrorMessage ? 'border-red-500 dark:border-red-500' : 'border-gray-400'"
                    :disabled="formSubmittingEmergency"
                    v-model="formShip"
                    :placeholder="t('formDetailed_placeholderShip')"
                />
            </div>
        </div>

        <div class="mt-5 w-full lg:mt-10">
            <LabelInput title-local="form_remarks" description-local="form_helpRemarks" />
            <div class="mt-2">
                <textarea
                    class="w-full focus:border-secondary-500 focus:ring-secondary-500"
                    :class="formErrorMessage ? 'border-red-500 dark:border-red-500' : 'border-gray-400'"
                    rows="4"
                    v-model="formRemarks"
                    :disabled="formSubmittingEmergency"
                />
            </div>
        </div>

        <div class="mt-5 flex flex-col lg:flex-row">
            <button
                type="submit"
                class="flex w-full items-center justify-center bg-primary-900 px-6 py-3 font-medium text-gray-50 lg:mr-5 lg:w-fit"
                :disabled="formSubmittingEmergency"
            >
                <svg
                    v-if="formSubmittingEmergency"
                    class="mx-14 my-0.5 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <span v-else>{{ t("formDetailed_sendButton") }}</span>
            </button>

            <button
                @click.prevent="$emit('close')"
                class="mt-5 flex w-full items-center justify-center border-2 border-primary-900 px-6 py-3 font-medium text-primary-900 dark:text-slate-50 lg:mt-0 lg:w-fit"
                :disabled="formSubmittingEmergency"
            >
                {{ t("formDetailed_skipButton") }}
            </button>
        </div>
        <p v-if="formErrorMessage" class="mt-2 w-full text-sm text-red-500">
            {{ formErrorMessage }}
        </p>
    </form>

    <div class="border-b border-gray-200 py-5 dark:border-stone-700"></div>
</template>

<style scoped></style>
