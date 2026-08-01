import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

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
}
console.log(`Validated ${files.length} SDK and example files.`);

