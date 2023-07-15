<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import LabelEmergencyForm from "@/components/LabelInput.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";

const emergencyStore = useEmergencyStore();
const { t } = useI18n();

const emit = defineEmits(["close"]);

const formErrorMessage = ref("");
const formSubmittingEmergency = ref(false);
const formSituation = ref("");
const formLocation = ref("");
const formInjuries = ref();
const formInjuriesDetails = ref("");
const formIGBeacon = ref();
const formTeam = ref();
const formTeamDetails = ref("");
const formEnemies = ref();
const formEnemiesDetails = ref("");
const formRemarks = ref("");

async function sendDetails(): Promise<void> {
    try {
        formSubmittingEmergency.value = true;

        await emergencyStore.sendEmergencyMessage({
            emergencyId: emergencyStore.trackedEmergency.id,
            contents: `
            ## Emergency details from Client

            __The client's situation is:__  **${formSituation.value ? formSituation.value : "Unknown"}**

            __The client is located:__  **${formLocation.value ? formLocation.value : "Unknown"}**

            __Is the client injured:__  **${formInjuries.value === true ? "Yes" : formInjuries.value === false ? "No" : "Unknown"}**
            ${
                formInjuriesDetails.value
                    ? `
            > ${formInjuriesDetails.value}
            `
                    : ""
            }
            __Has the client sent an IG beacon:__  **${formIGBeacon.value === true ? "Yes" : formIGBeacon.value === false ? "No" : "Unknown"}**

            __Is the client in a team?__  **${formTeam.value === true ? "Yes" : formTeam.value === false ? "No" : "Unknown"}**
            ${
                formTeamDetails.value
                    ? `
            > ${formTeamDetails.value}
            `
                    : ""
            }
            __Are there enemies nearby?__  **${formEnemies.value === true ? "Yes" : formEnemies.value === false ? "No" : "Unknown"}**
            ${
                formEnemiesDetails.value
                    ? `
            > ${formEnemiesDetails.value}
            `
                    : ""
            }
            __Remarks:__

            > ${formRemarks.value ? formRemarks.value : "None"}
            `,
        });

        formSubmittingEmergency.value = false;
        formErrorMessage.value = "";
        formSubmittingEmergency.value = false;
        formSituation.value = "";
        formLocation.value = "";
        formInjuries.value = false;
        formInjuriesDetails.value = "";
        formIGBeacon.value = false;
        formTeam.value = false;
        formTeamDetails.value = "";
        formEnemies.value = false;
        formEnemiesDetails.value = "";
        formRemarks.value = "";

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
                <LabelEmergencyForm title-local="formDetailed_situation" description-local="formDetailed_helpSituation" />
                <div class="mt-2">
                    <select
                        class="w-full focus:border-secondary-500 focus:ring-secondary-500"
                        :class="formErrorMessage ? 'border-primary-400' : 'border-gray-400'"
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
                <LabelEmergencyForm title-local="formDetailed_location" description-local="formDetailed_helpLocation" />
                <div class="mt-2 flex w-full">
                    <input
                        type="text"
                        class="input-text w-full flex-grow"
                        :class="formErrorMessage ? 'border-primary-400' : 'border-gray-400'"
                        :disabled="formSubmittingEmergency"
                        v-model="formLocation"
                        :placeholder="t('formDetailed_placeholderLocation')"
                    />
                </div>
            </div>
        </div>

        <div class="mt-5 lg:mt-10 lg:flex lg:gap-4">
            <div class="w-full">
                <LabelEmergencyForm title-local="formDetailed_injury" description-local="formDetailed_helpInjury" />
                <div class="mt-2 flex w-full flex-col">
                    <select
                        class="w-full focus:border-secondary-500 focus:ring-secondary-500"
                        :class="formErrorMessage ? 'border-primary-400' : 'border-gray-400'"
                        v-model="formInjuries"
                        :disabled="formSubmittingEmergency"
                    >
                        <option :value="true">{{ t("formDetailed_yes") }}</option>
                        <option :value="false">{{ t("formDetailed_no") }}</option>
                    </select>
                    <input
                        type="text"
                        class="input-text mt-2 w-full flex-grow"
                        v-if="formInjuries"
                        :class="formErrorMessage ? 'border-primary-400' : 'border-gray-400'"
                        :disabled="formSubmittingEmergency"
                        v-model="formInjuriesDetails"
                        :placeholder="t('formDetailed_placeholderInjury')"
                    />
                </div>
            </div>

            <div class="mt-5 w-full lg:mt-0">
                <LabelEmergencyForm title-local="formDetailed_beacon" description-local="formDetailed_helpBeacon" alignment="left" />
                <div class="mt-2 flex w-full flex-col">
                    <select
                        class="w-full focus:border-secondary-500 focus:ring-secondary-500"
                        :class="formErrorMessage ? 'border-primary-400' : 'border-gray-400'"
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
                <LabelEmergencyForm title-local="formDetailed_team" description-local="formDetailed_helpTeam" />
                <div class="mt-2 flex w-full flex-col">
                    <select
                        class="w-full focus:border-secondary-500 focus:ring-secondary-500"
                        :class="formErrorMessage ? 'border-primary-400' : 'border-gray-400'"
                        v-model="formTeam"
                        :disabled="formSubmittingEmergency"
                    >
                        <option :value="true">{{ t("formDetailed_yes") }}</option>
                        <option :value="false">{{ t("formDetailed_no") }}</option>
                    </select>
                    <input
                        type="text"
                        class="input-text mt-2 w-full flex-grow"
                        v-if="formTeam"
                        :class="formErrorMessage ? 'border-primary-400' : 'border-gray-400'"
                        :disabled="formSubmittingEmergency"
                        v-model="formTeamDetails"
                        :placeholder="t('formDetailed_placeholderTeam')"
                    />
                </div>
            </div>

            <div class="mt-5 w-full lg:mt-0">
                <LabelEmergencyForm title-local="formDetailed_enemies" description-local="formDetailed_helpEnemies" />
                <div class="mt-2 flex w-full flex-col">
                    <select
                        class="w-full focus:border-secondary-500 focus:ring-secondary-500"
                        :class="formErrorMessage ? 'border-primary-400' : 'border-gray-400'"
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
                        :class="formErrorMessage ? 'border-primary-400' : 'border-gray-400'"
                        :disabled="formSubmittingEmergency"
                        v-model="formEnemiesDetails"
                        :placeholder="t('formDetailed_placeholderEnemies')"
                    />
                </div>
            </div>
        </div>

        <div class="mt-5 w-full lg:mt-10">
            <LabelEmergencyForm title-local="form_remarks" description-local="form_helpRemarks" />
            <div class="mt-2">
                <textarea
                    class="w-full focus:border-secondary-500 focus:ring-secondary-500"
                    :class="formErrorMessage ? 'border-primary-400' : 'border-gray-400'"
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
        <p v-if="formErrorMessage" class="mt-2 w-full text-sm text-primary-400">
            {{ formErrorMessage }}
        </p>
    </form>

    <div class="border-b border-gray-200 py-5 dark:border-stone-700"></div>
</template>

<style scoped></style>
