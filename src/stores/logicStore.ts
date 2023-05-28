import { defineStore } from "pinia";
import { ref } from "vue";

export const useLogicStore = defineStore("logic", () => {
    const isRouterLoading = ref(false);

    return {
        isRouterLoading,
    };
});
