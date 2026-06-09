/// Mirrors the JSON shape documented in
/// `shared-docs/design/scan-api.md`.

enum Verdict { safe, suspicious, malicious, unknown }

Verdict _parseVerdict(String? raw) {
  switch (raw) {
    case 'safe':
      return Verdict.safe;
    case 'suspicious':
      return Verdict.suspicious;
    case 'malicious':
      return Verdict.malicious;
    default:
      return Verdict.unknown;
  }
}

class VTStats {
  final int malicious;
  final int suspicious;
  final int harmless;
  final int undetected;
  final int timeout;

  const VTStats({
    required this.malicious,
    required this.suspicious,
    required this.harmless,
    required this.undetected,
    this.timeout = 0,
  });

  factory VTStats.fromJson(Map<String, dynamic> json) {
    return VTStats(
      malicious: (json['malicious'] as num?)?.toInt() ?? 0,
      suspicious: (json['suspicious'] as num?)?.toInt() ?? 0,
      harmless: (json['harmless'] as num?)?.toInt() ?? 0,
      undetected: (json['undetected'] as num?)?.toInt() ?? 0,
      timeout: (json['timeout'] as num?)?.toInt() ?? 0,
    );
  }
}

class ScanResult {
  final Verdict verdict;
  final VTStats? stats;
  final DateTime fetchedAt;
  final bool cached;
  final String? errorMessage;

  const ScanResult({
    required this.verdict,
    required this.stats,
    required this.fetchedAt,
    required this.cached,
    this.errorMessage,
  });

  factory ScanResult.fromJson(Map<String, dynamic> json) {
    final dynamic statsJson = json['stats'];
    return ScanResult(
      verdict: _parseVerdict(json['verdict'] as String?),
      stats: statsJson is Map<String, dynamic>
          ? VTStats.fromJson(statsJson)
          : null,
      fetchedAt: DateTime.tryParse(json['fetchedAt'] as String? ?? '') ??
          DateTime.now(),
      cached: json['cached'] as bool? ?? false,
    );
  }

  factory ScanResult.unknownWithError(String message) {
    return ScanResult(
      verdict: Verdict.unknown,
      stats: null,
      fetchedAt: DateTime.now(),
      cached: false,
      errorMessage: message,
    );
  }
}
