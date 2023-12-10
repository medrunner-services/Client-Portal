<script setup lang="ts">
import type { ChatMessage } from "@medrunner-services/api-client";
import { toHTML } from "discord-markdown";
import { computed, type ComputedRef, nextTick, onMounted, type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalTextInput from "@/components/utils/GlobalTextInput.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";
import { ws } from "@/utils/medrunnerClient";

const { t } = useI18n();
const emergencyStore = useEmergencyStore();
const userStore = useUserStore();
const logicStore = useLogicStore();

const inputMessage = ref("");
const sendingMessage = ref(false);
const errorSendingMessage = ref("");
const errorLoadingMessages = ref("");

const chatBox: Ref<HTMLDivElement | null> = ref(null);

onMounted(async () => {
    try {
        emergencyStore.trackedEmergencyMessages = await emergencyStore.fetchChatHistory(emergencyStore.trackedEmergency.id);
    } catch (error) {
        errorLoadingMessages.value = t("error_generic");
    }

    ws.on("ChatMessageCreate", async (newMessage: ChatMessage) => {
        if (
            newMessage.emergencyId === emergencyStore.trackedEmergency.id &&
            !emergencyStore.trackedEmergencyMessages.some((message) => message.id === newMessage.id)
        ) {
            emergencyStore.trackedEmergencyMessages.push(newMessage);

            if (
                logicStore.isNotificationGranted &&
                newMessage.senderId !== userStore.user.id &&
                !document.hasFocus() &&
                (newMessage.contents.includes(`@${userStore.user.rsiHandle}`) || newMessage.contents.includes(`@${userStore.user.discordId}`))
            ) {
                const notification = new Notification(t("tracking_newMessage"), {
                    body: replaceAtMentions(newMessage.contents, newMessage.senderId, false),
                    icon: "/images/medrunner-logo-square.webp",
                });

                notification.onclick = () => {
                    window.focus();
                };
            }
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

const sortedMessages: ComputedRef<ChatMessage[]> = computed(() => {
    return [...emergencyStore.trackedEmergencyMessages]
        .filter((obj) => obj.contents !== undefined)
        .sort((a, b) => Date.parse(a.created) - Date.parse(b.created));
});

function parseChatMessageString(message: ChatMessage): string {
    const htmlMessage = toHTML(message.contents);
    const timestampDeath = htmlMessage.match(/&lt;t:(.*?)(?=:R&gt;)/g);
    let stringTimestampDeath;
    if (timestampDeath && timestampDeath[0]) {
        stringTimestampDeath = logicStore.timestampToHours(parseInt(timestampDeath[0].substring(6)) * 1000);
    }

    const htmlMessageParsedMentions = replaceAtMentions(htmlMessage, message.senderId, true);

    return htmlMessageParsedMentions
        .replace(/&lt;|&gt;/g, "")
        .replace(/##(.*?)(?=<br>)/g, '<span style="font-weight: bold; font-size: 1.4rem;">\n$1\n</span>')
        .replace(/<u>Time(.*?)(?=<)/g, '<span style="text-decoration: underline">Time of client death:</span>')
        .replace(/t:(.*?):R/g, stringTimestampDeath ? `${stringTimestampDeath}` : "");
}

function replaceAtMentions(message: string, senderId: string, html: boolean): string {
    const memberIdToNameMap: any = {};
    emergencyStore.trackedEmergency.respondingTeam.allMembers.forEach((member) => {
        memberIdToNameMap[member.discordId] = member.rsiHandle;
    });

    if (html) {
        return message
            .replace(
                new RegExp(`@${userStore.user.rsiHandle}`, "g"),
                `<span class=" p-1 font-medium ${
                    senderId === userStore.user.id ? "bg-white/30" : "bg-gray-500/20 dark:bg-gray-400/20"
                } rounded-lg">@${userStore.user.rsiHandle}</span>`,
            )
            .replace(
                new RegExp(`@${userStore.user.discordId}`, "g"),
                `<span class=" p-1 font-medium ${
                    senderId === userStore.user.id ? "bg-white/30" : "bg-gray-500/20 dark:bg-gray-400/20"
                } rounded-lg">@${userStore.user.rsiHandle}</span>`,
            )
            .replace(/@\d+/g, (match) => {
                const memberId = match.substring(1);
                return memberIdToNameMap[memberId] ? `@${memberIdToNameMap[memberId]}` : match;
            });
    } else {
        return message
            .replace(new RegExp(`<@${userStore.user.discordId}>`, "g"), `@${userStore.user.rsiHandle}`)
            .replace(/<@(\d+)>/g, (match, memberId) => {
                return memberIdToNameMap[memberId] ? `@${memberIdToNameMap[memberId]}` : match;
            });
    }
}

function getMessageAuthor(message: ChatMessage): string {
    let author;
    const teamMember = emergencyStore.trackedEmergency.respondingTeam.staff.find((staff) => staff.id === message.senderId);
    const dispatchMember = emergencyStore.trackedEmergency.respondingTeam.dispatchers.find((staff) => staff.id === message.senderId);

    if (message.senderId === userStore.user.id) {
        author = userStore.user.rsiHandle;
    } else if (teamMember) {
        author = teamMember.rsiHandle;
    } else if (dispatchMember) {
        author = dispatchMember.rsiHandle;
    } else {
        author = "Medrunner Staff";
    }

    return `${author}`;
}

async function sendMessage() {
    errorSendingMessage.value = "";

    try {
        sendingMessage.value = true;
        await emergencyStore.sendEmergencyMessage({
            emergencyId: emergencyStore.trackedEmergency.id,
            contents: inputMessage.value,
        });

        inputMessage.value = "";
    } catch (error: any) {
        if (error.statusCode === 429) errorSendingMessage.value = t("error_rateLimit");
        else errorSendingMessage.value = t("error_generic");
    } finally {
        sendingMessage.value = false;
    }
}

function isMessageAuthor(id: string): boolean {
    return id === userStore.user.id;
}
</script>

<template>
    <div>
        <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("tracking_chatTitle") }}</h2>

        <GlobalCard class="mt-8 !p-3 lg:!p-6">
            <div v-if="errorLoadingMessages" class="flex w-full items-center justify-center">
                <GlobalErrorText :text="errorLoadingMessages" />
            </div>

            <div v-else>
                <div id="chatBox" ref="chatBox" class="flex h-[45vh] flex-col overflow-y-scroll">
                    <div
                        v-for="message in sortedMessages"
                        :key="message.id"
                        class="mt-4 flex max-w-[80%] flex-col rounded-lg border border-gray-200 px-2 pb-1 pt-2 first:mt-0 dark:border-gray-700 lg:px-4"
                        :class="isMessageAuthor(message.senderId) ? 'self-end bg-primary-600 text-white lg:mr-6' : ''"
                    >
                        <p v-if="!isMessageAuthor(message.senderId)" class="text-sm font-bold">{{ getMessageAuthor(message) }}</p>
                        <p class="mt-1 break-all" v-html="parseChatMessageString(message)"></p>
                        <p class="mt-1 self-end text-xs">{{ logicStore.timestampToHours(message.messageSentTimestamp) }}</p>
                    </div>

                    <div id="anchor"></div>
                </div>

                <div class="mt-5 rounded-lg bg-gray-100 p-3 dark:bg-gray-900">
                    <form class="flex items-center dark:bg-gray-900" @submit.prevent="sendMessage()">
                        <GlobalTextInput
                            :required="true"
                            v-model="inputMessage"
                            class="mr-4 w-full"
                            :placeholder="t('tracking_placeholderMessageInput')"
                        />
                        <button type="submit" class="justify-center text-primary-600">
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
