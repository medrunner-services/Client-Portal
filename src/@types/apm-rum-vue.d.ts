declare module "@elastic/apm-rum-vue" {
    import { AgentConfigOptions } from "@elastic/apm-rum";
    import { App } from "vue";
    import { Router } from "vue-router";

    export interface IApmVuePluginOptions {
        router?: Router;
        captureErrors?: boolean;
        config: AgentConfigOptions & {
            errorThrottleLimit?: number;
            errorThrottleInterval?: number;
            transactionThrottleLimit?: number;
            transactionThrottleInterval?: number;
            queueLimit?: number;
            monitorLongtasks?: boolean;
            apmRequest?: (requestParams: {
                url: string;
                method: string;
                headers: string;
                payload: any;
                xhr: XMLHttpRequest;
            }) => boolean | Promise<boolean>;
            sendCredentials?: boolean;
        };
    }

    export const ApmVuePlugin: {
        install(app: App, options: IApmVuePluginOptions): any;
    };
}
