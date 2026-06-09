import 'package:flutter/material.dart';

import 'package:quishing_scanner/models/scan_result.dart';

class AppTheme {
  static final ThemeData light = ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: Colors.amber,
      brightness: Brightness.light,
    ),
    useMaterial3: true,
    appBarTheme: const AppBarTheme(
      centerTitle: true,
      elevation: 0,
    ),
  );

  static Color verdictColor(Verdict v) {
    switch (v) {
      case Verdict.safe:
        return Colors.green.shade600;
      case Verdict.suspicious:
        return Colors.amber.shade600;
      case Verdict.malicious:
        return Colors.red.shade600;
      case Verdict.unknown:
        return Colors.grey.shade600;
    }
  }

  static IconData verdictIcon(Verdict v) {
    switch (v) {
      case Verdict.safe:
        return Icons.check_circle;
      case Verdict.suspicious:
        return Icons.warning;
      case Verdict.malicious:
        return Icons.dangerous;
      case Verdict.unknown:
        return Icons.help_outline;
    }
  }
}
