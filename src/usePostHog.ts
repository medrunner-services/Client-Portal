import posthog from "posthog-js";

export function usePostHog() {
    posthog.init(import.meta.env.VITE_POSTHOG_TOKEN, {
        api_host: "https://eu.i.posthog.com",
        sanitize_properties: function (properties) {
            if (properties["$ip"]) {
                properties["$ip"] = null;
            }
            return properties;
        },
        capture_pageview: false,
        capture_pageleave: false,
        cross_subdomain_cookie: false,
        persistence: "memory",
        person_profiles: "identified_only",
        opt_out_capturing_by_default: true,
    });

    return {
        posthog,
    };
}
