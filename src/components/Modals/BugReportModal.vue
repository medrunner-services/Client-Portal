<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalLoader from "@/components/utils/GlobalLoader.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";

const { t, locale } = useI18n();
const userStore = useUserStore();
const logicStore = useLogicStore();

const emit = defineEmits(["close"]);

const loadingYtForm = ref(true);

onMounted(async () => {
    const youtrackScript = document.createElement("script");
    const youtrackForm = document.getElementById("youtrack-form");

    youtrackScript.setAttribute("src", "https://youtrack.medrunner.dev/static/simplified/form/form-entry.js");
    youtrackScript.setAttribute("id", "338413ce-0ad3-4399-a84c-1cc299fad5d8");
    youtrackScript.setAttribute("data-yt-url", "https://youtrack.medrunner.dev");
    youtrackScript.setAttribute("data-theme", logicStore.darkMode ? "dark" : "light");
    youtrackScript.setAttribute("data-lang", locale.value.split("-")[0]);

    youtrackForm?.appendChild(youtrackScript);

    youtrackScript.addEventListener("load", () => {
        // @ts-expect-error External script from YouTrack
        YTFeedbackForm.getClientJSApi("338413ce-0ad3-4399-a84c-1cc299fad5d8").then(async (form: any) => {
            form.setBlockValue("RSI Handle", userStore.user.rsiHandle ?? userStore.user.id);
            form.setBlockValue("Browser info", navigator.userAgent);

            const ytTitle = document.querySelector("#youtrack-form h1");
            const ytForm = document.querySelector("#youtrack-form form");
            const ytBrowserInput = document.querySelector("#youtrack-form [data-test-title='Browser info']");
            const ytHandleInput = document.querySelector("#youtrack-form [data-test-title='RSI Handle']");

            // @ts-expect-error External script from YouTrack
            ytTitle.style.display = "none";
            // @ts-expect-error External script from YouTrack
            ytForm.style.padding = "0";
            // @ts-expect-error External script from YouTrack
            ytForm.style.width = "100%";
            // @ts-expect-error External script from YouTrack
            ytBrowserInput.style.display = "none";
            // @ts-expect-error External script from YouTrack
            ytHandleInput.style.display = "none";
        });

        loadingYtForm.value = false;
    });
});
</script>

<template>
    <ModalContainer :title="t('bugReport_title')" @close="emit('close')">
        <p class="text-gray-500 dark:text-gray-400">
            {{ t("bugReport_copyUserAgent") }}
        </p>

        <div id="youtrack-form" class="mt-8 flex items-center justify-center" :class="loadingYtForm ? 'py-[9.2rem]' : ''">
            <GlobalLoader v-if="loadingYtForm" width="w-8" height="h-8" text-size="text-md" spacing="mb-4" />
        </div>
    </ModalContainer>
</template>

<style scoped></style>
