import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { minify } from "terser";

// Source dễ đọc nằm ở server/scripts/embed-src/ (bên ngoài thư mục extension —
// Shopify CLI chỉ cho phép assets/blocks/snippets/locales trong đó), build ra
// bản minify vào assets/ — đúng file mà `shopify app deploy` upload lên theme
// app extension.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, "embed-src");
const OUT_DIR = path.resolve(
  __dirname,
  "../../extensions/vinhhv-app-embed/assets",
);

async function buildFile(name: string) {
  const srcPath = path.join(SRC_DIR, name);
  const code = await readFile(srcPath, "utf8");
  const result = await minify(code, {
    format: { comments: false },
  });

  if (!result.code) {
    throw new Error(`terser trả về rỗng cho ${name}`);
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, name), result.code, "utf8");
  console.log(`[build-embed-assets] minified ${name}`);
}

await buildFile("custom-pricing.js");
