import type { PublicOrgSettings } from "@medrunner/api-client";

import { readFileSync } from "node:fs";
import { ServiceStatus } from "@medrunner/api-client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSSRApp } from "vue";
import { createI18n } from "vue-i18n";
import { renderToString } from "vue/server-renderer";

import ServiceStatusCard from "@/components/Emergency/ServiceStatus.vue";
import { useLogicStore } from "@/stores/logicStore.ts";

vi.mock("@/stores/logicStore.ts", () => ({
    useLogicStore: vi.fn(),
}));

vi.mock("/images/StatusShield_green.svg", () => ({ default: "/images/StatusShield_green.svg" }));
vi.mock("/images/StatusShield_yellow.svg", () => ({ default: "/images/StatusShield_yellow.svg" }));
vi.mock("/images/StatusShield_orange.svg", () => ({ default: "/images/StatusShield_orange.svg" }));
vi.mock("/images/StatusShield_red.svg", () => ({ default: "/images/StatusShield_red.svg" }));

let settings: Pick<PublicOrgSettings, "emergenciesEnabled" | "status"> | undefined;

const messages = JSON.parse(readFileSync(new URL("../../../locales/en-US.json", import.meta.url), "utf8")) as Record<string, string>;

beforeEach(() => {
    settings = undefined;
    vi.mocked(useLogicStore).mockImplementation(() => ({
        medrunnerSettings: settings,
    }) as ReturnType<typeof useLogicStore>);
});

async function renderStatus() {
    const app = createSSRApp(ServiceStatusCard);
    app.use(createI18n({
        legacy: false,
        locale: "en-US",
        messages: { "en-US": messages },
    }));
    return renderToString(app);
}

describe("disabled emergencies", () => {
    it.each([
        ServiceStatus.UNKNOWN,
        ServiceStatus.OPERATIONAL,
        ServiceStatus.SLIGHTLY_DEGRADED,
        ServiceStatus.HEAVILY_DEGRADED,
        ServiceStatus.OFFLINE,
    ])("shows services down regardless of reported status %s", async (status) => {
        settings = { emergenciesEnabled: false, status };

        const html = await renderStatus();

        expect(html).toContain(messages.home_statusDown);
        expect(html).toContain("/images/StatusShield_red.svg");
        expect(html).not.toContain(messages.home_statusAllOperational);
        expect(html).not.toContain("/images/StatusShield_green.svg");
    });
});

describe("enabled emergencies", () => {
    it.each([
        [ServiceStatus.UNKNOWN, "green", messages.home_statusAllOperational],
        [ServiceStatus.OPERATIONAL, "green", messages.home_statusAllOperational],
        [ServiceStatus.SLIGHTLY_DEGRADED, "yellow", messages.home_statusSlightlyDisrupted],
        [ServiceStatus.HEAVILY_DEGRADED, "orange", messages.home_statusHeavilyDisrupted],
        [ServiceStatus.OFFLINE, "red", messages.home_statusDown],
    ] as const)("preserves the display for reported status %s", async (status, color, message) => {
        settings = { emergenciesEnabled: true, status };

        const html = await renderStatus();

        expect(html).toContain(message);
        expect(html).toContain(`/images/StatusShield_${color}.svg`);
    });
});

it("renders before organization settings have loaded", async () => {
    const html = await renderStatus();

    expect(html).toContain(messages.home_serviceStatus);
});

it("uses refreshed settings when emergencies are disabled and re-enabled", async () => {
    settings = { emergenciesEnabled: true, status: ServiceStatus.UNKNOWN };
    expect(await renderStatus()).toContain(messages.home_statusAllOperational);

    settings = { ...settings, emergenciesEnabled: false };
    expect(await renderStatus()).toContain(messages.home_statusDown);

    settings = { ...settings, emergenciesEnabled: true };
    expect(await renderStatus()).toContain(messages.home_statusAllOperational);
});
