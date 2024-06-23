import { defineStore } from "pinia";
import { ref } from "vue";

import { AlertColors } from "@/types";

export const useAlertStore = defineStore("alert", () => {
    const showAlert = ref(false);
    const message = ref("");
    const color = ref(AlertColors.RED);
    const icon = ref("");
    const isCloseable = ref(true);
    const speed = ref(3500);
    const currentTimeoutId = ref<NodeJS.Timeout>();

    function newAlert(type: AlertColors = AlertColors.RED, content: string, closeable = true, alertIcon?: "info", duration = 3500) {
        message.value = content;
        color.value = type;
        isCloseable.value = closeable;
        speed.value = duration;

        if (alertIcon) icon.value = alertIcon;
        else icon.value = "";

        showAlert.value = true;

        if (currentTimeoutId.value) {
            clearTimeout(currentTimeoutId.value);
        }
        currentTimeoutId.value = setTimeout(closeAlert, duration);
    }

    function closeAlert() {
        showAlert.value = false;
        message.value = "";
        color.value = AlertColors.RED;
        icon.value = "";
        isCloseable.value = true;

        if (currentTimeoutId.value) {
            clearTimeout(currentTimeoutId.value);
        }
    }

    return {
        showAlert,
        message,
        color,
        icon,
        isCloseable,
        speed,
        newAlert,
        closeAlert,
    };
});
