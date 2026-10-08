import type { Ref } from "vue";
import { onBeforeUnmount, watchEffect } from "vue";

export function useClickOutside(
    target: Ref<HTMLElement | null>,
    callback: () => void,
) {
    const listener = (event: MouseEvent) => {
        if (target.value && !target.value.contains(event.target as Node))
            callback();
    };

    watchEffect(() => {
        if (target.value) {
            setTimeout(() => document.addEventListener("click", listener));
        }
        else {
            document.removeEventListener("click", listener);
        }
    });

    onBeforeUnmount(() => {
        document.removeEventListener("click", listener);
    });
}
