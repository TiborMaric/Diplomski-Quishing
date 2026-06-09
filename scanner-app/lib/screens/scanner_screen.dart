import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';

import 'package:quishing_scanner/screens/result_screen.dart';
import 'package:quishing_scanner/strings.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen>
    with WidgetsBindingObserver {
  late final MobileScannerController _controller;
  PermissionStatus? _cameraStatus;
  bool _navigating = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _controller = MobileScannerController(
      detectionSpeed: DetectionSpeed.noDuplicates,
      formats: const <BarcodeFormat>[BarcodeFormat.qrCode],
    );
    _requestPermission();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _controller.dispose();
    super.dispose();
  }

  Future<void> _requestPermission() async {
    final PermissionStatus status = await Permission.camera.request();
    if (!mounted) return;
    setState(() {
      _cameraStatus = status;
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_cameraStatus?.isGranted != true) return;
    if (state == AppLifecycleState.resumed) {
      _controller.start();
    } else if (state == AppLifecycleState.paused) {
      _controller.stop();
    }
  }

  Future<void> _handleDetection(BarcodeCapture capture) async {
    if (_navigating) return;

    String? raw;
    for (final Barcode b in capture.barcodes) {
      if (b.rawValue != null && b.rawValue!.isNotEmpty) {
        raw = b.rawValue;
        break;
      }
    }
    if (raw == null) return;

    final Uri? uri = Uri.tryParse(raw);
    if (uri == null || (uri.scheme != 'http' && uri.scheme != 'https')) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text(AppStrings.notAUrl)),
      );
      return;
    }

    _navigating = true;
    await _controller.stop();
    if (!mounted) return;
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (BuildContext _) => ResultScreen(url: raw!),
      ),
    );
    if (mounted) {
      _navigating = false;
      await _controller.start();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_cameraStatus == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    if (!_cameraStatus!.isGranted) {
      return const _PermissionDeniedScaffold();
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text(AppStrings.scannerTitle),
        actions: <Widget>[
          IconButton(
            tooltip: AppStrings.flashlightTooltip,
            icon: ValueListenableBuilder<MobileScannerState>(
              valueListenable: _controller,
              builder: (BuildContext context, MobileScannerState state, _) {
                final bool on = state.torchState == TorchState.on;
                return Icon(on ? Icons.flash_on : Icons.flash_off);
              },
            ),
            onPressed: () => _controller.toggleTorch(),
          ),
        ],
      ),
      body: Stack(
        fit: StackFit.expand,
        children: <Widget>[
          MobileScanner(
            controller: _controller,
            onDetect: _handleDetection,
          ),
          Center(
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white, width: 4),
                borderRadius: BorderRadius.circular(24),
              ),
            ),
          ),
          const Positioned(
            left: 16,
            right: 16,
            bottom: 32,
            child: Card(
              elevation: 4,
              child: Padding(
                padding: EdgeInsets.all(12),
                child: Text(
                  AppStrings.scannerHelper,
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PermissionDeniedScaffold extends StatelessWidget {
  const _PermissionDeniedScaffold();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text(AppStrings.permissionTitle)),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              const Icon(Icons.no_photography, size: 80, color: Colors.grey),
              const SizedBox(height: 24),
              const Text(
                AppStrings.permissionBody,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 16, height: 1.4),
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => openAppSettings(),
                child: const Text(AppStrings.openSettings),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
