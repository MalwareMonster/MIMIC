A self-contained fake browser window you drop onto any page and open with a single function call. It renders a title bar, an address bar with a working "View site information" popup, a certificate viewer, and an on-device site-data dialog. Everything is driven by a single options object, and it styles only itself, so it never changes the host page's background, fonts, or layout.

<!-- Add a screenshot or demo GIF here -->

## Contents

- [Files](#files)
- [Quick start](#quick-start)
- [Functions](#functions)
- [How options merge](#how-options-merge)
- [Content options](#content-options)
- [Behaviour options](#behaviour-options)
- [Window controls and interactions](#window-controls-and-interactions)
- [Theming and OS look](#theming-and-os-look)

## Files

| File | What it is |
| --- | --- |
| `mimic.js` | The self-contained include. It injects its own CSS and markup and exposes the API. This is the only file you need. |
| `index.html` | A minimal host page: a launcher button plus a worked example that passes every option. |
| `README.md` | This document. |

## Quick start

Include the script and call `openBrowserWindow()` from any event:

```html
<div class="launcher">
  <button onclick="openBrowserWindow()">Open browser window</button>
</div>

<script src="mimic.js"></script>
```

That is all it takes. The script injects its stylesheet and markup on load, and exposes `openBrowserWindow` and `closeBrowserWindow` globally. You can put the `<script>` in the `<head>` (with `defer`), at the end of `<body>`, or anywhere, because it waits for the DOM if needed.

To customise the window, pass an options object:

```js
openBrowserWindow({
  domain: 'accounts.example.com',
  pageTitle: 'Sign in - Example',
  scheme: 'https://',
  src: 'https://example.com'
});
```

See `index.html` for an example that fills in every option at once.

## Functions

### `openBrowserWindow(options?)`

Opens the window. On the first call it clones the markup into the page and wires everything up. Later calls just re-show it. Every value is optional, so pass only what you want to change.

### `closeBrowserWindow()`

Hides the window and brings the demo launcher back. Call `openBrowserWindow()` again to re-show it. This is the same action as the title-bar close and minimise buttons.

## How options merge

The options object is merged into the internal config:

- **Objects merge deeply.** Pass only the field you care about and the rest keep their defaults, for example `cookies: { sitesAllowed: '2 sites allowed' }`.
- **Arrays are replaced whole.** Passing `siteData.sections` or a `certificate` tree's `children` swaps the entire list rather than merging item by item.
- **`os`, `theme`, and `debug` are special.** They control behaviour rather than content, so they are handled separately and never written into the config.

Each option only changes when you pass it, so repeated calls are additive.

## Content options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `domain` | string | `accounts.google.com` | The secure origin. Shown bright and emphasised in the address bar, and used as the popup and certificate-viewer titles. |
| `addressText` | string | *(long OAuth query)* | The visible path or query after the domain, shown muted. It truncates automatically with an ellipsis at the right edge, so do **not** add your own `...`. |
| `scheme` | string | `https://` | Shown grey at the front of the URL only while the address bar is focused, and hidden when idle, like Chrome. |
| `pageTitle` | string | `Sign in - Google Accounts` | Text in the window title bar. Centred on macOS, left-aligned on Windows and Linux. |
| `favicon` | string (URL) | *(Google faviconV2 URL)* | Image shown in the title bar. A broken URL renders nothing, so use a real image endpoint. |
| `src` | string (URL) | `https://example.com` | What actually loads inside the window's `<iframe>`. It can differ from the displayed address, since real sign-in pages block being framed. |
| `learnMoreUrl` | string (URL) | *(Chrome support page)* | Where the Security screen's "Learn more" link opens (in a new tab). |
| `siteSettingsUrl` | string (URL) | `chrome://settings/...` | Where the main popup's "Site settings" row opens (in a new tab). Browsers block navigating to `chrome://` URLs from a page, so use an `http(s)` URL if you need it to load. |

### `cookies`

Text on the "Cookies and site data" popup screen.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `cookies.sitesAllowed` | string | `5 sites allowed` | Sub-label under "Manage on-device site data". |

```js
openBrowserWindow({ cookies: { sitesAllowed: '2 sites allowed' } });
```

### `siteData`

The "On-device site data" dialog, opened from **Manage on-device site data**.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `siteData.intro` | string | *(intro sentence)* | Paragraph at the top of the dialog. |
| `siteData.manageLinkText` | string | `Manage site data` | Text of the blue link after the intro. |
| `siteData.manageUrl` | string (URL) | `''` | If set, the link opens this URL in a new tab. If empty, the link does nothing. |
| `siteData.sections` | array | *(two sections)* | List of sections. Replaces the whole list. |

Each **section** is an object:

| Field | Type | Description |
| --- | --- | --- |
| `title` | string | Bold section heading. |
| `description` | string | Grey paragraph under the heading. |
| `sites` | array | List of site rows. |

Each **site** is an object:

| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Domain shown on the row, with a globe icon. A trash icon deletes the row. |
| `subtitle` | string *(optional)* | Small grey line under the name. |

```js
openBrowserWindow({
  siteData: {
    intro: 'Sites can store data on your device to improve your visit.',
    manageLinkText: 'Manage site data',
    manageUrl: 'https://example.com/settings/cookies',
    sections: [
      {
        title: 'Data from the site you are visiting',
        description: 'This info is available to the site and its subdomains.',
        sites: [
          { name: 'accounts.example.com' },
          { name: 'example.com' }
        ]
      },
      {
        title: 'Data from embedded sites',
        description: 'Embedded content from other sites can also store data.',
        sites: [
          { name: 'cdn.example.net', subtitle: 'Treated the same as the site you are viewing' }
        ]
      }
    ]
  }
});
```

### `certificate`

The Certificate Viewer, opened from **Certificate is valid** on the Security screen. It always renders in light mode regardless of the window theme, with a **General** tab and a **Details** tab.

**General tab.** The `subject`, `issuer`, `validity`, and `fingerprints`:

| Field | Type | Description |
| --- | --- | --- |
| `certificate.subject.commonName` | string | "Issued To" common name (also the viewer's title). |
| `certificate.subject.organisation` | string | "Issued To" organisation. |
| `certificate.subject.organisationalUnit` | string | "Issued To" organisational unit. |
| `certificate.issuer.commonName` | string | "Issued By" common name. |
| `certificate.issuer.organisation` | string | "Issued By" organisation. |
| `certificate.issuer.organisationalUnit` | string | "Issued By" organisational unit. |
| `certificate.validity.issuedOn` | string | "Issued On" date text. |
| `certificate.validity.expiresOn` | string | "Expires On" date text. |
| `certificate.fingerprints.certificate` | string | SHA-256 certificate fingerprint (monospace). |
| `certificate.fingerprints.publicKey` | string | SHA-256 public-key fingerprint (monospace). |

Angle-bracket values such as `<Not part of certificate>` are safe, and render literally.

**Details tab.** The `hierarchy` and `fields`, both trees:

| Field | Type | Description |
| --- | --- | --- |
| `certificate.hierarchy` | tree node | The "Certificate Hierarchy" chain, with the issuer at the top and the subject beneath. |
| `certificate.fields` | tree node | The "Certificate Fields" tree. Clicking a node shows its `value` in the Field Value box. |

A **tree node** is an object:

| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Label shown in the tree. |
| `value` | string *(optional)* | Shown in the Field Value box when the node is selected. Supports `\n` for line breaks. |
| `children` | array *(optional)* | Child nodes. A node with children is collapsible. |

```js
openBrowserWindow({
  certificate: {
    subject: { commonName: '*.example.com', organisation: '<Not part of certificate>' },
    issuer:  { commonName: 'Example CA', organisation: 'Example Trust Services' },
    validity: {
      issuedOn:  'Monday, 20 July 2026 at 19:05:56',
      expiresOn: 'Monday, 12 October 2026 at 19:05:55'
    },
    fingerprints: {
      certificate: 'aa bb cc ...',
      publicKey:   'dd ee ff ...'
    },
    hierarchy: {
      name: 'Example CA',
      children: [ { name: '*.example.com' } ]
    },
    fields: {
      name: '*.example.com',
      children: [
        { name: 'Certificate', children: [
          { name: 'Version', value: 'V3' },
          { name: 'Validity', children: [
            { name: 'Not Before', value: 'Monday, 20 July 2026 at 19:05:56' },
            { name: 'Not After',  value: 'Monday, 12 October 2026 at 19:05:55' }
          ]}
        ]}
      ]
    }
  }
});
```

## Behaviour options

These are not part of the content config. They control how the window behaves, and are only changed when passed.

| Option | Type | Values | Default | Description |
| --- | --- | --- | --- | --- |
| `os` | string | `'mac'`, `'windows'`, `'linux'` | *(auto-detected)* | Forces the title-bar control style, system font, and title alignment (centred on macOS). Left alone, it follows the visitor's OS. |
| `theme` | string | `'auto'`, `'light'`, `'dark'` | `'auto'` | Forces light or dark. `'auto'` follows the system preference and updates live if it changes. |
| `debug` | boolean | `true`, `false` | `false` | When `true`, shows a floating switcher for flipping OS and theme live. Useful for previewing every look. |

```js
openBrowserWindow({ debug: true });                 // show the OS and theme switcher
openBrowserWindow({ os: 'linux', theme: 'dark' });   // force a specific look, no switcher
```

## Window controls and interactions

Built into the mockup, with no options needed:

- **Close** and **Minimise** both close the window. This is the macOS red and amber lights, and the Windows and Linux buttons.
- **Maximise** toggles filling the whole viewport. This is the macOS green light, and the square button on Windows and Linux.
- **Drag** the title bar to move the window. It is clamped to the browser edges, so it cannot be pushed off-screen.
- **Address bar.** Click to reveal the `https://` scheme and select the URL, then drag past the edge to scroll and reveal the rest. It is selectable and highlightable but cannot be edited. Clicking elsewhere, including into the page, deselects it.
- **View site information** (the icon on the left of the address bar) opens a popup with **Connection is secure**, **Cookies and site data**, and **Site settings**. The first two drill into sub-screens, and "Site settings" opens `siteSettingsUrl` in a new tab.

## Theming and OS look

- Light and dark follow the system preference by default and update live. Override with `theme`.
- The title-bar controls, system font, and title alignment follow the detected OS. Override with `os`.
- The Certificate Viewer intentionally stays light in all themes, matching the real OS dialog.

The window is a `position: fixed`, self-contained overlay. All of its styling, including colours, fonts, and the CSS reset it needs, is scoped to `#browser-window`, `.launcher`, and `.switcher` using `:where(...)`, which limits it to the mockup and adds no specificity. It does not set a page background, add classes to `<html>`, change the body font, or touch global CSS variables, so it can sit on any page without altering it.
