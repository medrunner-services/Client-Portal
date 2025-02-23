<script setup lang="ts">
import type { ChatMessage } from "@medrunner/api-client";
import { nextTick, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import ChatMessagesContainer from "@/components/Emergency/ChatMessagesContainer.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalTextAreaInput from "@/components/utils/GlobalTextAreaInput.vue";
import GlobalTextInput from "@/components/utils/GlobalTextInput.vue";
import { useAlertStore } from "@/stores/alertStore.ts";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useUserStore } from "@/stores/userStore";
import { AlertColors, MessageNotification } from "@/types";
import { sendBrowserNotification } from "@/utils/functions/notificationFunctions.ts";
import { errorString, replaceAtMentions } from "@/utils/functions/stringFunctions.ts";
import { ws } from "@/utils/medrunnerClient";

const { t } = useI18n();
const emergencyStore = useEmergencyStore();
const userStore = useUserStore();
const router = useRouter();
const alertStore = useAlertStore();

const inputMessage = ref("");
const sendingMessage = ref(false);
const errorSendingMessage = ref("");
const errorLoadingMessages = ref("");
const editingMessageId = ref<string | undefined>();
const originalEditedMessage = ref<string>();
const messageInputRef = ref<InstanceType<typeof GlobalTextInput>>();

onMounted(async () => {
    try {
        emergencyStore.trackedEmergencyMessages = (await emergencyStore.fetchChatHistory(emergencyStore.trackedEmergency!.id)).data;
    } catch (error: any) {
        errorLoadingMessages.value = errorString(error.statusCode);
    }

    ws.on("ChatMessageCreate", async (newMessage: ChatMessage) => {
        if (
            emergencyStore.trackedEmergency &&
            newMessage.emergencyId === emergencyStore.trackedEmergency.id &&
            !emergencyStore.trackedEmergencyMessages.some((message) => message.id === newMessage.id)
        ) {
            emergencyStore.trackedEmergencyMessages.push(newMessage);

            const bodyNotification = replaceAtMentions(
                newMessage.contents,
                newMessage.senderId,
                false,
                emergencyStore.trackedEmergency.respondingTeam.allMembers,
                userStore.user,
            );
            const notificationTag = `chatMessageCreate-${newMessage.id}`;

            if (newMessage.senderId !== userStore.user.id) {
                if (userStore.syncedSettings.chatMessageNotification === MessageNotification.ALL) {
                    await sendBrowserNotification(t("tracking_newMessage"), notificationTag, bodyNotification, () => {
                        window.focus();
                        router.push({ name: "emergency" });
                    });
                } else if (userStore.syncedSettings.chatMessageNotification === MessageNotification.PING) {
                    if (
                        newMessage.contents.includes(`@${userStore.user.rsiHandle}`) ||
                        newMessage.contents.includes(`@${userStore.user.discordId}`)
                    ) {
                        await sendBrowserNotification(t("tracking_newMessage"), notificationTag, bodyNotification, () => {
                            window.focus();
                            router.push({ name: "emergency" });
                        });
                    }
                }
            }
        }
    });

    ws.on("ChatMessageUpdate", async (updatedMessage: ChatMessage) => {
        if (emergencyStore.trackedEmergency) {
            const messageIndex = emergencyStore.trackedEmergencyMessages.findIndex((message) => message.id === updatedMessage.id);

            if (messageIndex !== -1) {
                emergencyStore.trackedEmergencyMessages[messageIndex] = updatedMessage;
            }
        }
    });

    ws.onreconnected(async () => {
        if (emergencyStore.trackedEmergency)
            emergencyStore.trackedEmergencyMessages = (await emergencyStore.fetchChatHistory(emergencyStore.trackedEmergency.id)).data;
    });
});

