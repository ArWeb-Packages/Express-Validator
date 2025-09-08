import fs from "fs";
import path from "path";

const srcDir = "./src";
const cjsDir = "./cjs";

if (!fs.existsSync(cjsDir)) {
  fs.mkdirSync(cjsDir);
}

// list of files to convert
const files = ["index.js", "rules.js", "db.js"];

for (const file of files) {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(cjsDir, file);

  let code = fs.readFileSync(srcPath, "utf-8");

  // Convert ESM -> CJS

  // handle imports like: import x from "pkg"
  code = code.replace(
    /import\s+(\w+)\s+from\s+["']([^"']+)["'];?/g,
    "const $1 = require('$2');"
  );

  // handle imports like: import { x } from "./y.js"
  code = code.replace(
    /import\s+{([^}]+)}\s+from\s+["']([^"']+)["'];?/g,
    "const {$1} = require('$2');"
  );

  // export const something = ...
  code = code.replace(/export const (\w+)\s*=\s*/g, "const $1 = ");

  // export class Something
  code = code.replace(/export class (\w+)/g, "class $1");

  // export default Something
  code = code.replace(/export default (\w+)/g, "module.exports = $1");

  // Append module.exports at bottom depending on file
  if (file === "rules.js") code += "\n\nmodule.exports = { defaultRules };";
  if (file === "db.js") code += "\n\nmodule.exports = { dbChecks };";
  if (file === "index.js") code += "\n\nmodule.exports = { Validator };";

  fs.writeFileSync(destPath, code, "utf-8");
}

console.log("✅ Build complete: CJS files generated in ./cjs");
