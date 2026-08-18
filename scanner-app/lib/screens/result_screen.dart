import 'dart:async';

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:quishing_scanner/models/scan_result.dart';
import 'package:quishing_scanner/services/scan_proxy_client.dart';
import 'package:quishing_scanner/strings.dart';
import 'package:quishing_scanner/widgets/verdict_card.dart';

class ResultScreen extends StatefulWidget {
  final String url;

  const ResultScreen({super.key, required this.url});

  @override
  State<ResultScreen> createState() => _ResultScreenState();
}

class _ResultScreenState extends State<ResultScreen> {
  final ScanProxyClient _client = ScanProxyClient();
  ScanResult? _result;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() {
      _loading = true;
    });
    final ScanResult result = await _client.fetchVerdict(widget.url);
    if (!mounted) return;
    setState(() {
      _result = result;
      _loading = false;
    });
  }

  Future<void> _openUrl() async {
    final Uri? uri = Uri.tryParse(widget.url);
    if (uri == null) return;
    final bool ok =
        await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text(AppStrings.openFailed)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        child: _loading
            ? const _LoadingView()
            : Padding(
                padding: const EdgeInsets.all(16),
                child: VerdictCard(
                  result: _result!,
                  url: widget.url,
                  onRetry: _fetch,
                  onOpen: _openUrl,
                ),
              ),
      ),
    );
  }
}

/// Spinner for the verdict lookup. A URL VirusTotal has never seen has to
/// be submitted and polled, which can take ~25 s, so after 6 s a second
/// line explains the wait rather than leaving the user staring at a
/// spinner that looks stuck.
class _LoadingView extends StatefulWidget {
  const _LoadingView();

  @override
  State<_LoadingView> createState() => _LoadingViewState();
}

class _LoadingViewState extends State<_LoadingView> {
  static const Duration _slowThreshold = Duration(seconds: 6);

  Timer? _timer;
  bool _slow = false;

  @override
  void initState() {
    super.initState();
    _timer = Timer(_slowThreshold, () {
      if (mounted) setState(() => _slow = true);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            const Text(AppStrings.checkingUrl),
            AnimatedOpacity(
              opacity: _slow ? 1 : 0,
              duration: const Duration(milliseconds: 300),
              child: const Padding(
                padding: EdgeInsets.only(top: 12),
                child: Text(
                  AppStrings.checkingUrlSlow,
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13, height: 1.4),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
