import { ClientType, type Deployment } from "@medrunner/api-client";

import { useLogicStore } from "@/stores/logicStore.ts";

export function deploymentCreate(newDeployment: Deployment) {
    const logicStore = useLogicStore();

    if (newDeployment.clientType === ClientType.CLIENT_PORTAL) logicStore.showNewUpdateBanner = true;
}
