<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalLoader from "@/components/utils/GlobalLoader.vue";
import { useUserStore } from "@/stores/userStore";
import { fetchAllPaginatedResponse } from "@/utils/functions/fetchFunctions.ts";
import { getCodeTypeString } from "@/utils/functions/getStringsFunctions.ts";
import { errorString } from "@/utils/functions/stringFunctions.ts";

const userStore = useUserStore();
const { t } = useI18n();

const loadingCodes = ref(false);
const errorLoadingCodes = ref("");

onMounted(async () => {
	loadingCodes.value = true;
	try {
		userStore.redeemedCodes = await fetchAllPaginatedResponse(userStore.fetchUserRedeemedCodes);
	}
	catch (error: any) {
		errorLoadingCodes.value = errorString(error.statusCode);
	}
	finally {
		loadingCodes.value = false;
	}
});
</script>

<template>
	<div>
		<div class="min-h-11">
			<h2 class="font-Mohave text-2xl font-semibold uppercase">
				{{ t("profile_redeemedCodes") }}
			</h2>
		</div>

		<div class="w-full">
			<div
				class="
					rounded-lg shadow-md
					dark:bg-gray-800 dark:shadow-gray-900
				"
			>
				<div>
					<div
						class="
							w-full text-left text-sm text-gray-500
							dark:text-gray-400
						"
					>
						<div
							class="
								grid grid-cols-12 rounded-t-lg bg-gray-50 p-3 font-Mohave font-semibold text-gray-500 uppercase
								md:grid-cols-12
								dark:bg-gray-700 dark:text-gray-400
							"
						>
							<div class="col-span-5">
								{{ t("profile_code") }}
							</div>
							<div class="col-span-3">
								{{ t("profile_event") }}
							</div>
						</div>

						<div v-if="errorLoadingCodes" class="flex h-56 w-full items-center justify-center">
							<GlobalErrorText :text="errorLoadingCodes" />
						</div>

						<div v-else-if="loadingCodes" class="flex h-56 w-full items-center justify-center">
							<GlobalLoader width="w-8" height="h-8" text-size="text-md" spacing="mb-4" />
						</div>

						<div v-else-if="userStore.redeemedCodes.length > 0">
							<div v-for="code in userStore.redeemedCodes" :key="code.id">
								<div
									class="
										grid grid-cols-12 items-center border-b p-3
										last:border-b-0
										md:grid-cols-12
										dark:border-gray-700
									"
								>
									<div
										class="
											col-span-5 font-medium text-gray-900
											md:col-span-5
											dark:text-white
										"
									>
										{{ code.id }}
									</div>

									<div class="col-span-3">
										<p>{{ getCodeTypeString(code.type) }}</p>
									</div>
								</div>
							</div>
						</div>
						<div v-else class="flex h-56 w-full items-center justify-center">
							<p>{{ t("profile_noCodesRedeemed") }}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped></style>
