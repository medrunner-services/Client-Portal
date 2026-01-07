<script setup lang="ts">
import type { WebSocketMessage } from "@/@types/types.ts";
import type GlobalTextInput from "@/components/utils/GlobalTextInput.vue";
import { computed, nextTick, onMounted, ref } from "vue";

import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { AlertColors, MessageNotification } from "@/@types/types.ts";
import ChatMessagesContainer from "@/components/Emergency/ChatMessagesContainer.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalTextAreaInput from "@/components/utils/GlobalTextAreaInput.vue";
import { useAlertStore } from "@/stores/alertStore.ts";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useLogicStore } from "@/stores/logicStore.ts";
import { useUserStore } from "@/stores/userStore";
import { sendBrowserNotification } from "@/utils/functions/notificationFunctions.ts";
import { errorString, replaceAtMentions } from "@/utils/functions/stringFunctions.ts";
import { ws } from "@/utils/medrunnerClient";

const props = withDefaults(defineProps<Props>(), {
    isPopupWindow: false,
});
const { t } = useI18n();
const emergencyStore = useEmergencyStore();
const userStore = useUserStore();
const router = useRouter();
const alertStore = useAlertStore();
const logicStore = useLogicStore();

const inputMessage = ref("");
const errorSendingMessage = ref("");
const errorLoadingMessages = ref("");
const editingMessageId = ref<string | undefined>();
const originalEditedMessage = ref<string>();
const messageInputRef = ref<InstanceType<typeof GlobalTextInput>>();
let chatPopOutWindow: Window | null = null;

export interface Props {
    isPopupWindow?: boolean;
}

onMounted(async () => {
    try {
        emergencyStore.trackedEmergencyMessages = (await emergencyStore.fetchChatHistory(emergencyStore.trackedEmergency!.id)).data;
    }
    catch (error: any) {
        errorLoadingMessages.value = errorString(error.statusCode);
    }

    ws.on("ChatMessageCreate", async (message: WebSocketMessage) => {
        try {
            const newMessage = await emergencyStore.fetchChatMessage(message.id);

            if (
                emergencyStore.trackedEmergency
                && newMessage.emergencyId === emergencyStore.trackedEmergency.id
                && !emergencyStore.trackedEmergencyMessages.some(trackedMessage => trackedMessage.id === message.id)
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
                            void router.push({ name: "emergency" });
                        });
                    }
                    else if (userStore.syncedSettings.chatMessageNotification === MessageNotification.PING) {
                        if (
                            newMessage.contents.includes(`@${userStore.user.rsiHandle}`)
                            || newMessage.contents.includes(`@${userStore.user.discordId}`)
                        ) {
                            await sendBrowserNotification(t("tracking_newMessage"), notificationTag, bodyNotification, () => {
                                window.focus();
                                void router.push({ name: "emergency" });
                            });
                        }
                    }
                }
            }
        }
        catch (_e) {
            alertStore.newAlert(AlertColors.RED, t("error_globalLoading"), false, "warning", 5000);
        }
    });

    ws.on("ChatMessageUpdate", async (message: WebSocketMessage) => {
        try {
            const updatedMessage = await emergencyStore.fetchChatMessage(message.id);

            if (emergencyStore.trackedEmergency) {
                const messageIndex = emergencyStore.trackedEmergencyMessages.findIndex(message => message.id === updatedMessage.id);

                if (messageIndex !== -1) {
                    emergencyStore.trackedEmergencyMessages[messageIndex] = updatedMessage;
                }
            }
        }
        catch (_e) {
            alertStore.newAlert(AlertColors.RED, t("error_globalLoading"), false, "warning", 5000);
        }
    });

    ws.onreconnected(async () => {
        if (emergencyStore.trackedEmergency)
            emergencyStore.trackedEmergencyMessages = (await emergencyStore.fetchChatHistory(emergencyStore.trackedEmergency.id)).data;
    });
});

