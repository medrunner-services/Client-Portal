<script setup lang="ts">
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import { useLogicStore } from "@/stores/logicStore";

const { t } = useI18n();
const logicStore = useLogicStore();
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
					<p>{{ t("home_blockedTitle") }}</p>
					<p class="mt-2 text-sm font-normal">
						{{ t("home_blockedText") }}
					</p>

					<div
						class="
							mt-8 flex flex-col gap-4
							md:flex-row
						"
					>
						<a
							class="
								w-full
								lg:w-fit
							" :href="`${logicStore.discordBaseUrl}discord.com/invite/medrunner`" target="_blank"
						>
							<GlobalButton icon="link" size="full">{{ t("home_medrunnerDiscord") }}</GlobalButton>
						</a>

						<a
							class="
								w-full
								lg:w-fit
							" href="https://discord.gg/dcyXDFZpYP" target="_blank"
						>
							<GlobalButton icon="link" size="full" type="outline-solid" class="text-gray-900">{{
								t("home_banAppealDiscord")
							}}</GlobalButton>
						</a>
					</div>
				</div>
			</div>
		</div>
	</GlobalCard>
</template>

<style scoped></style>
