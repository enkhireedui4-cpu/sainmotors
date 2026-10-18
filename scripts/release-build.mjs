// Release build: the same static export, but it refuses to build while any
// visible content is not approved (see src/lib/release.ts) and it drops the
// staging review tools. Use this for the files that go to sainmotors.mn.
import { spawnSync } from "node:child_process";

const env = { ...process.env, SITE_RELEASE: "1" };
const run = (cmd, args) => {
  const result = spawnSync(cmd, args, { stdio: "inherit", env, shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run("node", ["scripts/build-images.mjs"]);
run("npx", ["next", "build"]);
run("node", ["scripts/fix-export-segments.mjs"]);
