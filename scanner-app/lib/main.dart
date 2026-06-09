import 'package:flutter/material.dart';

import 'package:quishing_scanner/screens/scanner_screen.dart';
import 'package:quishing_scanner/strings.dart';
import 'package:quishing_scanner/theme.dart';

void main() {
  runApp(const QuishingScannerApp());
}

class QuishingScannerApp extends StatelessWidget {
  const QuishingScannerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppStrings.appTitle,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: const ScannerScreen(),
    );
  }
}
