<script setup lang="ts">
import type { ChatMessage, Person, TeamMember } from "@medrunner-services/api-client";
import { toHTML } from "discord-markdown";
import { computed, type ComputedRef, onMounted, type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import { useLogicStore } from "@/stores/logicStore";
import { replaceAtMentions } from "@/utils/stringUtils";

export interface Props {
    messages: ChatMessage[];
    emergencyMembers: TeamMember[];
    user: Person;
}

const props = defineProps<Props>();
const logicStore = useLogicStore();
const { t } = useI18n();

const chatBox: Ref<HTMLDivElement | null> = ref(null);

onMounted(async () => {
    if (chatBox.value) {
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
    return [...props.messages].filter((obj) => obj.contents !== undefined).sort((a, b) => Date.parse(a.created) - Date.parse(b.created));
});

function parseChatMessageString(message: ChatMessage): string {
    const htmlMessage = toHTML(message.contents);
    const timestampDeath = htmlMessage.match(/&lt;t:(.*?)(?=:R&gt;)/g);
    let stringTimestampDeath;
    if (timestampDeath && timestampDeath[0]) {
        stringTimestampDeath = logicStore.timestampToHours(parseInt(timestampDeath[0].substring(6)) * 1000);
    }

    const htmlMessageParsedMentions = replaceAtMentions(htmlMessage, message.senderId, true, props.emergencyMembers, props.user);

    return htmlMessageParsedMentions
        .replace(/&lt;|&gt;/g, "")
        .replace(/##(.*?)(?=<br>)/g, '<span style="font-weight: bold; font-size: 1.4rem;">\n$1\n</span>')
        .replace(/<u>Time(.*?)(?=<)/g, '<span style="text-decoration: underline">Time of client death:</span>')
        .replace(/t:(.*?):R/g, stringTimestampDeath ? `${stringTimestampDeath}` : "");
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
</script>

<template>
    <div id="chatBox" ref="chatBox" class="flex h-[45vh] flex-col overflow-y-scroll">
        <div
            v-for="message in sortedMessages"
            :key="message.id"
            class="mt-4 flex max-w-[80%] flex-col self-start rounded-lg border border-gray-200 px-2 pb-1 pt-2 first:mt-0 dark:border-gray-700 lg:px-4"
            :class="isMessageAuthor(message.senderId) ? 'self-end bg-primary-600 text-white lg:mr-6' : ''"
        >
            <p v-if="!isMessageAuthor(message.senderId)" class="text-sm font-bold">{{ getMessageAuthor(message) }}</p>
            <p class="mt-1 break-words" v-html="parseChatMessageString(message)"></p>
            <p class="mt-1 self-end text-xs">{{ logicStore.timestampToHours(message.messageSentTimestamp) }}</p>
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
