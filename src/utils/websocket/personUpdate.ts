import { AlertColors } from "@/@types/types.ts";
import { i18n } from "@/i18n.ts";
import { useAlertStore } from "@/stores/alertStore.ts";
import { useUserStore } from "@/stores/userStore";
import { restartWebsocket } from "@/utils/functions/handleWebsocket.ts";
import { errorPresentation } from "@/utils/functions/stringFunctions";

export async function personUpdate() {
    const userStore = useUserStore();
    const alertStore = useAlertStore();
    const { t } = i18n.global;

    try {
        const newUser = await userStore.fetchUser();

        if (!userStore.user.rsiHandle && newUser.rsiHandle) {
            await restartWebsocket();
        }

        userStore.user = newUser;

        if (userStore.user.clientPortalPreferencesBlob) {
            userStore.syncedSettings = {
                ...userStore.syncedSettings,
                ...JSON.parse(userStore.user.clientPortalPreferencesBlob),
            };
        }
    }
    catch (_e) {
        alertStore.newAlert(AlertColors.RED, errorPresentation(_e, t("error_globalLoading")), false, "warning", 5000);
    }
}
