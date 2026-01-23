import { onMounted, onUnmounted, ref } from "vue";

export enum Breakpoint {
    XS,
    SM,
    MD,
    LG,
    XL,
    XXL,
}

export function useBreakpoint() {
    const breakpoint = ref<Breakpoint>(Breakpoint.XS);

    const updateBreakpoint = () => {
        const width = window.innerWidth;
        if (width >= 1536)
            breakpoint.value = Breakpoint.XXL;
        else if (width >= 1280)
            breakpoint.value = Breakpoint.XL;
        else if (width >= 1024)
            breakpoint.value = Breakpoint.LG;
        else if (width >= 768)
            breakpoint.value = Breakpoint.MD;
        else if (width >= 640)
            breakpoint.value = Breakpoint.SM;
        else breakpoint.value = Breakpoint.XS;
    };

    onMounted(() => {
        updateBreakpoint();
        window.addEventListener("resize", updateBreakpoint);
    });

    onUnmounted(() => {
        window.removeEventListener("resize", updateBreakpoint);
    });

    return breakpoint;
}
