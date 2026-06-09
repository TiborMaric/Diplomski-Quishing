# QR generator

Standalone Node/TypeScript script that generates the Quishing campaign QR
code in two formats: vector SVG (best for any print size) and 2048×2048
PNG (for tools that don't accept SVG).

## One-time setup

```sh
cd infra/qr
npm install
```

This installs `qrcode` and `tsx` into `infra/qr/node_modules/` (kept fully
separate from the campaign-web app's deps).

## Run

```sh
npx tsx generate.ts <url>
```

Example for the production deploy:

```sh
npx tsx generate.ts https://tvz-nagradna-igra-2026.vercel.app/
```

Output lands in `infra/qr/output/`:

- `campaign-qr.svg`
- `campaign-qr.png` (2048×2048)

The script is **idempotent** — re-running with the same (or a different)
URL overwrites the previous output.

## Wire it into the poster page

The `/poster` route in `campaign-web` reads the QR from
`campaign-web/public/qr.svg`. After generating, copy the SVG over:

PowerShell:

```powershell
Copy-Item infra/qr/output/campaign-qr.svg campaign-web/public/qr.svg
```

Bash / macOS / Linux:

```sh
cp infra/qr/output/campaign-qr.svg campaign-web/public/qr.svg
```

Commit the resulting `campaign-web/public/qr.svg` so Vercel ships it.

## Settings

- **Error-correction level: H** (~30% redundancy). Survives moderate
  damage, smudging, or partial coverage on a printed poster.
- **Margin:** 2 modules of quiet zone (the white border scanners need).
- **Colours:** plain black on white. Don't change without re-testing scan
  reliability on real Android cameras at typical poster distance (~50 cm).