const isInvalidChatInput = computed(() => {
    if (inputMessage.value) {
        return inputMessage.value.length > 4000;
    }
    else {
        return false;
    }
});

async function sendMessage() {
    if (!inputMessage.value || isInvalidChatInput.value)
        return;
    errorSendingMessage.value = "";

    try {
        const messageTime = new Date().toISOString();

        if (emergencyStore.trackedEmergency) {
            if (editingMessageId.value) {
                if (originalEditedMessage.value === inputMessage.value) {
                    escapeEditingMessage();
                    return;
                }
                await emergencyStore.updateEmergencyMessage(editingMessageId.value, inputMessage.value);

                editingMessageId.value = undefined;
                inputMessage.value = "";
            }
            else {
                const messageContent = inputMessage.value;
                inputMessage.value = "";

                emergencyStore.trackedEmergencyMessages.push({
                    local: true,
                    error: false,
                    emergencyId: emergencyStore.trackedEmergency.id,
                    senderId: userStore.user.id,
                    contents: messageContent,
                    edited: false,
                    deleted: false,
                    updated: messageTime,
                    id: "",
                    created: messageTime,
                });

                const newMessage = await emergencyStore.sendEmergencyMessage({
                    emergencyId: emergencyStore.trackedEmergency.id,
                    contents: messageContent,
                });

                const tempMessageIndex = emergencyStore.trackedEmergencyMessages.findIndex(message => message.created === messageTime);
                const networkMessageIndex = emergencyStore.trackedEmergencyMessages.findIndex(message => message.id === newMessage.id);

                if (networkMessageIndex !== -1)
                    emergencyStore.trackedEmergencyMessages.splice(tempMessageIndex, 1);
                else if (tempMessageIndex !== -1)
                    emergencyStore.trackedEmergencyMessages[tempMessageIndex] = newMessage;
            }
        }
        else {
            alertStore.newAlert(AlertColors.RED, t("error_failedMessage"));
            const tempMessageIndex = emergencyStore.trackedEmergencyMessages.findIndex(message => message.created === messageTime);
            if (tempMessageIndex !== -1) {
                if ("error" in emergencyStore.trackedEmergencyMessages[tempMessageIndex])
                    emergencyStore.trackedEmergencyMessages[tempMessageIndex].error = true;
            }
        }
    }
    catch (error: any) {
        errorSendingMessage.value = errorString(error.statusCode);
    }
    finally {
        await nextTick(() => {
            messageInputRef.value?.focus();
        });
    }
}

async function handleDeleteMessage(id: string) {
    try {
        await emergencyStore.deleteEmergencyMessage(id);
    }
    catch (error: any) {
        alertStore.newAlert(AlertColors.YELLOW, errorString(error.statusCode, t("error_deletingChatMessage")));
    }
}

async function handleEditMessage(id: string, content: string) {
    inputMessage.value = content;
    originalEditedMessage.value = content;
    editingMessageId.value = id;

    await nextTick(() => {
        messageInputRef.value?.focus();
    });
}

function escapeEditingMessage() {
    inputMessage.value = "";
    errorSendingMessage.value = "";
    originalEditedMessage.value = undefined;
    editingMessageId.value = undefined;
}

async function editLastMessage() {
    if (inputMessage.value)
        return;
    const lastMessage = emergencyStore.trackedEmergencyMessages
        .filter(message => message.senderId === userStore.user.id)
        .filter(message => !message.deleted)
        .sort((a, b) => Date.parse(b.created) - Date.parse(a.created))[0];

    if (lastMessage) {
        await handleEditMessage(lastMessage.id, lastMessage.contents);
    }
}

function popOutChatWindow() {
    chatPopOutWindow = window.open(`/popout/chat`, "ChatPopup", "width=900,height=900,popup=true");
    logicStore.isChatHidden = true;

    if (chatPopOutWindow) {
        const checkWindowClosed = setInterval(() => {
            if (chatPopOutWindow && chatPopOutWindow.closed) {
                logicStore.isChatHidden = false;
                clearInterval(checkWindowClosed);
            }
        }, 1000);
    }
}
</script>

