<script setup lang="ts">
import type { ApiToken } from "@medrunner/api-client";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";
import { useUserStore } from "@/stores/userStore";
import { errorString } from "@/utils/functions/stringFunctions.ts";

export interface Props {
	token: ApiToken;
}
const props = defineProps<Props>();
const emit = defineEmits(["tokenDeleted", "close"]);
const userStore = useUserStore();
const { t } = useI18n();

const deletingToken = ref(false);
const errorDeletingToken = ref("");

async function deleteToken(): Promise<void> {
	errorDeletingToken.value = "";
	deletingToken.value = true;

	try {
		await userStore.deleteApiToken(props.token.id);
		document.body.style.overflow = "auto";
		emit("tokenDeleted", props.token.id);
	}
	catch (error: any) {
		errorDeletingToken.value = errorString(error.statusCode);
	}

	deletingToken.value = false;
}
</script>

<template>
	<ModalContainer v-slot="modalContainer" :title="t('developer_deleteTokenTitle')" @close="emit('close')">
		<div>
			<p
				class="
					text-gray-500
					dark:text-gray-400
				"
			>
				{{ t("developer_deleteTokenSubtitle") }}
			</p>

			<div
				class="
					mt-8 gap-2
					lg:flex
				"
			>
				<GlobalButton :loading="deletingToken" size="full" @click="deleteToken()">
					{{ t("developer_deleteTokenButton") }}
				</GlobalButton>
				<GlobalButton
					type="secondary" size="full" class="
						mt-2
						lg:mt-0
					" @click="modalContainer.close()"
				>
					{{
						t("tracking_backCancelButton")
					}}
				</GlobalButton>
			</div>
			<GlobalErrorText v-if="errorDeletingToken" :text="errorDeletingToken" :icon="false" class="mt-2 text-sm font-semibold" />
		</div>
	</ModalContainer>
</template>

<style scoped></style>
