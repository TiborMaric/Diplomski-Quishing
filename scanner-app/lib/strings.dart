/// All user-facing Croatian strings. Single source so supervisor copy-edit
/// lands in one file. No localisation framework — Croatian only.
class AppStrings {
  // App
  static const String appTitle = 'Sigurni QR';

  // Scanner screen
  static const String scannerTitle = 'Skeniraj QR kod';
  static const String scannerHelper = 'Usmjeri kameru prema QR kodu';
  static const String flashlightTooltip = 'Uključi/isključi bljeskalicu';
  static const String notAUrl = 'Ovo nije URL';

  // Camera permission
  static const String permissionTitle = 'Pristup kameri';
  static const String permissionBody =
      'Aplikaciji je potreban pristup kameri kako bi mogla skenirati QR kodove. Pristup možeš omogućiti u postavkama sustava.';
  static const String openSettings = 'Otvori postavke';

  // Result screen — common
  static const String checkingUrl = 'Provjeravam URL...';
  static const String scanAgain = 'Skeniraj ponovno';
  static const String retry = 'Pokušaj ponovno';
  static const String errorTitle = 'Neuspjela provjera';
  static const String networkErrorBody =
      'Server za provjeru je nedostupan. Provjeri internetsku vezu i pokušaj ponovno.';

  // Verdict labels
  static const String verdictSafeLabel = 'Siguran link';
  static const String verdictSuspiciousLabel = 'Sumnjiv link';
  static const String verdictMaliciousLabel = 'Opasan link!';
  static const String verdictUnknownLabel = 'Nepoznat link';

  // Verdict explanations
  static const String verdictSafeBody =
      'Nijedan sigurnosni skener nije označio ovaj link kao opasan. Ipak provjeri da odredište izgleda očekivano prije unosa osobnih podataka.';
  static const String verdictSuspiciousBody =
      'Ovaj link sadrži oznake koje upućuju na moguće phishing pokušaje ili sumnjiv sadržaj. Otvori ga samo ako mu doista vjeruješ.';
  static const String verdictMaliciousBody =
      'Više sigurnosnih skenera označilo je ovaj link kao opasan. Najvjerojatnije se radi o phishingu, prevari ili malwareu. Preporučujemo da ga ne otvaraš.';
  static const String verdictUnknownBody =
      'Sigurnosna provjera nije uspjela ili nije dala konačan odgovor. Otvori link samo ako mu vjeruješ.';

  // Open-in-browser buttons
  static const String openInBrowserSafe = 'Otvori u pregledniku';
  static const String openInBrowserSuspicious = 'Otvori unatoč upozorenju';
  static const String openInBrowserMalicious = 'Otvori svejedno';
  static const String openInBrowserUnknown = 'Otvori svejedno';
  static const String understandRisk =
      'Razumijem rizik i svejedno želim otvoriti';

  // Confirmation dialogs
  static const String confirmSuspiciousTitle = 'Sumnjiv link';
  static const String confirmSuspiciousBody =
      'Sigurnosni skeneri označili su ovaj link kao moguće opasan. Jesi li siguran da ga želiš otvoriti?';
  static const String confirmUnknownTitle = 'Nepoznat link';
  static const String confirmUnknownBody =
      'Sigurnosna provjera nije uspjela. Jesi li siguran da želiš otvoriti?';
  static const String confirmYes = 'Otvori';
  static const String confirmNo = 'Odustani';

  // Open error
  static const String openFailed = 'Otvaranje nije uspjelo. Pokušaj kasnije.';

  // Misconfiguration
  static const String configMissing =
      'Konfiguracija nije postavljena. Provjeri env.json datoteku.';
}
