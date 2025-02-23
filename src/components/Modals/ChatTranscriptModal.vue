<script setup lang="ts">
import type { ChatMessage, TeamMember } from "@medrunner/api-client";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import ChatMessagesContainer from "@/components/Emergency/ChatMessagesContainer.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalLoader from "@/components/utils/GlobalLoader.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useUserStore } from "@/stores/userStore";
import { errorString } from "@/utils/functions/stringFunctions.ts";

const { t } = useI18n();
const userStore = useUserStore();
const emergencyStore = useEmergencyStore();

export interface Props {
    emergencyId: string;
    respondingTeam: TeamMember[];
}

const props = defineProps<Props>();
const emit = defineEmits(["close"]);

const chatMessages = ref<ChatMessage[]>([]);
const loadingChatMessages = ref(false);
const errorLoadingMessages = ref();
const errorLoadingAdditionalMessages = ref("");
const paginationToken = ref<string | undefined>();

onMounted(async () => {
    try {
        loadingChatMessages.value = true;
        const response = await emergencyStore.fetchChatHistory(props.emergencyId);
        chatMessages.value = response.data;
        paginationToken.value = response.paginationToken;
    } catch (error: any) {
        errorLoadingMessages.value = errorString(error.statusCode);
    } finally {
        loadingChatMessages.value = false;
    }
});

async function loadAdditionalMessages(): Promise<void> {
    if (paginationToken.value) {
        try {
            const response = await emergencyStore.fetchChatHistory(props.emergencyId, paginationToken.value);
            chatMessages.value = chatMessages.value.concat(response.data);
            if (paginationToken.value !== response.paginationToken) paginationToken.value = response.paginationToken;
            else paginationToken.value = undefined;
        } catch (error: any) {
            errorLoadingAdditionalMessages.value = errorString(error.statusCode);
        }
    } else return;
}
</script>

<template>
    <ModalContainer v-slot="modalContainer" :title="t('history_messagesTranscript')" @close="emit('close')">
        <div v-if="loadingChatMessages" class="flex h-[45vh] w-full items-center justify-center">
            <GlobalLoader width="w-8" height="h-8" text-size="text-md" spacing="mb-4" />
        </div>
        <div v-else-if="!loadingChatMessages && errorLoadingMessages" class="my-24 flex w-full items-center justify-center">
            <GlobalErrorText :text="errorLoadingMessages" />
        </div>
        <ChatMessagesContainer
            v-else
            :messages="chatMessages"
            :emergency-members="props.respondingTeam"
            :user="userStore.user"
            :error-loading-additional-messages
            :keep-scroll-position="true"
            :is-transcript="true"
            class="mt-4"
            @load-new-messages="loadAdditionalMessages()"
        />
        <GlobalButton type="secondary" size="full" class="mt-4 w-full lg:w-fit" @click="modalContainer.close()">{{ t("button_close") }}</GlobalButton>
    </ModalContainer>
</template>

<style scoped></style>
