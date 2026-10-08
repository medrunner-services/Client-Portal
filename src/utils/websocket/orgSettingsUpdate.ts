import { AlertColors } from "@/@types/types.ts";
import { i18n } from "@/i18n.ts";
import { useAlertStore } from "@/stores/alertStore.ts";
import { useLogicStore } from "@/stores/logicStore.ts";
import { requireResponseData } from "@/utils/functions/apiResponseFunctions.ts";
import { api } from "@/utils/medrunnerClient.ts";

export async function orgSettingsUpdate() {
    const logicStore = useLogicStore();
    const alertStore = useAlertStore();
    const { t } = i18n.global;

    try {
        const response = await api.orgSettings.getPublicSettings();
        logicStore.medrunnerSettings = requireResponseData(response);
    }
    catch (_e) {
        alertStore.newAlert(AlertColors.RED, t("error_globalLoading"), false, "warning", 5000);
    }
}
