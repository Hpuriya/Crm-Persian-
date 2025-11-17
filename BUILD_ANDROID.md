**Build on GitHub Actions (recommended for mobile-only users)**

Short: push your repo to GitHub and the workflow will build a debug APK you can download from the Actions page.

Steps:
- Ensure this repo is on GitHub (on branch `main`).
- Push your changes (the workflow is at `.github/workflows/android-build.yml`).
- Open the repo on GitHub → Actions → select the latest run of `Build Android Debug APK` → wait for it to finish.
- Download the artifact named `app-debug-apk` (contains `app-debug.apk`).

Notes & next steps:
- The artifact is a debug APK (unsigned for release). Use it for testing on devices.
- To create a signed release AAB/APK for Play Store, you can either:
  - Build locally with Android Studio and Generate Signed Bundle/APK (recommended), or
  - Extend the CI: store your keystore as a GitHub secret and add signing steps to the workflow.
- If the workflow fails (CI environment differences), open the Actions log to see the exact error; I can help diagnose and patch the workflow.

Detailed steps (push + download + install)

1) Commit & push changes to GitHub (example):

```bash
git add .
git commit -m "CI: build Android debug APK"
git push origin main
```

2) Start or wait for the workflow run:
- Visit your repository on GitHub → `Actions` tab.
- Click the `Build Android Debug APK` workflow and open the latest run. You can also press `Run workflow` (on the right) to trigger manually.

3) Download the artifact:
- When the run completes, expand the `Artifacts` section (bottom-right) and download `app-debug-apk`.
- The downloaded ZIP contains `app-debug.apk`.

4) Install the APK on your Android device (testing only):
- Enable installing from unknown sources for the app you use to open the APK (browser or file manager). On modern Android:
  - Settings → Apps → (choose browser or file manager) → Install unknown apps → Allow.
- Transfer the APK to your phone or download it directly from the browser on your phone and tap it to install.
- Because this is a debug APK, Google Play Protect may warn you — allow installation only if you trust the source (your repo).

Security & release notes
- This APK is a debug build (not suitable for Play Store). For publishing, create a signed release AAB or APK.
- To automate signed releases in CI, add your keystore as a GitHub secret (e.g., `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`) and I can add signing steps to the workflow.

Troubleshooting
- If you see build failures in Actions, copy the log lines and share them here; I'll patch the workflow.
- Artifacts are retained by GitHub for a limited time (default 90 days); download promptly.

