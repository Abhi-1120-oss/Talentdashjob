import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const py = process.platform === "win32" ? "python" : "python3";
const r = spawnSync(py, ["scripts/export_static_bundle.py"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, PYTHONPATH: "src" },
});

if (r.status !== 0) {
  console.warn("Python export failed, falling back to Node generator...");
  const node = spawnSync("node", ["frontend/scripts/generate-static-data.mjs"], {
    cwd: root,
    stdio: "inherit",
  });
  process.exit(node.status ?? 1);
}
