# scanner-app — Sigurni QR

Phase 2 of the Quishing thesis: a Flutter Android app that decodes a QR
code, sends the embedded URL to the `/api/scan` proxy for a VirusTotal
verdict, and shows the user a colour-coded "open / don't open"
recommendation **before** the browser is ever launched.

## Stack

- Flutter / Dart, Android only
- [`mobile_scanner`](https://pub.dev/packages/mobile_scanner) — QR camera
- [`http`](https://pub.dev/packages/http) — POST to `/api/scan`
- [`url_launcher`](https://pub.dev/packages/url_launcher) — open the user-confirmed URL
- [`permission_handler`](https://pub.dev/packages/permission_handler) — camera permission UX
- [`flutter_launcher_icons`](https://pub.dev/packages/flutter_launcher_icons) — launcher icon

## Setup

```sh
cd scanner-app
flutter pub get
cp env.json.example env.json
```

Edit `env.json` and paste:

- `SCAN_API_URL` — the live Vercel `/api/scan` endpoint
- `SCAN_PROXY_API_KEY` — the shared secret you stored in your password
  manager during Sprint 3

`env.json` is **gitignored** — never commit it.

### Launcher icon

Drop a 1024×1024 PNG at `assets/icon.png`, then:

```sh
dart run flutter_launcher_icons
```

If you don't have artwork yet, the default flutter icon ships in the APK
until you replace it.

## Run

VS Code: press **F5**. The launch config in `.vscode/launch.json` passes
`--dart-define-from-file=env.json` for you.

Or from CLI:

```sh
flutter run --dart-define-from-file=env.json
```

## Release APK

```sh
flutter build apk --release --dart-define-from-file=env.json
```

The APK lands at `build/app/outputs/flutter-apk/app-release.apk`.

## Install on a real Android phone (USB)

1. On the phone: **Settings → About phone → tap "Build number" seven times**,
   then back → **Developer options** → enable **USB debugging**.
2. Plug the phone into the PC via USB and accept the "Allow USB
   debugging?" prompt on the phone.
3. Verify the connection:
   ```sh
   flutter devices
   ```
   Your phone should appear in the list.
4. Either run a debug build straight onto the phone:
   ```sh
   flutter run --dart-define-from-file=env.json
   ```
   …or install the signed release APK:
   ```sh
   adb install build/app/outputs/flutter-apk/app-release.apk
   ```

## Rotating the proxy key

`SCAN_PROXY_API_KEY` is embedded in the APK at build time. If it leaks,
the worst case is someone burning your VirusTotal quota:

1. Generate a new key (`openssl rand -base64 32`).
2. Update the value in **Vercel** (Project Settings → Environment
   Variables) and trigger a redeploy.
3. Update `env.json` locally.
4. Rebuild and reinstall:
   ```sh
   flutter build apk --release --dart-define-from-file=env.json
   adb install -r build/app/outputs/flutter-apk/app-release.apk
   ```

## Out of scope for this sprint

iOS, Play Store publishing, persistent scan history, user accounts,
analytics back to Supabase, dark mode, splash screen polish, automated
tests. See `shared-docs/design/scan-api.md` for the API contract Sprint
4 implements against.
