# Character Archive — GitHub Pages + personal OneDrive

A dark-themed, browser-based character profile manager. Every novel is a folder in the application's **OneDrive app folder**. Each character is an individual JSON file; portraits live in a separate Portraits folder. No server, database subscription, API key, or purchased domain is required.

## 1. Publish the app on GitHub Pages

1. In GitHub, make a **new public repository**, for example `character-archive`.
2. Upload `index.html`, `styles.css`, and `app.js` at the repository root, then commit.
3. Open **Settings → Pages → Build and deployment → Deploy from a branch**. Select `main` and `/ (root)`, then Save.
4. Your address will be similar to `https://YOURUSERNAME.github.io/character-archive/`. Wait for the live Pages link and open it. The source code in a public repository is public; **do not upload story notes, passwords, or any secret**. All profiles will be saved in your private OneDrive.

## 2. Register Microsoft sign-in

1. Visit [Microsoft Entra admin center](https://entra.microsoft.com/), then **Identity → Applications → App registrations → New registration**. Your personal Microsoft account may not have permission to register an app in a tenant. If so, you may need a separate free Entra tenant or a different account to register the app, while still signing into the finished app with your **personal Microsoft account**. This is an account-dependent setup constraint.
2. Name it `Character Archive`.
3. **Supported account types**: select **Personal Microsoft accounts only** (if available), or the option that includes personal Microsoft accounts.
4. Under **Authentication → Add a platform**, choose **Single-page application (SPA)**. Enter the *exact* GitHub Pages address, including the ending `/`. Do not choose the “Web” platform.
5. Under **API permissions → Add a permission → Microsoft Graph → Delegated permissions**, add `Files.ReadWrite.AppFolder`. This permission is presently marked **preview** by Microsoft. Depending on the app registration experience it may require an additional consent step. Do **not** create a client secret.
6. Copy the **Application (client) ID** shown on the app's Overview page.
7. Open your hosted Character Archive, choose **App setup**, paste the client ID, and check that its displayed redirect URI matches the one in Entra. Then **Connect OneDrive**, consent, and start a novel.

**If the AppFolder preview permission is unavailable or fails on your account:** Stop and check the permission/consent error. This version deliberately does not silently request the broader `Files.ReadWrite` permission. We can adapt it consciously if necessary.

## 3. How it stores data

OneDrive → Apps → Character Archive (app-registration display name) → `<Novel title>` → `Characters` → `<Character name>--<ID>.json`; images are in `<Novel title>/Portraits/`.

Each novel has separate folders. The app stores files using Microsoft's Graph API with delegated consent and uses `If-Match` on existing character files to detect cloud version conflicts.

## 4. Limitations to know

- **Sign-in and cloud features need internet and a deployed HTTPS site** (or a localhost development server). Double-clicking `index.html` locally is not sufficient for Microsoft OAuth.
- Autosave occurs after a short typing pause. Wait until **Saved to OneDrive** before closing the tab or using a second computer. Do not edit the same character simultaneously on two computers.
- If a conflict occurs, edits remain in the current browser session until reload; copy your edits before refreshing.
- The **Export profiles** button exports JSON for the *currently loaded novel*, not all novels and not portrait images. It is a reference/export, **not a complete restorable backup**. To back up everything, copy the application's folder directly in OneDrive, including Portraits.
- Character links are shown in both profiles, but **relationship descriptions are separate notes on each profile**. Removing a link on one profile doesn't automatically erase the other character's own link.
- Removing a portrait from the profile does not delete its old image from OneDrive; the app prioritizes safe preservation over aggressive cloud cleanup.
- Portraits: PNG/JPEG/WebP, max 5 MB each.
- Microsoft authentication is handled client-side with the official MSAL Browser library from jsDelivr. Network access to this CDN is required to initially load sign-in. All data requests go straight from the browser to Microsoft Graph.

## Documentation

- https://learn.microsoft.com/en-us/graph/onedrive-sharepoint-appfolder
- https://learn.microsoft.com/en-us/graph/auth-register-app-v2
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
