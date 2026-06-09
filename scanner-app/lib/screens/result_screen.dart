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

class _LoadingView extends StatelessWidget {
  const _LoadingView();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          CircularProgressIndicator(),
          SizedBox(height: 16),
          Text(AppStrings.checkingUrl),
        ],
      ),
    );
  }
}
