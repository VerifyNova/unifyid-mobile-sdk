import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("packages", "dist/packages", { recursive: true });
console.log("Prepared publishable SDK sources in dist/.");

