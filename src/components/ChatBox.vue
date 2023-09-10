<script setup lang="ts">
import { PaperAirplaneIcon } from "@heroicons/vue/24/solid";
import type { ChatMessage } from "@medrunner-services/api-client";
import { toHTML } from "discord-markdown";
import { computed, nextTick, onMounted, type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import { useEmergencyStore } from "@/stores/emergencyStore";
import { useLogicStore } from "@/stores/logicStore";
import { ws } from "@/utils/medrunnerClient";

const { t } = useI18n();
const emergencyStore = useEmergencyStore();
const logicStore = useLogicStore();

const userInputMessage = ref("");
const sendingMessage = ref(false);
const errorSendingMessage = ref("");
const chatBox: Ref<HTMLDivElement | null> = ref(null);
const inputChatBox: Ref<HTMLInputElement | null> = ref(null);

onMounted(async () => {
    emergencyStore.trackedEmergencyMessages = await emergencyStore.fetchChatHistory(emergencyStore.trackedEmergency.id);

    ws.on("ChatMessageCreate", async (newMessage: ChatMessage) => {
        if (
            newMessage.emergencyId === emergencyStore.trackedEmergency.id &&
            !emergencyStore.trackedEmergencyMessages.some(message => message.id === newMessage.id)
        ) {
            emergencyStore.trackedEmergencyMessages.push(newMessage);
        }
    });
    ws.onreconnected(async () => {
        emergencyStore.trackedEmergencyMessages = await emergencyStore.fetchChatHistory(emergencyStore.trackedEmergency.id);
    });

    if (chatBox.value) {
        await nextTick();
        chatBox.value.scrollTop = chatBox.value.scrollHeight;

        const observer = new MutationObserver(() => {
            if (chatBox.value) {
                chatBox.value.scrollTop = chatBox.value.scrollHeight;
            }
        });

        observer.observe(chatBox.value, { childList: true, subtree: true });
    }
});

function parseChatMessageString(message: string): string {
    const htmlMessage = toHTML(message);
    const timestampDeath = htmlMessage.match(/&lt;t:(.*?)(?=:R&gt;)/g);
    let stringTimestampDeath;
    if (timestampDeath && timestampDeath[0]) {
        stringTimestampDeath = logicStore.timestampToHours(parseInt(timestampDeath[0].substring(6)) * 1000);
    }

    return htmlMessage
        .replace(/&lt;|&gt;/g, "")
        .replace(/##(.*?)(?=<br>)/g, '<span style="font-weight: bold; font-size: 1.4rem;">\n$1\n</span>')
        .replace(/<u>Time(.*?)(?=<)/g, '<span style="text-decoration: underline">Time of client death:</span>')
        .replace(/&lt;t:(.*?):R&gt;/g, stringTimestampDeath ? `${stringTimestampDeath}` : "");
}

function getMessageTitle(message: ChatMessage): string {
    const timestamp = logicStore.timestampToHours(message.messageSentTimestamp);
    let author;
    const teamMember = emergencyStore.trackedEmergency.respondingTeam.staff.find(staff => staff.id === message.senderId);

    if (message.senderId === emergencyStore.trackedEmergency.clientId) {
        author = emergencyStore.trackedEmergency.clientRsiHandle;
    } else if (teamMember) {
        author = teamMember.rsiHandle;
    } else {
        author = "Medrunner Staff";
    }

    return `${author} - ${timestamp}`;
}

async function addMessage(content: string) {
    errorSendingMessage.value = "";

    try {
        sendingMessage.value = true;
        await emergencyStore.sendEmergencyMessage({
            emergencyId: emergencyStore.trackedEmergency.id,
            contents: content,
        });

        userInputMessage.value = "";
    } catch (error: any) {
        if (error.statusCode === 429) errorSendingMessage.value = t("error_rateLimit");
        else errorSendingMessage.value = t("error_generic");
    } finally {
        sendingMessage.value = false;
        inputChatBox.value?.focus();
    }
}

const sortedMessages = computed(() => {
    return emergencyStore.trackedEmergencyMessages.sort((a, b) => Date.parse(a.created) - Date.parse(b.created));
});
</script>

<template>
    <div>
        <div v-auto-animate class="h-[40vh] w-full overflow-y-scroll border-2 border-primary-900 p-3" id="chatBox" ref="chatBox">
            <div v-for="message in sortedMessages" class="w-full border-t-2 border-primary-900 py-5 first:border-t-0 last:pb-0 dark:border-stone-700">
                <p class="text-sm font-bold underline underline-offset-2">{{ getMessageTitle(message) }}</p>
                <p v-html="parseChatMessageString(message.contents)"></p>
            </div>
            <div id="anchor"></div>
        </div>

        <div class="my-5">
            <form @submit.prevent="addMessage(userInputMessage)" class="flex w-full items-center justify-between">
                <input
                    v-model="userInputMessage"
                    ref="inputChatBox"
                    required
                    type="text"
                    contenteditable
                    class="w-full border-2 px-2 py-2"
                    :class="errorSendingMessage ? 'input-text-error' : 'input-text'"
                    :placeholder="t('tracking_placeholderMessageInput')"
                />
                <div class="ml-5">
                    <svg
                        v-if="sendingMessage"
                        class="h-7 w-7 animate-spin text-primary-900"
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

                    <PaperAirplaneIcon v-else @click="addMessage(userInputMessage)" class="h-7 w-7 -rotate-45 cursor-pointer" />
                </div>
            </form>
            <p v-if="errorSendingMessage" class="mt-2 w-full text-sm text-red-500">{{ errorSendingMessage }}</p>
        </div>
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
