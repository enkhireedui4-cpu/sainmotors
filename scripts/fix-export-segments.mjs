// Works around a Next.js 16 static-export bug on Windows.
//
// The client router prefetches per-segment data from flat file names such as
//   /mn/brands/jetour/__next.$d$lang.brands.$d$slug.__PAGE__.txt
// (next/dist/shared/lib/segment-cache/segment-value-encoding.js replaces "/"
// with "."). On Windows the exporter gets "\"-separated paths, which that
// replacement misses, so it writes nested folders instead:
//   /mn/brands/jetour/__next.$d$lang/brands/$d$slug/__PAGE__.txt
// The prefetches then 404 and navigation falls back to full page loads.
//
// This script renames the nested files to the flat names the client asks for.
// On Linux/macOS builds there is nothing to fix and it exits quietly.
import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve(import.meta.dirname, "..", "out");

async function filesUnder(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((e) => (e.isDirectory() ? filesUnder(path.join(dir, e.name)) : [path.join(dir, e.name)])),
  );
  return nested.flat();
}

async function walk(dir, fixed) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith("__next.")) {
      for (const file of await filesUnder(full)) {
        const rel = path.relative(full, file).split(path.sep).join(".");
        await fs.rename(file, path.join(dir, `${entry.name}.${rel}`));
        fixed.count++;
      }
      await fs.rm(full, { recursive: true, force: true });
    } else {
      await walk(full, fixed);
    }
  }
}

const fixed = { count: 0 };
await walk(OUT, fixed);
if (fixed.count) console.log(`fix-export-segments: flattened ${fixed.count} segment file(s)`);
