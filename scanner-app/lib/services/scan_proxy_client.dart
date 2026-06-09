import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import 'package:quishing_scanner/config.dart';
import 'package:quishing_scanner/models/scan_result.dart';
import 'package:quishing_scanner/strings.dart';

/// Thin client for the `/api/scan` proxy. Single method `fetchVerdict`
/// returns a `ScanResult` — never throws to the UI; network and HTTP
/// errors are converted into `ScanResult.unknownWithError` so the result
/// screen always has something to render.
class ScanProxyClient {
  static const Duration _timeout = Duration(seconds: 15);

  Future<ScanResult> fetchVerdict(String url) async {
    if (!AppConfig.isConfigured) {
      return ScanResult.unknownWithError(AppStrings.configMissing);
    }

    final Uri? uri = Uri.tryParse(AppConfig.scanApiUrl);
    if (uri == null) {
      return ScanResult.unknownWithError(AppStrings.configMissing);
    }

    try {
      final http.Response res = await http
          .post(
            uri,
            headers: <String, String>{
              HttpHeaders.contentTypeHeader: 'application/json',
              'X-Scan-Key': AppConfig.scanProxyApiKey,
            },
            body: jsonEncode(<String, String>{'url': url}),
          )
          .timeout(_timeout);

      if (res.statusCode != 200) {
        return ScanResult.unknownWithError(AppStrings.networkErrorBody);
      }

      final Map<String, dynamic> json =
          jsonDecode(res.body) as Map<String, dynamic>;
      return ScanResult.fromJson(json);
    } on TimeoutException {
      return ScanResult.unknownWithError(AppStrings.networkErrorBody);
    } on SocketException {
      return ScanResult.unknownWithError(AppStrings.networkErrorBody);
    } catch (_) {
      return ScanResult.unknownWithError(AppStrings.networkErrorBody);
    }
  }
}
