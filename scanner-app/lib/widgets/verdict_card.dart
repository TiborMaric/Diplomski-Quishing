import 'package:flutter/material.dart';

import 'package:quishing_scanner/models/scan_result.dart';
import 'package:quishing_scanner/strings.dart';
import 'package:quishing_scanner/theme.dart';

class VerdictCard extends StatefulWidget {
  final ScanResult result;
  final String url;
  final Future<void> Function() onOpen;
  final VoidCallback onRetry;

  const VerdictCard({
    super.key,
    required this.result,
    required this.url,
    required this.onOpen,
    required this.onRetry,
  });

  @override
  State<VerdictCard> createState() => _VerdictCardState();
}

class _VerdictCardState extends State<VerdictCard> {
  bool _riskAccepted = false;

  String _label(Verdict v) {
    switch (v) {
      case Verdict.safe:
        return AppStrings.verdictSafeLabel;
      case Verdict.suspicious:
        return AppStrings.verdictSuspiciousLabel;
      case Verdict.malicious:
        return AppStrings.verdictMaliciousLabel;
      case Verdict.unknown:
        return AppStrings.verdictUnknownLabel;
    }
  }

  String _body(Verdict v) {
    switch (v) {
      case Verdict.safe:
        return AppStrings.verdictSafeBody;
      case Verdict.suspicious:
        return AppStrings.verdictSuspiciousBody;
      case Verdict.malicious:
        return AppStrings.verdictMaliciousBody;
      case Verdict.unknown:
        return AppStrings.verdictUnknownBody;
    }
  }

  String _openLabel(Verdict v) {
    switch (v) {
      case Verdict.safe:
        return AppStrings.openInBrowserSafe;
      case Verdict.suspicious:
        return AppStrings.openInBrowserSuspicious;
      case Verdict.malicious:
        return AppStrings.openInBrowserMalicious;
      case Verdict.unknown:
        return AppStrings.openInBrowserUnknown;
    }
  }

  Future<void> _onOpenPressed() async {
    final Verdict v = widget.result.verdict;
    if (v == Verdict.safe) {
      await widget.onOpen();
      return;
    }
    if (v == Verdict.suspicious) {
      final bool ok = await _confirm(
        AppStrings.confirmSuspiciousTitle,
        AppStrings.confirmSuspiciousBody,
      );
      if (ok) await widget.onOpen();
      return;
    }
    if (v == Verdict.unknown) {
      final bool ok = await _confirm(
        AppStrings.confirmUnknownTitle,
        AppStrings.confirmUnknownBody,
      );
      if (ok) await widget.onOpen();
      return;
    }
    // malicious: button is enabled only when checkbox checked.
    await widget.onOpen();
  }

  Future<bool> _confirm(String title, String body) async {
    final bool? res = await showDialog<bool>(
      context: context,
      builder: (BuildContext ctx) => AlertDialog(
        title: Text(title),
        content: Text(body),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text(AppStrings.confirmNo),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text(AppStrings.confirmYes),
          ),
        ],
      ),
    );
    return res ?? false;
  }

  @override
  Widget build(BuildContext context) {
    final Verdict v = widget.result.verdict;
    final Color color = AppTheme.verdictColor(v);
    final IconData icon = AppTheme.verdictIcon(v);
    final bool isMalicious = v == Verdict.malicious;
    final bool openEnabled = !isMalicious || _riskAccepted;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          if (widget.result.errorMessage != null) ...<Widget>[
            Material(
              color: Colors.red.shade50,
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: <Widget>[
                    const Icon(Icons.error_outline, color: Colors.red),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        widget.result.errorMessage!,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ),
                    TextButton(
                      onPressed: widget.onRetry,
                      child: const Text(AppStrings.retry),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
          Card(
            color: color.withValues(alpha: 0.12),
            shape: RoundedRectangleBorder(
              side: BorderSide(color: color, width: 2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[
                  Icon(icon, color: color, size: 64),
                  const SizedBox(height: 12),
                  Text(
                    _label(v),
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: color,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: SelectableText(
                      widget.url,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 13,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _body(v),
                    style: const TextStyle(fontSize: 15, height: 1.4),
                  ),
                  if (isMalicious) ...<Widget>[
                    const SizedBox(height: 16),
                    CheckboxListTile(
                      controlAffinity: ListTileControlAffinity.leading,
                      contentPadding: EdgeInsets.zero,
                      value: _riskAccepted,
                      onChanged: (bool? val) => setState(() {
                        _riskAccepted = val ?? false;
                      }),
                      title: const Text(AppStrings.understandRisk),
                    ),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: openEnabled ? _onOpenPressed : null,
            style: FilledButton.styleFrom(
              backgroundColor: color,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: Text(
              _openLabel(v),
              style: const TextStyle(fontSize: 16),
            ),
          ),
          const SizedBox(height: 8),
          OutlinedButton(
            onPressed: () => Navigator.of(context).pop(),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: const Text(AppStrings.scanAgain),
          ),
        ],
      ),
    );
  }
}