<template>
    <div :class="props.isPopupWindow ? 'h-full' : ''">
        <div v-if="!props.isPopupWindow" class="mb-8 flex min-h-11 items-center justify-between">
            <h2 class="font-Mohave text-2xl font-semibold uppercase">
                {{ t("tracking_chatTitle") }}
            </h2>
            <svg
                v-if="!logicStore.isChatHidden"
                class="
                    size-6 cursor-pointer text-gray-900
                    dark:text-white
                "
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                @click="popOutChatWindow"
            >
                <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778"
                />
            </svg>
        </div>

        <GlobalCard
            class="" :class="props.isPopupWindow ? 'h-full' : `
                p-3!
                lg:p-6!
            `"
        >
            <div v-if="errorLoadingMessages" class="flex w-full items-center justify-center">
                <GlobalErrorText :text="errorLoadingMessages" />
            </div>

            <div v-else-if="logicStore.isChatHidden" class="flex w-full flex-col items-center justify-center gap-4">
                <div class="flex items-center font-semibold">
                    <svg
                        class="
                            mr-4 h-5 w-5 text-gray-900
                            dark:text-white
                        "
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm9.4-5.5a1 1 0 1 0 0 2 1 1 0 1 0 0-2ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4c0-.6-.4-1-1-1h-2Z"
                            clip-rule="evenodd"
                        />
                    </svg>

                    <p>{{ t("tracking_infoPopOutChat") }}</p>
                </div>

                <GlobalButton @click="logicStore.isChatHidden = false">
                    {{ t("tracking_showChat") }}
                </GlobalButton>
            </div>

            <div v-else-if="emergencyStore.trackedEmergency" :class="props.isPopupWindow ? 'flex h-full flex-col' : ''">
                <ChatMessagesContainer
                    :messages="emergencyStore.trackedEmergencyMessages"
                    :emergency-members="emergencyStore.trackedEmergency.respondingTeam.allMembers"
                    :user="userStore.user"
                    :is-popup-window="props.isPopupWindow"
                    @edit-message="(id, content) => handleEditMessage(id, content)"
                    @delete-message="(id) => handleDeleteMessage(id)"
                />

                <div
                    class="
                        mt-5 rounded-lg bg-gray-100 px-3 pt-3 pb-1.5
                        dark:bg-gray-900
                    " :class="{ 'border border-primary-600': editingMessageId }"
                >
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

                        <p class="text-sm font-semibold">
                            {{ t("tracking_editingMessage") }}
                        </p>
                    </div>

                    <form
                        class="
                            flex items-center gap-4
                            dark:bg-gray-900
                        " @submit.prevent="sendMessage()"
                    >
                        <GlobalTextAreaInput
                            ref="messageInputRef"
                            v-model="inputMessage"
                            :required="true"
                            class="w-full"
                            :placeholder="t('tracking_placeholderMessageInput')"
                            :rows="1"
                            :auto-grow="true"
                            :error="isInvalidChatInput"
                            max-height="max-h-40"
                            @keydown.enter.exact.prevent="sendMessage()"
                            @keydown.esc="escapeEditingMessage()"
                            @keydown.prevent.up="editLastMessage()"
                        />
                        <button
                            type="submit"
                            :disabled="isInvalidChatInput"
                            class="
                                mb-1 cursor-pointer justify-center text-primary-600
                                disabled:cursor-not-allowed disabled:text-primary-600/50
                            "
                        >
                            <svg
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

                    <GlobalErrorText v-if="errorSendingMessage" class="mt-3 w-full text-sm" :icon="false" :text="errorSendingMessage" />
                    <GlobalErrorText v-if="isInvalidChatInput" class="mt-3 w-full text-sm" :icon="false" :text="t('error_chatMessageTooLong')" />
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
