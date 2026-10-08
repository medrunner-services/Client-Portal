import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { resolveBuildVersion } from "../build/version";

const roots: string[] = [];

function fixture(withGit = true) {
    const cwd = mkdtempSync(join(tmpdir(), "portal-version-"));
    roots.push(cwd);
    writeFileSync(join(cwd, "package.json"), JSON.stringify({ version: "2.10.0" }));
    const git = (...args: string[]) => execFileSync("git", ["-c", `safe.directory=${cwd}`, ...args], {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    if (withGit) {
        git("init", "--initial-branch=main");
        git("config", "user.name", "Build version test");
        git("config", "user.email", "build@example.invalid");
        git("add", "package.json");
        git("commit", "-m", "feat: baseline");
    }
    const resolve = (production = false, env = {}) => resolveBuildVersion({ cwd, production, env });
    return { cwd, git, resolve };
}

afterEach(() => {
    for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("build version", () => {
    it("adds zero distance and commit metadata to exact stable tags", () => {
        const { git, resolve } = fixture();
        git("tag", "-a", "v2.9.3", "-m", "stable");
        expect(resolve(true)).toBe(`2.9.3+0.g${git("rev-parse", "--short=7", "HEAD")}`);
    });

    it("counts later commits and excludes prereleases for production", () => {
        const { cwd, git, resolve } = fixture();
        git("tag", "-a", "v2.9.3", "-m", "stable");
        git("commit", "--allow-empty", "-m", "feat: staging");
        git("tag", "v2.10.0-dev.1");
        git("commit", "--allow-empty", "-m", "ci: update deployment");
        const sha = git("rev-parse", "--short=7", "HEAD");
        expect(resolve()).toBe(`2.10.0-dev.1+1.g${sha}`);
        expect(resolve(true)).toBe(`2.9.3+2.g${sha}`);
        expect(JSON.parse(readFileSync(join(cwd, "package.json"), "utf8")).version).toBe("2.10.0");
    });

    it("uses the complete CI version unchanged instead of appending metadata twice", () => {
        const { cwd, git, resolve } = fixture();
        git("tag", "v2.9.3");
        writeFileSync(join(cwd, "package.json"), JSON.stringify({ version: "2.9.3+0.gabcdef0" }));
        expect(resolve(true, { APP_VERSION: "2.9.3+0.gabcdef0" })).toBe("2.9.3+0.gabcdef0");
    });

    it("identifies tagless Git builds without inventing a release distance", () => {
        const { git, resolve } = fixture();
        expect(resolve()).toBe(`2.10.0+g${git("rev-parse", "--short=7", "HEAD")}`);
    });

    it("falls back to the package version in a source archive without Git", () => {
        const { resolve } = fixture(false);
        expect(resolve()).toBe("2.10.0");
    });

    it("marks tracked local changes without marking untracked files dirty", () => {
        const { cwd, git, resolve } = fixture();
        git("tag", "v2.9.3");
        const version = `2.9.3+0.g${git("rev-parse", "--short=7", "HEAD")}`;
        writeFileSync(join(cwd, "untracked.log"), "temporary build output");
        expect(resolve(true)).toBe(version);
        writeFileSync(join(cwd, "package.json"), JSON.stringify({ version: "2.10.1" }));
        expect(resolve(true)).toBe(`${version}.dirty`);
    });

    it("rejects malformed explicit SemVer rather than silently using a different version", () => {
        const { resolve } = fixture(false);
        for (const version of ["02.9.3", "2.9.3-dev..1", "2.9.3-dev.01", "2.9.3+build..42", "2.9.3\n", "2.9.3\nBAD=value"])
            expect(() => resolve(false, { APP_VERSION: version })).toThrow("Invalid build version");
    });
});
