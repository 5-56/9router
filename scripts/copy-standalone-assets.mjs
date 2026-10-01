import { cpSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

export function copyStandaloneAssets({ projectRoot = process.cwd(), distDir = process.env.NEXT_DIST_DIR || ".next" } = {}) {
  if (process.env.NEXT_TRACING_ROOT_MODE === "workspace") {
    console.log("[standalone-assets] Skipping workspace-traced CLI build; CLI packaging handles assets");
    return;
  }

  const buildDir = resolve(projectRoot, distDir);
  const standaloneDir = resolve(buildDir, "standalone");

  if (!existsSync(standaloneDir)) {
    console.log(`[standalone-assets] No standalone build found at ${standaloneDir}`);
    return;
  }

  const staticSource = resolve(buildDir, "static");
  const staticDestination = resolve(standaloneDir, distDir, "static");
  if (existsSync(staticSource)) {
    cpSync(staticSource, staticDestination, { recursive: true, force: true });
    console.log(`[standalone-assets] Copied static assets to ${staticDestination}`);
  }

  const publicSource = resolve(projectRoot, "public");
  const publicDestination = resolve(standaloneDir, "public");
  if (existsSync(publicSource)) {
    cpSync(publicSource, publicDestination, { recursive: true, force: true });
    console.log(`[standalone-assets] Copied public assets to ${publicDestination}`);
  }

  // Without it beside server.js the standalone build serves requests unsanitized.
  const serverWrapperSource = resolve(projectRoot, "custom-server.js");
  const serverWrapperDestination = resolve(standaloneDir, "custom-server.js");
  if (existsSync(serverWrapperSource)) {
    cpSync(serverWrapperSource, serverWrapperDestination, { force: true });
    console.log(`[standalone-assets] Copied custom-server.js to ${serverWrapperDestination}`);
  }

  // better-sqlite3 is loaded via createRequire (see src/lib/db/adapters/betterSqliteAdapter.js),
  // which escapes Next output-file tracing. Copy it explicitly when installed so the
  // preferred native driver is available in standalone/Docker builds. When npm skipped
  // the optional package (no build tools on the build machine) the copy is skipped too
  // and the runtime falls back to node:sqlite/sql.js as designed.
  const betterSqliteSource = resolve(projectRoot, "node_modules", "better-sqlite3");
  const betterSqliteDestination = resolve(standaloneDir, "node_modules", "better-sqlite3");
  if (existsSync(betterSqliteSource)) {
    cpSync(betterSqliteSource, betterSqliteDestination, { recursive: true, force: true });
    console.log(`[standalone-assets] Copied better-sqlite3 to ${betterSqliteDestination}`);
  } else {
    console.log("[standalone-assets] better-sqlite3 not installed — standalone build will fall back to node:sqlite/sql.js");
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(dirname(fileURLToPath(import.meta.url)), "copy-standalone-assets.mjs")) {
  copyStandaloneAssets();
}
