<script setup lang="ts">
import type { ChatMessage, Person, TeamMember } from "@medrunner/api-client";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import ChatMessageToolbar from "@/components/Emergency/ChatMessageToolbar.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalLocalizedDate from "@/components/utils/GlobalLocalizedDate.vue";
import { timestampToFullDateTimeZone } from "@/utils/functions/dateTimeFunctions.ts";
import { parseMarkdown, replaceAtMentions } from "@/utils/functions/stringFunctions.ts";

export interface Props {
    messages: ChatMessage[];
    emergencyMembers: TeamMember[];
    errorLoadingAdditionalMessages?: string;
    keepScrollPosition?: boolean;
    user: Person;
    editingMessageId?: string;
    isTranscript?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    keepScrollPosition: false,
    isTranscript: false,
});
const emit = defineEmits<{
    loadNewMessages: [];
    editMessage: [id: string, contents: string];
}>();

const { t } = useI18n();

const chatBox = ref<HTMLDivElement | null>(null);
const distanceFromBottom = ref(0);
const showFullMessage = ref<Record<string, boolean>>({});
const readMoreClicked = ref(false);
const hoveredMessageId = ref<string | undefined>();

onMounted(async () => {
    if (chatBox.value) {
        chatBox.value.scrollTop = chatBox.value.scrollHeight;

        const observer = new MutationObserver((event) => {
            const hasToolbarMutation = event.some((mutation) => {
                const addedHasToolbar = Array.from(mutation.addedNodes).some((node) => node instanceof Element && node.id === "chatMessageToolbar");
                const removedHasToolbar = Array.from(mutation.removedNodes).some(
                    (node) => node instanceof Element && node.id === "chatMessageToolbar",
                );
                return addedHasToolbar || removedHasToolbar;
            });

            if (chatBox.value && !hasToolbarMutation) {
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

const sortedMessages = computed<ChatMessage[]>(() => {
    return [...props.messages].filter((obj) => obj.contents !== undefined).sort((a, b) => Date.parse(a.created) - Date.parse(b.created));
});

function parseChatMessageString(message: ChatMessage): string {
    const htmlMessage = parseMarkdown(message.contents);

    return replaceAtMentions(htmlMessage, message.senderId, true, props.emergencyMembers, props.user);
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
    const classes: string[] = [];

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
            class="relative flex max-w-[80%] flex-col self-start rounded-lg border border-gray-200 px-2 pb-1 first:mt-0 dark:border-gray-700 lg:px-4"
            :class="messageClasses(index, message.senderId)"
            @mouseenter="hoveredMessageId = message.id"
            @mouseleave="hoveredMessageId = undefined"
        >
            <p
                v-if="!isMessageAuthor(message.senderId) && (!isMessageChain(index) || isMessageChain(index) === 'top')"
                class="text-sm font-bold text-gray-900 dark:text-gray-50"
            >
                {{ getMessageAuthor(message) }}
            </p>
            <p
                class="prose mt-1 break-words dark:prose-invert dark:text-white"
                :class="{ 'markdown-extras prose-invert text-right text-white': isMessageAuthor(message.senderId) }"
                v-html="showFullMessage[message.id] ? parseChatMessageString(message) : truncatedMessage(message)"
            ></p>
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
                <div class="ml-auto mt-1 flex gap-2 text-xs">
                    <p v-if="message.edited" :title="timestampToFullDateTimeZone(message.updated)" class="italic">({{ t("tracking_edited") }})</p>
                    <GlobalLocalizedDate :date="message.messageSentTimestamp" format="toHours" />
                </div>
            </div>

            <ChatMessageToolbar
                v-if="!isTranscript && isMessageAuthor(message.senderId) && hoveredMessageId === message.id"
                @edit-click="emit('editMessage', message.id, message.contents)"
            />
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

.markdown-extras * {
    border-inline-start-color: #e2e8f0;
    color: white !important;
}

.markdown-extras * ::marker {
    color: white !important;
}
</style>
