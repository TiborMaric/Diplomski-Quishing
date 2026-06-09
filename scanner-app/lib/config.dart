/// App-level configuration injected at build/run time via
/// `--dart-define-from-file=env.json`.
///
/// Holding everything here keeps the rest of the app reading via a single
/// typed accessor. See README for setup.
class AppConfig {
  /// Full URL of the `/api/scan` endpoint deployed alongside the campaign.
  static const String scanApiUrl =
      String.fromEnvironment('SCAN_API_URL');

  /// Shared secret sent in the `X-Scan-Key` header on every request.
  /// Ships inside the APK — see README for rotation procedure.
  static const String scanProxyApiKey =
      String.fromEnvironment('SCAN_PROXY_API_KEY');

  /// True only when both env values are non-empty. The app surfaces a
  /// friendly error in the scan result if this is false.
  static bool get isConfigured =>
      scanApiUrl.isNotEmpty && scanProxyApiKey.isNotEmpty;
}
