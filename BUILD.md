# Deep Sight — running it on a phone

One codebase, three delivery routes. The app itself is a single self-contained
file at `www/index.html` — no bundler, no framework, no network calls.

```
www/                  the app (this IS the website, and what ships inside the native apps)
  index.html          everything: UI, spectral engine, fish artwork
  manifest.webmanifest
  sw.js               offline support
  icons/
assets/               1024 icon + 2732 splash sources for native icon generation
ios/                  generated Xcode project  (needs macOS to build)
android/              generated Android Studio project
.github/workflows/    CI: TestFlight (macOS runner) and Android APK
```

---

## 1. Website — unchanged

```bash
npm run serve       # http://127.0.0.1:8777
```

Any static host works: push `www/` to Netlify, Vercel, GitHub Pages, Cloudflare
Pages. **HTTPS is required** for the service worker and for "Add to Home Screen".

---

## 2. On your iPhone right now — no Apple account, no cost

**It is already hosted:** <https://luizpaybyrd.github.io/deep-sight/>

1. Open that URL in **Safari** on the iPhone. It must be Safari — Chrome on iOS
   cannot install web apps.
2. **Share → Add to Home Screen → Add.**

GitHub Pages serves this repo root, and Pages branch mode can only publish `/` or
`/docs` — so the root `index.html` is a redirect into `www/`, which stays the single
shared source for the site and both native apps.

A push to `main` redeploys the site automatically, usually within a minute.

You get the app icon on the home screen, full screen with no browser chrome, the
dark status bar, offline launch, and the bottom tab bar. Updates land on the next
launch: the service worker is network-first with a 2.5 s timeout, so you get the
current build whenever you have signal, and the cached one when you do not.

### Android
Same URL in Chrome → menu → **Install app**. Or sideload the APK from route 4.

---

## 3. TestFlight — the real iOS app

**This cannot be built on Linux.** Apple's toolchain is macOS-only. You need:

- An **Apple Developer Program** membership — **$99/year**. TestFlight is not
  available without it.
- Either a Mac with Xcode, or the GitHub Actions workflow below (GitHub's macOS
  runners are free for public repos and billed at a multiplier for private ones).

### One-time setup

1. **App Store Connect → Users and Access → Integrations → App Store Connect API**
   → generate a key with the **App Manager** role. Download the `.p8` **once**.
   Note the **Key ID** and **Issuer ID**.
2. **App Store Connect → Apps → +** → new iOS app with bundle ID
   `com.luizdias.deepsight`. This must exist before the first upload.
3. Add four repository secrets (Settings → Secrets and variables → Actions):

   | Secret | Value |
   |---|---|
   | `ASC_KEY_ID` | the Key ID |
   | `ASC_ISSUER_ID` | the Issuer ID |
   | `ASC_KEY_P8_BASE64` | `base64 -w0 AuthKey_XXXX.p8` |
   | `APPLE_TEAM_ID` | 10-character Team ID from developer.apple.com → Membership |

4. Run the **iOS → TestFlight** workflow (Actions tab → Run workflow).

> **The CI workflows are not pushed yet.** Creating files under
> `.github/workflows/` needs the `workflow` OAuth scope, which the `gh` token on
> the dev box does not have. They are staged in `.ci-pending/`. To enable them:
>
> ```bash
> gh auth refresh -s workflow -h github.com   # one interactive browser approval
> ./enable-ci.sh
> ```

The build number is taken from the workflow run number, so every upload is unique
— TestFlight rejects a build number it has already seen. Processing on Apple's
side takes 5–15 minutes, then it appears in the TestFlight app on your phone.

### Or on a Mac directly

```bash
npm ci
npx cap sync ios
npx cap open ios          # opens Xcode
```
In Xcode: select the **App** target → Signing & Capabilities → pick your team →
Product → Archive → Distribute App → TestFlight.

### If you want to skip the $99

Two alternatives put a real native build on *your* phone without the paid program:

- **Free Apple ID signing** — a Mac with Xcode can install to a connected device
  with a personal team. The app expires after **7 days** and must be reinstalled.
  No TestFlight, no sharing.
- **AltStore / Sideloadly** — sideload an unsigned IPA, same 7-day expiry.

For anything you want to keep on the phone or share with other anglers, the PWA
(route 2) is the better answer until you decide the $99 is worth it.

---

## 4. Android APK — free, no account

Run the **Android APK** workflow; download the artifact; open the `.apk` on the
phone (allow "install unknown apps" for your browser or file manager once).

Locally, with JDK 21 and the Android SDK installed:

```bash
npm ci
npx cap sync android
cd android && ./gradlew assembleDebug
# android/app/build/outputs/apk/debug/app-debug.apk
```

For the Play Store you additionally need a signed release AAB
(`./gradlew bundleRelease` with a keystore) and a **$25 one-time** Play Console fee.

---

## Making changes

Edit `www/index.html` only. Then:

```bash
npx cap sync            # copies www/ into both native projects
```

`ios/App/App/public/` and `android/app/src/main/assets/public/` are generated by
that sync and are gitignored — never edit them by hand.

Regenerate icons and splash screens after changing `assets/icon.png`:

```bash
npx @capacitor/assets generate \
  --iconBackgroundColor '#28b58c' --iconBackgroundColorDark '#070d12' \
  --splashBackgroundColor '#0b141c' --splashBackgroundColorDark '#070d12'
```

### Bumping the service worker
When you change `www/index.html`, the network-first worker picks it up on the next
online launch. If you ever need to force every client to drop its cache, bump
`VERSION` in `www/sw.js`.
