export function debugLogger(message: string, type?: "trace" | "info" | "warn" | "error" | "debug") {
    if (localStorage.getItem("isDebugLoggerEnabled") === "true") {
        console.log(`[${new Date().toUTCString().slice(0, -4)}] ${type ? type.toUpperCase() : "LOG"}: ${message}`);
    } else return;
}
