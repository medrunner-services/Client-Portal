import { useLogicStore } from "@/stores/logicStore.ts";

export function handleDarkModeUpdate(enableDarkMode: boolean) {
    const logicStore = useLogicStore();

    if (enableDarkMode) {
        document.documentElement.classList.add("dark");
        logicStore.darkMode = true;

        const darkReaderLock = document.createElement("meta");
        darkReaderLock.name = "darkreader-lock";
        document.head.appendChild(darkReaderLock);
    } else {
        document.documentElement.classList.remove("dark");
        logicStore.darkMode = false;

        const darkReaderLock = document.querySelector('meta[name="darkreader-lock"]');
        if (darkReaderLock) darkReaderLock.remove();
    }
}
