<script setup lang="ts">
import type { ChatMessage, Person, TeamMember } from "@medrunner/api-client";
import { toHTML } from "discord-markdown";
import DOMPurify from "dompurify";
import { computed, type ComputedRef, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import { useLogicStore } from "@/stores/logicStore";
import { replaceAtMentions } from "@/utils/stringUtils";

export interface Props {
    messages: ChatMessage[];
    emergencyMembers: TeamMember[];
    errorLoadingAdditionalMessages?: string;
    keepScrollPosition?: boolean;
    user: Person;
}

const props = withDefaults(defineProps<Props>(), {
    keepScrollPosition: false,
});
const emit = defineEmits<{
    loadNewMessages: [];
}>();

const logicStore = useLogicStore();
const { t } = useI18n();

const chatBox = ref<HTMLDivElement | null>(null);
const distanceFromBottom = ref(0);
const showFullMessage = ref<Record<string, boolean>>({});
const readMoreClicked = ref(false);

onMounted(async () => {
    if (chatBox.value) {
        chatBox.value.scrollTop = chatBox.value.scrollHeight;

        const observer = new MutationObserver(() => {
            if (chatBox.value) {
                if (!readMoreClicked.value) {
                    if (props.keepScrollPosition) {
                        chatBox.value.scrollTop = chatBox.value.scrollHeight - distanceFromBottom.value;
                    } else {
                        chatBox.value.scrollTop = chatBox.value.scrollHeight;
                    }
                } else {
                    readMoreClicked.value = false;
                }
            }
        });

        observer.observe(chatBox.value, { childList: true, subtree: true });

        chatBox.value.addEventListener("scroll", function () {
            if (chatBox.value?.scrollTop === 0) {
                distanceFromBottom.value = chatBox.value.scrollHeight - chatBox.value.scrollTop;
                emit("loadNewMessages");
            }
        });
    }
});

const sortedMessages: ComputedRef<ChatMessage[]> = computed(() => {
    return [...props.messages].filter((obj) => obj.contents !== undefined).sort((a, b) => Date.parse(a.created) - Date.parse(b.created));
});

function parseChatMessageString(message: ChatMessage): string {
    const htmlMessage = toHTML(message.contents);
    let sanitizedHtmlMessage = DOMPurify.sanitize(htmlMessage);
    const timestampDeath = sanitizedHtmlMessage.match(/&lt;t:(.*?)(?=:R&gt;)/g);
    let stringTimestampDeath;
    if (timestampDeath && timestampDeath[0]) {
        stringTimestampDeath = logicStore.timestampToHours(parseInt(timestampDeath[0].substring(6)) * 1000);
    }

    const htmlMessageParsedMentions = replaceAtMentions(sanitizedHtmlMessage, message.senderId, true, props.emergencyMembers, props.user);

    return htmlMessageParsedMentions
        .replace(/&lt;|&gt;/g, "")
        .replace(/##(.*?)(?=<br>)/g, '<span style="font-weight: bold; font-size: 1.4rem;">\n$1\n</span>')
        .replace(/<u>Time(.*?)(?=<)/g, '<span style="text-decoration: underline">Time of client death:</span>')
        .replace(/t:(.*?):R/g, stringTimestampDeath ? `${stringTimestampDeath}` : "")
        .replace(/\\n/g, "<br>");
}

function getMessageAuthor(message: ChatMessage): string {
    let author;
    const teamMember = props.emergencyMembers.find((staff) => staff.id === message.senderId);

    if (message.senderId === props.user.id) {
        author = props.user.rsiHandle;
    } else if (teamMember) {
        author = teamMember.rsiHandle;
    } else {
        author = t("tracking_chatDefaultStaffName");
    }

    return `${author}`;
}

function isMessageAuthor(id: string): boolean {
    return id === props.user.id;
}

function isMessageChain(index: number): "top" | "middle" | "bottom" | false {
    if (sortedMessages.value.length <= 1) return false;
    else {
        const prevMessage = sortedMessages.value[index - 1];
        const nextMessage = sortedMessages.value[index + 1];
        const currentMessage = sortedMessages.value[index];

        if (index === 0) {
            if (nextMessage && currentMessage.senderId === nextMessage.senderId) return "top";
            else return false;
        } else {
            if (prevMessage && nextMessage && currentMessage.senderId !== prevMessage.senderId && currentMessage.senderId === nextMessage.senderId)
                return "top";

            if (prevMessage && nextMessage && currentMessage.senderId === prevMessage.senderId && currentMessage.senderId === nextMessage.senderId)
                return "middle";

            if (prevMessage && currentMessage.senderId === prevMessage.senderId && (!nextMessage || currentMessage.senderId !== nextMessage.senderId))
                return "bottom";
            else return false;
        }
    }
}

function truncatedMessage(message: ChatMessage): string {
    const parsedMessage = parseChatMessageString(message);
    return message.contents.length > 500 ? `${parsedMessage.substring(0, 500)}...` : parsedMessage;
}

function messageClasses(messageIndex: number, senderId: string): string {
    let classes: string[] = [];

    if (isMessageAuthor(senderId)) {
        classes.push("self-end bg-primary-600 text-white lg:mr-6");

        if (isMessageChain(messageIndex) === "top") classes.push("mt-4 pt-1 rounded-br");
        else if (isMessageChain(messageIndex) === "middle") classes.push("mt-0 pt-1 rounded-r");
        else if (isMessageChain(messageIndex) === "bottom") classes.push("mt-0 pt-1 rounded-tr");
        else classes.push("mt-4 pt-2");
    } else {
        if (isMessageChain(messageIndex) === "top") classes.push("mt-4 pt-2 rounded-bl");
        else if (isMessageChain(messageIndex) === "middle") classes.push("mt-1 pt-1 rounded-l");
        else if (isMessageChain(messageIndex) === "bottom") classes.push("mt-1 pt-1 rounded-tl");
        else classes.push("mt-4 pt-2");
    }

    return classes.join(" ");
}
</script>

<template>
    <div id="chatBox" ref="chatBox" class="flex h-[45vh] flex-col overflow-y-scroll">
        <GlobalErrorText v-if="props.errorLoadingAdditionalMessages" class="flex justify-center py-4" :text="props.errorLoadingAdditionalMessages" />
        <div v-if="messages.length === 0" class="relative top-1/2">
            <p class="text-center">{{ t("history_chatTranscriptEmpty") }}</p>
        </div>
        <div
            v-for="(message, index) in sortedMessages"
            v-else
            :key="message.id"
            class="flex max-w-[80%] flex-col self-start rounded-lg border border-gray-200 px-2 pb-1 first:mt-0 dark:border-gray-700 lg:px-4"
            :class="messageClasses(index, message.senderId)"
        >
            <p
                v-if="!isMessageAuthor(message.senderId) && (!isMessageChain(index) || isMessageChain(index) === 'top')"
                class="text-sm font-bold text-gray-900 dark:text-gray-50"
            >
                {{ getMessageAuthor(message) }}
            </p>
            <p class="mt-1 break-words" v-html="showFullMessage[message.id] ? parseChatMessageString(message) : truncatedMessage(message)"></p>
            <div class="flex items-center justify-between">
                <p
                    v-if="message.contents.length > 500 && !showFullMessage[message.id]"
                    class="mt-1 cursor-pointer text-sm font-semibold underline"
                    @click="
                        showFullMessage[message.id] = !showFullMessage[message.id];
                        readMoreClicked = true;
                    "
                >
                    {{ t("tracking_readMore") }}
                </p>
                <p class="ml-auto mt-1 text-xs">{{ logicStore.timestampToHours(message.messageSentTimestamp) }}</p>
            </div>
        </div>

        <div id="anchor"></div>
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
