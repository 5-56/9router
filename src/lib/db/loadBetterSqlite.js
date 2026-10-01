import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/**
 * Loads the optional native `better-sqlite3` package, or throws.
 *
 * The package is an optionalDependency: `npm install` silently skips it on
 * machines without build tools, the published CLI bundle strips it
 * deliberately (see cli/scripts/build-cli.js), and driver.js refuses it on
 * Node >= 24. Every caller is therefore expected to tolerate absence at
 * runtime — but webpack/Turbopack statically resolve any literal
 * `require("better-sqlite3")` / `import("better-sqlite3")` they can see and
 * fail the BUILD when the package is missing, before those runtime
 * try/catch fallbacks can ever run. Turbopack even folds module-scope
 * constant specifiers (e.g. `require(PKG)` with `const PKG = "better-sqlite3"`),
 * so the specifier has to stay out of the module's own syntax: Reflect.apply
 * hides the call shape from the bundler while behaving exactly like a plain
 * `require("better-sqlite3")` at runtime (returns the class — CJS module.exports).
 *
 * Note: this also escapes Next output-file tracing. Standalone/Docker builds
 * get the package copied explicitly by scripts/copy-standalone-assets.mjs.
 */
export function loadBetterSqlite() {
  return Reflect.apply(require, null, ["better-sqlite3"]);
}
