<script setup lang="ts">
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";

const { t } = useI18n();
</script>

<template>
    <GlobalCard>
        <div class="flex gap-4">
            <div>
                <svg
                    class="mt-0.5 h-5 w-5 text-red-600"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"
                    />
                </svg>
            </div>
            <div class="flex gap-4 font-semibold text-red-600">
                <div>
                    <p>{{ t("home_unlinkedCTATitle") }}</p>
                    <p class="mt-2 text-sm font-normal">
                        {{ t("home_unlinkedCTADescription") }}
                    </p>

                    <div class="mt-8">
                        <RouterLink to="/login/link">
                            <GlobalButton class="w-full" size="full">{{ t("user_linkAccount") }}</GlobalButton>
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
    </GlobalCard>
</template>

<style scoped></style>
