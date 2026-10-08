import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const semver = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[a-z-][\da-z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-z-][\da-z-]*))*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?$/i;

function validate(version: string): string {
    if (!semver.test(version) || /[\r\n\0]/.test(version))
        throw new Error("Invalid build version");
    return version;
}

export function resolveBuildVersion({ cwd = process.cwd(), production = false, env = process.env }: {
    cwd?: string;
    production?: boolean;
    env?: NodeJS.ProcessEnv;
} = {}): string {
    // CI supplies the final version used by deployment notifications as well.
    if (env.APP_VERSION)
        return validate(env.APP_VERSION);

    const git = (...args: string[]): string => {
        try {
            return execFileSync("git", args, {
                cwd,
                encoding: "utf8",
                stdio: ["ignore", "pipe", "pipe"],
            }).trim();
        }
        catch {
            return "";
        }
    };

    const args = ["describe", "--tags", "--abbrev=0", "--match", "v[0-9]*"];
    if (production)
        args.push("--exclude", "v*-*");
    const tag = git(...args);
    const pkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8"));
    const version = validate(tag ? tag.slice(1) : pkg.version);
    const sha = git("rev-parse", "--short=7", "HEAD");

    // Source archives without Git retain a usable manifest version.
    if (!sha)
        return version;

    const distance = tag ? `${git("rev-list", "--count", `${tag}..HEAD`)}.` : "";
    const dirty = git("status", "--porcelain", "--untracked-files=no") ? ".dirty" : "";
    const metadata = `${distance}g${sha}${dirty}`;
    return validate(`${version}${version.includes("+") ? "." : "+"}${metadata}`);
}
