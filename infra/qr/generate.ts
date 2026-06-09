/**
 * Quishing campaign QR generator.
 *
 * Generates the campaign QR code in two formats:
 *   - campaign-qr.svg   vector, scales cleanly at any print size
 *   - campaign-qr.png   2048×2048, for tools that don't accept SVG
 *
 * Both use error-correction level H (~30% redundancy), so the QR survives
 * moderate damage / smudging / partial coverage on a printed poster.
 *
 * Usage:
 *   cd infra/qr
 *   npm install        (one-time)
 *   npx tsx generate.ts <url>
 *
 * Example:
 *   npx tsx generate.ts https://university-rewards-2026.vercel.app
 *
 * The script is idempotent: re-running with the same (or different) URL
 * overwrites the previous output.
 */

import QRCode from "qrcode";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main(): Promise<void> {
  const url = process.argv[2];

  if (!url) {
    console.error("Usage: npx tsx generate.ts <url>");
    console.error("Example: npx tsx generate.ts https://university-rewards-2026.vercel.app");
    process.exit(1);
  }

  // Reject obviously broken URLs early.
  try {
    new URL(url);
  } catch {
    console.error(`Invalid URL: "${url}"`);
    process.exit(1);
  }

  const outDir = join(__dirname, "output");
  await mkdir(outDir, { recursive: true });

  const svgPath = join(outDir, "campaign-qr.svg");
  const pngPath = join(outDir, "campaign-qr.png");

  await QRCode.toFile(svgPath, url, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  await QRCode.toFile(pngPath, url, {
    errorCorrectionLevel: "H",
    width: 2048,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  console.log(`Encoded URL: ${url}`);
  console.log(`Wrote SVG  : ${svgPath}`);
  console.log(`Wrote PNG  : ${pngPath} (2048×2048)`);
  console.log(`EC level   : H (~30% redundancy)`);
  console.log("");
  console.log("Next: copy the SVG into the campaign-web public folder so /poster can render it:");
  console.log("  PowerShell : Copy-Item infra/qr/output/campaign-qr.svg campaign-web/public/qr.svg");
  console.log("  Bash       : cp infra/qr/output/campaign-qr.svg campaign-web/public/qr.svg");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
