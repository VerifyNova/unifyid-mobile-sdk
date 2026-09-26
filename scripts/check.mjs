import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const roots = ["packages", "examples"];
const files = [];
async function walk(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const target = join(path, entry.name);
    if (entry.isDirectory()) await walk(target);
    else files.push(target);
  }
}
for (const root of roots) await walk(root);
for (const file of files) {
  const content = await readFile(file, "utf8");
  if (content.includes("\t")) throw new Error(`${file}: tabs are not allowed`);
  if (content.includes("client_secret_LIVE")) throw new Error(`${file}: embedded secret detected`);
  if (/\.(?:mjs|js)$/.test(file)) {
    const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8", windowsHide: true });
    if (result.status !== 0) throw new Error(`${file}: invalid JavaScript\n${result.stderr}`);
  }
}
console.log(`Validated ${files.length} SDK and example files.`);