async function sendMessage() {
    if (!inputMessage.value) return;
    errorSendingMessage.value = "";

    try {
        sendingMessage.value = true;
        if (emergencyStore.trackedEmergency) {
            if (editingMessageId.value) {
                if (originalEditedMessage.value === inputMessage.value) {
                    escapeEditingMessage();
                    return;
                }
                await emergencyStore.updateEmergencyMessage(editingMessageId.value, inputMessage.value);
                editingMessageId.value = undefined;
            } else {
                await emergencyStore.sendEmergencyMessage({
                    emergencyId: emergencyStore.trackedEmergency.id,
                    contents: inputMessage.value,
                });
            }
        } else {
            alertStore.newAlert(AlertColors.RED, t("error_failedMessage"));
            return;
        }

        inputMessage.value = "";
    } catch (error: any) {
        errorSendingMessage.value = errorString(error.statusCode);
    } finally {
        sendingMessage.value = false;
    }
}

function handleEditMessage(id: string, content: string) {
    inputMessage.value = content;
    originalEditedMessage.value = content;
    editingMessageId.value = id;

    nextTick(() => {
        messageInputRef.value?.focus();
    });
}

function escapeEditingMessage() {
    inputMessage.value = "";
    errorSendingMessage.value = "";
    originalEditedMessage.value = undefined;
    editingMessageId.value = undefined;
}

function editLastMessage() {
    const lastMessage = emergencyStore.trackedEmergencyMessages
        .filter((message) => message.senderId === userStore.user.id)
        .sort((a, b) => Date.parse(b.created) - Date.parse(a.created))[0];

    console.log(lastMessage);

    if (lastMessage) {
        handleEditMessage(lastMessage.id, lastMessage.contents);
    }
}
</script>

<template>
    <div>
        <GlobalCard class="!p-3 lg:!p-6">
            <div v-if="errorLoadingMessages" class="flex w-full items-center justify-center">
                <GlobalErrorText :text="errorLoadingMessages" />
            </div>

            <div v-else-if="emergencyStore.trackedEmergency">
                <ChatMessagesContainer
                    :messages="emergencyStore.trackedEmergencyMessages"
                    :emergency-members="emergencyStore.trackedEmergency.respondingTeam.allMembers"
                    :user="userStore.user"
                    @edit-message="(id, content) => handleEditMessage(id, content)"
                />

                <div class="mt-5 rounded-lg bg-gray-100 px-3 pb-1.5 pt-3 dark:bg-gray-900" :class="{ 'border border-primary-600': editingMessageId }">
                    <div v-if="editingMessageId" class="-mt-1 mb-2 flex items-center gap-2 text-primary-600">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="size-5 cursor-pointer"
                            @click="escapeEditingMessage()"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                        </svg>

                        <p class="text-sm font-semibold">{{ t("tracking_editingMessage") }}</p>
                    </div>

                    <form class="flex items-center gap-4 dark:bg-gray-900" @submit.prevent="sendMessage()">
                        <GlobalTextAreaInput
                            ref="messageInputRef"
                            v-model="inputMessage"
                            :required="true"
                            :disabled="sendingMessage"
                            class="w-full"
                            :placeholder="t('tracking_placeholderMessageInput')"
                            :rows="1"
                            :auto-grow="true"
                            max-height="max-h-40"
                            @keydown.enter.exact="sendMessage()"
                            @keydown.esc="escapeEditingMessage()"
                            @keydown.prevent.up="editLastMessage()"
                        />
                        <button type="submit" class="mb-1 justify-center text-primary-600">
                            <svg
                                v-if="sendingMessage"
                                aria-hidden="true"
                                class="h-5 w-5 animate-spin fill-primary-600 text-gray-200 dark:text-gray-600"
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                />
                            </svg>

                            <svg
                                v-else
                                class="h-5 w-5 rotate-90"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 18 20"
                            >
                                <path
                                    d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z"
                                />
                            </svg>
                        </button>
                    </form>

                    <p v-if="errorSendingMessage" class="mt-3 w-full text-sm font-semibold text-red-600">{{ errorSendingMessage }}</p>
                </div>
            </div>
        </GlobalCard>
    </div>
</template>

<style scoped>
#chatBox * {
    overflow-anchor: none;
}

#anchor {
    overflow-anchor: auto;
    height: 1px;
}
</style>
