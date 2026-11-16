/*
 * browser-window.js  -  self-contained fake browser window.
 * Include this file, then call openBrowserWindow() from any onClick.
 * It injects its own CSS and markup and never styles the host page.
 * See browser-window-options.md for every option.
 */
(function () {
  var CSS_TEXT = `
:where(#browser-window, .switcher, .launcher),
:where(#browser-window, .switcher, .launcher) *,
:where(#browser-window, .switcher, .launcher) *::before,
:where(#browser-window, .switcher, .launcher) *::after { box-sizing: border-box; }
:where(#browser-window, .switcher, .launcher) button,
:where(#browser-window, .switcher, .launcher) input {
  -webkit-appearance: none; appearance: none;
  background: transparent; border: 0; margin: 0; padding: 0; font: inherit; color: inherit;
}
:where(#browser-window, .switcher, .launcher) button { cursor: pointer; text-align: inherit; }
:where(#browser-window, .switcher, .launcher) svg,
:where(#browser-window, .switcher, .launcher) img { display: block; }
:where(#browser-window, .switcher, .launcher) p { margin: 0; }

/* --- Minimal utility layer --- */
.flex{display:flex}.flex-1{flex:1 1 0%}.flex-col{flex-direction:column}
.items-center{align-items:center}.items-stretch{align-items:stretch}.justify-center{justify-content:center}
.relative{position:relative}.hidden{display:none}.block{display:block}
.self-stretch{align-self:stretch}.shrink-0{flex-shrink:0}.min-w-0{min-width:0}
.overflow-hidden{overflow:hidden}.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cursor-pointer{cursor:pointer}.select-none{-webkit-user-select:none;user-select:none}
.rounded-full{border-radius:9999px}.rounded-lg{border-radius:.5rem}
.text-sm{font-size:.875rem;line-height:1.25rem}.text-xs{font-size:.75rem;line-height:1rem}
.font-medium{font-weight:500}.leading-relaxed{line-height:1.625}
.w-full{width:100%}.max-w-2xl{max-width:42rem}.h-full{height:100%}
.w-3{width:.75rem}.h-3{height:.75rem}.w-35{width:.875rem}.h-35{height:.875rem}
.w-4{width:1rem}.h-4{height:1rem}.w-6{width:1.5rem}.h-6{height:1.5rem}
.w-7{width:1.75rem}.h-7{height:1.75rem}.w-11{width:2.75rem}.h-9{height:2.25rem}.h-11{height:2.75rem}
.gap-2{gap:.5rem}.px-2{padding-left:.5rem;padding-right:.5rem}.px-3{padding-left:.75rem;padding-right:.75rem}
.pr-2{padding-right:.5rem}.mb-2{margin-bottom:.5rem}.ml-1{margin-left:.25rem}
.mt-1{margin-top:.25rem}.mt-05{margin-top:.125rem}.-mt-1{margin-top:-.25rem}.-mr-3{margin-right:-.75rem}
.tl-r{background:#ff5f57}.tl-a{background:#febc2e}.tl-g{background:#28c840}
#browser-window{box-shadow:0 0 0 1px rgba(0,0,0,.1),0 25px 50px -12px rgba(0,0,0,.25)}

    /* Surfaces driven by CSS variables set on the window from JS */
    #browser-window {
      background: var(--frame);
      position: fixed; inset: 0; margin: auto;
      z-index: 9999;
    }
    .title-bar   { background: var(--frame); color: var(--text); }
    .address-bar { background: var(--frame); color: var(--text); border-bottom: 1px solid var(--divider); }
    .addr-domain { color: var(--text); }
    .addr-path   { color: var(--muted); }
    .addr-scheme { color: var(--muted); }
    .addr-field { cursor: text; }
    .addr-url {
      position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-50%);
      overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
      color: var(--muted);
      pointer-events: none;
    }
    .addr-url.scrolling { text-overflow: clip; }
    .addr-input {
      position: absolute; inset: 0; width: 100%; height: 100%;
      background: transparent; border: 0; outline: 0; margin: 0; padding: 0;
      font-family: inherit; font-size: 0.875rem;
      color: transparent;
      caret-color: var(--text);
      -webkit-user-select: text; user-select: text;
    }
    .addr-input::selection { color: transparent; background: transparent; }
    .addr-input:focus::selection { color: #ffffff; background: #1a73e8; }
    .muted       { color: var(--muted); }
    .page-area   { background: var(--page); }

    .icon-btn { border-radius: 9999px; color: var(--text); }
    .icon-btn:hover { background: var(--hover); }

    .gnome-btn { background: var(--hover); color: var(--text); }
    .gnome-btn:hover { background: var(--hover2); }

    .caption-btn { color: var(--text); }
    .caption-btn:hover { background: var(--hover); }
    .caption-close:hover { background: #e81123 !important; color: #fff; }

    iframe { border: 0; }

    /* Draggable window: the title bar is the grab handle */
    .title-bar { cursor: grab; touch-action: none; }
    .title-bar.dragging { cursor: grabbing; }
    .title-bar button { cursor: pointer; }

    /* Maximised: fill the whole browser viewport */
    #browser-window.maximized {
      position: fixed; top: 0; left: 0;
      width: 100vw !important; height: 100vh !important;
      max-width: none; border-radius: 0;
      transform: none !important;
    }

    /* View site information button + popup */
    .site-info-btn { border-radius: 6px; color: var(--muted); cursor: pointer; }
    .site-info-btn:hover { background: var(--hover); color: var(--text); }
    .site-popup {
      position: absolute; top: 100%; left: 0; width: 300px;
      background: var(--popup); color: var(--text);
      border: 1px solid var(--divider); border-radius: 12px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.30); padding: 6px; z-index: 50;
      transition: opacity 0.12s ease;
    }
    .site-popup.hidden { display: none; }
    .site-popup.closing { opacity: 0; }
    .popup-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 8px 6px; }
    .popup-close { color: var(--muted); border-radius: 9999px; cursor: pointer; }
    .popup-close:hover { background: var(--hover); color: var(--text); }
    .popup-row {
      display: flex; align-items: center; gap: 12px; width: 100%;
      padding: 11px 8px; border-radius: 8px; text-align: left; color: var(--text);
      cursor: pointer; transition: background 0.12s;
    }
    .popup-row:hover { background: var(--hover); }
    .popup-row:active { background: var(--hover2); }
    .popup-back { color: var(--text); border-radius: 9999px; cursor: pointer; }
    .popup-back:hover { background: var(--hover); }
    .popup-detail { display: flex; gap: 12px; align-items: flex-start; padding: 10px 8px; }
    .popup-link { color: var(--accent); text-decoration: none; cursor: pointer; }
    .popup-link:hover { text-decoration: underline; }

    /* Certificate Viewer (always light, fills the window below the address bar) */
    .cert-overlay { position: absolute; inset: 0; z-index: 30; display: flex; padding: 16px; background: rgba(0,0,0,0.28); }
    .cert-overlay.hidden { display: none; }
    .cert-dialog { width: 100%; height: 100%; display: flex; flex-direction: column; background: #ffffff; color: #202124; border-radius: 8px; box-shadow: 0 12px 40px rgba(0,0,0,0.45); overflow: hidden; }
    .cert-titlebar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; background: #202124; color: #ffffff; font-weight: 600; font-size: 15px; }
    .cert-close { color: #c9cbcf; width: 28px; height: 28px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .cert-close:hover { background: rgba(255,255,255,0.14); color: #ffffff; }
    .cert-tabs { display: flex; gap: 4px; padding: 8px 16px 0; border-bottom: 1px solid #d7d9dd; background: #ffffff; }
    .cert-tab { padding: 8px 12px; border-bottom: 2px solid transparent; color: #5f6368; cursor: pointer; font-size: 13px; background: transparent; }
    .cert-tab:hover { color: #202124; }
    .cert-tab.active { color: #202124; font-weight: 600; border-bottom-color: #1a73e8; }
    .cert-body { padding: 20px; overflow-y: auto; background: #ffffff; flex: 1; }
    .cert-block { margin-bottom: 22px; }
    .cert-block:last-child { margin-bottom: 0; }
    .cert-section-title { font-weight: 600; font-size: 13px; margin-bottom: 10px; color: #202124; }
    .cert-mt { margin-top: 18px; }
    .cert-row { display: flex; gap: 16px; padding: 3px 0; font-size: 13px; }
    .cert-label { color: #5f6368; width: 176px; flex-shrink: 0; }
    .cert-value { color: #202124; word-break: break-word; }
    .cert-mono { font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; color: #5f6368; word-break: break-all; }

    /* Details tab: hierarchy + field trees, field value, export */
    .cert-tree-box { border: 1px solid #cfd1d5; border-radius: 4px; background: #ffffff; padding: 4px 0; }
    .cert-fields-scroll { max-height: 196px; overflow-y: auto; }
    .tree-row { display: flex; align-items: center; gap: 4px; padding: 3px 8px; font-size: 13px; color: #202124; cursor: default; white-space: nowrap; }
    .tree-row:hover { background: #f1f3f4; }
    .cert-hier-box .tree-row.selected { background: #e8eaed; }
    .cert-fields-box .tree-row.selected { background: #d6e4ff; }
    .tree-caret { width: 12px; min-width: 12px; color: #5f6368; font-size: 10px; text-align: center; cursor: pointer; user-select: none; }
    .cert-value-box { border: 1px solid #cfd1d5; border-radius: 4px; background: #ffffff; min-height: 88px; max-height: 150px; overflow: auto; padding: 8px 10px; font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; font-size: 12px; color: #202124; white-space: pre-wrap; word-break: break-word; }
    .cert-export-row { display: flex; justify-content: flex-end; margin-top: 12px; }
    .cert-export-btn { border: 1px solid #bcbfc4; background: #f8f9fa; color: #202124; padding: 5px 14px; border-radius: 4px; font-size: 13px; cursor: pointer; }
    .cert-export-btn:hover { background: #f1f3f4; }

    /* On-device site data dialog (theme-aware) */
    .sd-overlay { position: absolute; inset: 0; z-index: 30; display: flex; padding: 16px; background: rgba(0,0,0,0.28); }
    .sd-overlay.hidden { display: none; }
    .sd-dialog { width: 100%; height: 100%; display: flex; flex-direction: column; background: var(--popup); color: var(--text); border-radius: 10px; box-shadow: 0 12px 40px rgba(0,0,0,0.45); overflow: hidden; }
    .sd-body { padding: 20px 22px; overflow-y: auto; flex: 1; }
    .sd-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
    .sd-intro { font-size: 13px; color: var(--muted); line-height: 1.5; }
    .sd-link { color: var(--accent); text-decoration: none; cursor: pointer; }
    .sd-link:hover { text-decoration: underline; }
    .sd-section-title { font-size: 13px; font-weight: 600; margin-top: 20px; margin-bottom: 4px; color: var(--text); }
    .sd-section-desc { font-size: 13px; color: var(--muted); line-height: 1.5; margin-bottom: 8px; }
    .sd-row { display: flex; align-items: center; gap: 12px; padding: 7px 4px; }
    .sd-row-icon { width: 18px; height: 18px; color: var(--muted); flex-shrink: 0; }
    .sd-row-main { flex: 1; min-width: 0; }
    .sd-site { font-size: 13px; color: var(--text); }
    .sd-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .sd-icon-btn { width: 30px; height: 30px; border-radius: 9999px; color: var(--muted); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
    .sd-icon-btn:hover { background: var(--hover); color: var(--text); }
    .sd-footer { padding: 12px 20px; display: flex; justify-content: flex-end; }
    .sd-done { padding: 8px 22px; border-radius: 9999px; background: #1a73e8; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; }
    .sd-done:hover { filter: brightness(1.05); }
    #browser-window.dark .sd-done { background: #c9d6f5; color: #10233f; }

    /* Demo launcher (shown when the window is closed) */
    .launcher { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 9998; }
    .launcher button { padding: 10px 22px; border-radius: 9999px; background: #1a73e8; color: #fff; font-family: system-ui, sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
    .launcher button:hover { filter: brightness(1.05); }

    /* Debug switcher (shown only when opened with debug: true) */
    .switcher { position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); z-index: 10000;
      background: rgba(24,24,28,0.94); color: #e5e7eb; border-radius: 14px; box-shadow: 0 8px 30px rgba(0,0,0,0.35);
      padding: 8px 12px; font-size: 12px; font-family: system-ui, sans-serif; }
    .switcher .sw-row { display: flex; align-items: center; gap: 4px; }
    .switcher .sw-row + .sw-row { margin-top: 4px; }
    .switcher .sw-label { width: 56px; opacity: 0.6; }
    .seg-btn { padding: 2px 10px; border-radius: 9999px; cursor: pointer; color: #e5e7eb; }
    .seg-btn:hover { background: rgba(255,255,255,0.12); }
    .seg-btn.active { background: #e5e7eb; color: #111; }
  `;

  var TEMPLATE_HTML = `
  <!-- Browser window -->
  <div id="browser-window" class="w-full max-w-2xl rounded-lg overflow-hidden flex flex-col" style="height: 78vh;">

    <!-- Title bar -->
    <div class="title-bar flex items-center gap-2 px-3 h-9 select-none text-sm">

      <!-- macOS traffic lights (left) -->
      <div id="controls-mac" class="hidden items-center gap-2 pr-2">
        <span data-win="close" class="w-3 h-3 rounded-full tl-r cursor-pointer"></span>
        <span data-win="min" class="w-3 h-3 rounded-full tl-a cursor-pointer"></span>
        <span data-win="max" class="w-3 h-3 rounded-full tl-g cursor-pointer"></span>
      </div>

      <!-- Page favicon + window title -->
      <img id="win-favicon" src="" alt="" class="w-4 h-4 shrink-0">
      <span id="win-title" class="truncate"></span>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Windows caption buttons (right) -->
      <div id="controls-win" class="hidden self-stretch -mr-3 items-stretch">
        <button data-win="min" class="caption-btn w-11 flex items-center justify-center" title="Minimise">
          <svg class="w-35 h-35" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14"/></svg>
        </button>
        <button data-win="max" class="caption-btn w-11 flex items-center justify-center" title="Maximise">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
        </button>
        <button data-win="close" class="caption-btn caption-close w-11 flex items-center justify-center" title="Close">
          <svg class="w-35 h-35" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>

      <!-- Linux (GNOME-style) buttons (right) -->
      <div id="controls-linux" class="hidden items-center gap-2">
        <button data-win="min" class="gnome-btn w-6 h-6 rounded-full flex items-center justify-center" title="Minimise">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/></svg>
        </button>
        <button data-win="max" class="gnome-btn w-6 h-6 rounded-full flex items-center justify-center" title="Maximise">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="5" y="5" width="14" height="14" rx="1"/></svg>
        </button>
        <button data-win="close" class="gnome-btn w-6 h-6 rounded-full flex items-center justify-center" title="Close">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
    </div>

    <!-- Address bar (flat, full width) -->
    <div class="address-bar flex items-center gap-2 px-3 h-11 select-none relative">
      <!-- View site information -->
      <button id="site-info" class="site-info-btn shrink-0 w-7 h-7 flex items-center justify-center" title="View site information" aria-haspopup="true" aria-expanded="false">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="4" y1="8" x2="20" y2="8"/><circle cx="9" cy="8" r="2.2" fill="currentColor" stroke="none"/>
          <line x1="4" y1="16" x2="20" y2="16"/><circle cx="15" cy="16" r="2.2" fill="currentColor" stroke="none"/>
        </svg>
      </button>
      <!-- URL: two-tone display always visible, with a transparent read-only input on top -->
      <div class="addr-field self-stretch flex-1 min-w-0 relative">
        <div id="addr-url" class="addr-url text-sm">
          <span id="addr-scheme" class="addr-scheme"></span><span id="addr-domain" class="addr-domain"></span><span id="addr-path" class="addr-path"></span>
        </div>
        <input id="addr-input" class="addr-input" type="text" readonly spellcheck="false">
      </div>

      <!-- Site information popup -->
      <div id="site-popup" class="site-popup hidden">

        <!-- Main view -->
        <div id="popup-main">
          <div class="popup-header">
            <span id="popup-domain" class="font-medium text-sm"></span>
            <button class="popup-close w-6 h-6 flex items-center justify-center" title="Close">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>

          <button class="popup-row" data-item="connection">
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
            <span class="flex-1 text-sm">Connection is secure</span>
            <svg class="muted w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
          </button>

          <button class="popup-row" data-item="cookies">
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="14" cy="14" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="9" r="1" fill="currentColor" stroke="none"/></svg>
            <span class="flex-1 text-sm">Cookies and site data</span>
            <svg class="muted w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
          </button>

          <button class="popup-row" data-item="settings">
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span class="flex-1 text-sm">Site settings</span>
            <svg class="muted w-35 h-35 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6M20 4l-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></svg>
          </button>
        </div>

        <!-- Security view -->
        <div id="popup-security" class="hidden">
          <div class="popup-header">
            <button class="popup-back w-6 h-6 flex items-center justify-center" title="Back">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span class="flex-1 ml-1 font-medium text-sm">Security</span>
            <button class="popup-close w-6 h-6 flex items-center justify-center" title="Close">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>
          <div id="popup-security-domain" class="muted text-xs px-2 -mt-1 mb-2"></div>

          <div class="popup-detail">
            <svg class="w-4 h-4 shrink-0 mt-05" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
            <div>
              <div class="text-sm font-medium">Connection is secure</div>
              <div class="muted text-xs mt-1 leading-relaxed">Your information (for example, passwords or credit card numbers) is private when it is sent to this site. <a class="popup-link" data-item="learn-more" target="_blank" rel="noopener noreferrer">Learn more</a></div>
            </div>
          </div>

          <button class="popup-row" data-item="certificate">
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><rect x="4" y="4" width="16" height="16" rx="3"/></svg>
            <span class="flex-1 text-sm font-medium">Certificate is valid</span>
            <svg class="muted w-35 h-35 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6M20 4l-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></svg>
          </button>
        </div>

        <!-- Cookies and site data view -->
        <div id="popup-cookies" class="hidden">
          <div class="popup-header">
            <button class="popup-back w-6 h-6 flex items-center justify-center" title="Back">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span class="flex-1 ml-1 font-medium text-sm">Cookies and site data</span>
            <button class="popup-close w-6 h-6 flex items-center justify-center" title="Close">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>
          <div id="popup-cookies-domain" class="muted text-xs px-2 -mt-1 mb-2"></div>

          <button class="popup-row" data-item="manage-storage">
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></svg>
            <span class="flex-1 min-w-0">
              <span class="block text-sm font-medium">Manage on-device site data</span>
              <span id="cookies-sites" class="muted block text-xs"></span>
            </span>
            <svg class="muted w-35 h-35 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6M20 4l-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Page area -->
    <div class="page-area flex-1 relative">
      <iframe id="viewport" src="" class="w-full h-full" title="Page content" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>

      <!-- Certificate Viewer (fills the window, always light) -->
      <div id="cert-overlay" class="cert-overlay hidden">
        <div class="cert-dialog">
          <div class="cert-titlebar">
            <span id="cert-title"></span>
            <button id="cert-close" class="cert-close" title="Close">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>
          <div class="cert-tabs">
            <button class="cert-tab active" data-tab="general">General</button>
            <button class="cert-tab" data-tab="details">Details</button>
          </div>
          <div class="cert-body">
            <div id="cert-general"></div>
            <div id="cert-details" class="hidden">
              <div class="cert-section-title">Certificate Hierarchy</div>
              <div id="cert-hierarchy" class="cert-tree-box cert-hier-box"></div>

              <div class="cert-section-title cert-mt">Certificate Fields</div>
              <div id="cert-fields" class="cert-tree-box cert-fields-box cert-fields-scroll"></div>

              <div class="cert-section-title cert-mt">Field Value</div>
              <div id="cert-field-value" class="cert-value-box"></div>

              <div class="cert-export-row">
                <button id="cert-export" class="cert-export-btn">Export&hellip;</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- On-device site data dialog (follows the browser theme) -->
      <div id="sd-overlay" class="sd-overlay hidden">
        <div class="sd-dialog">
          <div class="sd-body">
            <div class="sd-title">On-device site data</div>
            <p class="sd-intro"><span id="sd-intro-text"></span> <a id="sd-manage-link" class="sd-link"></a></p>
            <div id="sd-sections"></div>
          </div>
          <div class="sd-footer">
            <button id="sd-done" class="sd-done">Done</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Debug switcher: shown only when openBrowserWindow({ debug: true }) -->
  <div class="switcher" style="display:none">
    <div class="sw-row">
      <span class="sw-label">OS</span>
      <button data-os="mac" class="seg-btn os-btn">macOS</button>
      <button data-os="windows" class="seg-btn os-btn">Windows</button>
      <button data-os="linux" class="seg-btn os-btn">Linux</button>
    </div>
    <div class="sw-row">
      <span class="sw-label">Theme</span>
      <button data-theme="auto" class="seg-btn th-btn" id="theme-auto-btn">Auto</button>
      <button data-theme="light" class="seg-btn th-btn">Light</button>
      <button data-theme="dark" class="seg-btn th-btn">Dark</button>
    </div>
  </div>
  `;

  function inject() {
    if (!document.getElementById('bw-styles')) {
      var style = document.createElement('style');
      style.id = 'bw-styles';
      style.textContent = CSS_TEXT;
      document.head.appendChild(style);
    }
    if (!document.getElementById('browser-template')) {
      var tpl = document.createElement('template');
      tpl.id = 'browser-template';
      tpl.innerHTML = TEMPLATE_HTML;
      document.body.appendChild(tpl);
    }
  }
  if (document.body) inject();
  else document.addEventListener('DOMContentLoaded', inject);

  // ---- application logic (CONFIG, openBrowserWindow, etc.) ----

  // =====================================================================
  //  CONFIG  -  edit these to change what the window shows
  // =====================================================================
  var CONFIG = {
    // The secure origin. Statically set and shown emphasised (bright) in the bar.
    domain: 'accounts.google.com',

    // The visible address text after the domain. Put the full path/query here.
    addressText: '/v3/signin/accountchooser?access_type=offline&client_id=1234567890.apps.exampleusercontent.com&redirect_uri=https%3A%2F%2Fapp.example.com%2Fauth%2Fcallback&response_type=code&scope=email+profile&flowName=GeneralOAuthFlow',

    // Scheme shown only while the address bar is focused (hidden when idle), like Chrome.
    scheme: 'https://',

    // Window title shown in the title bar.
    pageTitle: 'Sign in - Google Accounts',

    // Favicon shown in the title bar.
    favicon: 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://google.com&size=64',

    // What actually loads inside the window. Can differ from the displayed.
    src: 'https://example.com',

    // Where the Security screen's "Learn more" link points.
    learnMoreUrl: 'https://support.google.com/chrome/answer/95617?hl=en&co=GENIE.Platform%3DDesktop',

    // Where the main popup's "Site settings" row opens (in a new tab).
    siteSettingsUrl: 'chrome://settings/content/siteDetails?site=https%3A%2F%2Faccounts.google.com',

    // "Cookies and site data" screen text.
    cookies: {
      sitesAllowed: '5 sites allowed'
    },

    // "On-device site data" dialog (opened from "Manage on-device site data"). Fully editable.
    siteData: {
      intro: 'To improve your visit, sites often save your activity \u2013 often to your device.',
      manageLinkText: 'Manage site data',
      manageUrl: '',   // set a URL to make the link open in a new tab
      sections: [
        {
          title: "Data from the site that you're visiting",
          description: 'A site may save your preferred language or items that you want to buy. This info is available to the site and its subdomains.',
          sites: [
            { name: 'accounts.google.com' },
            { name: 'google.com' }
          ]
        },
        {
          title: 'Data from embedded sites',
          description: 'A site can also embed content from other sites, for example, images, ads and text. These other sites can also save data.',
          sites: [
            { name: 'accounts.youtube.com', subtitle: "Data is treated the same as the site that you're viewing" },
            { name: 'canva.com' },
            { name: 'www.canva.com' }
          ]
        }
      ]
    },

    // Certificate Viewer contents (opened from "Certificate is valid"). Every value is editable.
    certificate: {
      subject: {
        commonName: '*.google.com',
        organisation: '<Not part of certificate>',
        organisationalUnit: '<Not part of certificate>'
      },
      issuer: {
        commonName: 'WR2',
        organisation: 'Google Trust Services',
        organisationalUnit: '<Not part of certificate>'
      },
      validity: {
        issuedOn: 'Monday, 20 July 2026 at 19:05:56',
        expiresOn: 'Monday, 12 October 2026 at 19:05:55'
      },
      fingerprints: {
        certificate: 'a1b2c3d4e5f60718293a4b5c6d7e8f901a2b3c4d5e6f708192a3b4c5d6e7f809',
        publicKey: '0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c4b5a69788796a5b4c3d2e1f0'
      },

      // Details tab -> Certificate Hierarchy (issuer at the top, subject beneath)
      hierarchy: {
        name: 'WR2',
        children: [{ name: '*.google.com' }]
      },

      // Details tab -> Certificate Fields tree. Each node: { name, value?, children? }
      // Clicking a node shows its value in the Field Value box.
      fields: {
        name: '*.google.com',
        children: [
          {
            name: 'Certificate', children: [
              { name: 'Version', value: 'V3' },
              { name: 'Serial Number', value: '00 E9 7A 3C 1B 44 92 0F 8D' },
              { name: 'Certificate Signature Algorithm', value: 'PKCS #1 SHA-256 With RSA Encryption' },
              { name: 'Issuer', value: 'CN = WR2\nO = Google Trust Services\nC = US' },
              {
                name: 'Validity', children: [
                  { name: 'Not Before', value: 'Monday, 20 July 2026 at 19:05:56' },
                  { name: 'Not After', value: 'Monday, 12 October 2026 at 19:05:55' }
                ]
              },
              { name: 'Subject', value: 'CN = *.google.com' },
              { name: 'Subject Public Key Info', value: 'Elliptic Curve Public Key (P-256)' },
              {
                name: 'Extensions', children: [
                  { name: 'Key Usage', value: 'Critical\nDigital Signature' },
                  { name: 'Extended Key Usage', value: 'TLS Web Server Authentication' },
                  { name: 'Subject Alternative Name', value: 'DNS Name: *.google.com\nDNS Name: *.appengine.google.com' }
                ]
              }
            ]
          },
          { name: 'Certificate Signature Algorithm', value: 'PKCS #1 SHA-256 With RSA Encryption' },
          { name: 'Certificate Signature Value', value: '256 bytes : 3A 7C 9E 42 ...' }
        ]
      }
    }
  };
  // =====================================================================

  // ---------------- Detection ----------------
  function detectOS() {
    var plat = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    var s = plat + ' ' + navigator.userAgent;
    if (/Mac|iPhone|iPad/i.test(s)) return 'mac';
    if (/Win/i.test(s)) return 'windows';
    if (/Linux|X11|CrOS/i.test(s)) return 'linux';
    return 'windows';
  }

  var darkMedia = window.matchMedia('(prefers-color-scheme: dark)');

  // ---------------- Palette (light / dark) ----------------
  var palette = {
    light: { frame: '#f1f3f4', text: '#202124', muted: '#5f6368', divider: '#dadce0', hover: 'rgba(0,0,0,0.07)', page: '#ffffff', popup: '#ffffff', accent: '#1a73e8' },
    dark: { frame: '#292a2d', text: '#e8eaed', muted: '#9aa0a6', divider: '#3c4043', hover: 'rgba(255,255,255,0.1)', page: '#202124', popup: '#2c2c2e', accent: '#8ab4f8' }
  };

  var fonts = {
    mac: "-apple-system, 'SF Pro Text', 'Helvetica Neue', Helvetica, sans-serif",
    windows: "'Segoe UI', Tahoma, sans-serif",
    linux: "Ubuntu, Cantarell, 'DejaVu Sans', sans-serif"
  };

  // ---------------- State + apply ----------------
  var state = { os: detectOS(), themeMode: 'auto' };

  // ---------------- Open / close the window ----------------
  var refreshBrowser = null;
  var debugMode = false;

  function deepMerge(t, s) {
    for (var k in s) {
      if (s[k] && typeof s[k] === 'object' && !Array.isArray(s[k])) { t[k] = t[k] || {}; deepMerge(t[k], s[k]); }
      else t[k] = s[k];
    }
    return t;
  }

  function applyDebug() {
    var sw = document.querySelector('.switcher');
    if (sw) sw.style.display = debugMode ? 'block' : 'none';
  }

  function openBrowserWindow(opts) {
    opts = opts || {};
    if ('debug' in opts) debugMode = (opts.debug === true);
    if (opts.os) state.os = opts.os;
    if (opts.theme) state.themeMode = opts.theme;

    var overrides = {}, hasOverrides = false;
    for (var k in opts) {
      if (k !== 'os' && k !== 'theme' && k !== 'debug') { overrides[k] = opts[k]; hasOverrides = true; }
    }
    if (hasOverrides) deepMerge(CONFIG, overrides);

    var launcher = document.querySelector('.launcher');
    var existing = document.getElementById('browser-window');
    if (existing) {
      existing.style.display = '';
      if (launcher) launcher.style.display = 'none';
      if (refreshBrowser) refreshBrowser();
      applyDebug();
      return;
    }
    document.body.appendChild(document.getElementById('browser-template').content.cloneNode(true));
    if (launcher) launcher.style.display = 'none';
    initBrowserWindow();
    applyDebug();
  }

  // Close the mockup (hides it; call openBrowserWindow() to bring it back).
  function closeBrowserWindow() {
    var win = document.getElementById('browser-window'); if (win) win.style.display = 'none';
    var launcher = document.querySelector('.launcher'); if (launcher) launcher.style.display = '';
  }

  // ---------------- Wiring (runs once, after the template is cloned in) ----------------
  function initBrowserWindow() {
    var controlGroups = {
      mac: document.getElementById('controls-mac'),
      windows: document.getElementById('controls-win'),
      linux: document.getElementById('controls-linux')
    };

    function resolvedTheme() {
      if (state.themeMode === 'auto') return darkMedia.matches ? 'dark' : 'light';
      return state.themeMode;
    }

    function applyConfig() {
      document.getElementById('addr-domain').textContent = CONFIG.domain;
      document.getElementById('addr-path').textContent = CONFIG.addressText;
      document.getElementById('addr-input').value = CONFIG.scheme + CONFIG.domain + CONFIG.addressText;
      document.getElementById('popup-domain').textContent = CONFIG.domain;
      document.getElementById('popup-security-domain').textContent = CONFIG.domain;
      document.getElementById('popup-cookies-domain').textContent = CONFIG.domain;
      document.getElementById('cookies-sites').textContent = CONFIG.cookies.sitesAllowed;
      document.querySelector('.popup-link').href = CONFIG.learnMoreUrl;
      document.getElementById('win-favicon').src = CONFIG.favicon;
      document.getElementById('viewport').src = CONFIG.src;
    }

    function applyAll() {
      var theme = resolvedTheme();
      var p = palette[theme];
      var winEl = document.getElementById('browser-window');
      for (var k in p) winEl.style.setProperty('--' + k, p[k]);
      winEl.style.setProperty('--hover2', theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.16)');

      winEl.setAttribute('data-os', state.os);
      winEl.classList.toggle('dark', theme === 'dark');

      for (var os in controlGroups) {
        var show = os === state.os;
        controlGroups[os].classList.toggle('hidden', !show);
        controlGroups[os].classList.toggle('flex', show);
      }

      winEl.style.fontFamily = fonts[state.os];
      document.getElementById('win-title').textContent = CONFIG.pageTitle;

      document.querySelectorAll('.os-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.os === state.os); });
      document.querySelectorAll('.th-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.theme === state.themeMode); });
      var autoBtn = document.getElementById('theme-auto-btn');
      if (autoBtn) autoBtn.textContent = 'Auto (' + (darkMedia.matches ? 'dark' : 'light') + ')';
    }

    document.querySelectorAll('.os-btn').forEach(function (b) {
      b.addEventListener('click', function () { state.os = b.dataset.os; applyAll(); });
    });
    document.querySelectorAll('.th-btn').forEach(function (b) {
      b.addEventListener('click', function () { state.themeMode = b.dataset.theme; applyAll(); });
    });
    darkMedia.addEventListener('change', function () { applyAll(); });

    // ---------------- Init ----------------
    refreshBrowser = function () { applyConfig(); applyAll(); };
    applyConfig();
    applyAll();

    // ---------------- Site information popup ----------------
    var siteInfoBtn = document.getElementById('site-info');
    var sitePopup = document.getElementById('site-popup');
    var popupMain = document.getElementById('popup-main');
    var popupSecurity = document.getElementById('popup-security');
    var popupCookies = document.getElementById('popup-cookies');

    function showMain() { popupMain.classList.remove('hidden'); popupSecurity.classList.add('hidden'); popupCookies.classList.add('hidden'); }
    function showSecurity() { popupSecurity.classList.remove('hidden'); popupMain.classList.add('hidden'); popupCookies.classList.add('hidden'); }
    function showCookies() { popupCookies.classList.remove('hidden'); popupMain.classList.add('hidden'); popupSecurity.classList.add('hidden'); }

    function openPopup() { showMain(); sitePopup.classList.remove('hidden', 'closing'); siteInfoBtn.setAttribute('aria-expanded', 'true'); }
    function closePopup() {
      if (sitePopup.classList.contains('hidden') || sitePopup.classList.contains('closing')) return;
      sitePopup.classList.add('closing');
      siteInfoBtn.setAttribute('aria-expanded', 'false');
      setTimeout(function () { sitePopup.classList.add('hidden'); sitePopup.classList.remove('closing'); }, 120);
    }
    function togglePopup() { sitePopup.classList.contains('hidden') ? openPopup() : closePopup(); }

    // Open / close from the button
    siteInfoBtn.addEventListener('click', function (e) { e.stopPropagation(); togglePopup(); });
    // Keep the popup open when clicking within it
    sitePopup.addEventListener('click', function (e) { e.stopPropagation(); });
    // Both close buttons dismiss the whole popup
    document.querySelectorAll('.popup-close').forEach(function (b) { b.addEventListener('click', closePopup); });
    // Back arrows return to the main list
    document.querySelectorAll('.popup-back').forEach(function (b) { b.addEventListener('click', showMain); });

    // Inner rows are clickable, with a brief press flash for feedback
    document.querySelectorAll('.popup-row').forEach(function (row) {
      row.addEventListener('click', function () {
        row.style.background = 'var(--hover2)';
        setTimeout(function () { row.style.background = ''; }, 180);
        if (row.dataset.item === 'connection') showSecurity();                  // drill into the Security screen
        if (row.dataset.item === 'cookies') showCookies();                      // drill into Cookies and site data
        if (row.dataset.item === 'certificate') { closePopup(); openCert(); }   // open the certificate viewer
        if (row.dataset.item === 'manage-storage') { closePopup(); openSiteData(); }  // open On-device site data
        if (row.dataset.item === 'settings') { closePopup(); window.open(CONFIG.siteSettingsUrl, '_blank', 'noopener'); }  // open site settings in a new tab
      });
    });

    // Close on outside click or Escape
    document.addEventListener('click', closePopup);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePopup(); });
    // Clicking the page content focuses the iframe and blurs the window; close then too
    window.addEventListener('blur', closePopup);

    // The URL: two-tone display stays visible; a transparent read-only input on top handles
    // caret, selection and scrolling. Dragging past the edge scrolls to reveal hidden parts,
    // the grey path stays grey, and it can never be edited.
    var addrInput = document.getElementById('addr-input');
    var addrUrlEl = document.getElementById('addr-url');
    function syncUrlScroll() { addrUrlEl.scrollLeft = addrInput.scrollLeft; }

    addrInput.addEventListener('focus', function () {
      addrUrlEl.classList.add('scrolling');
      document.getElementById('addr-scheme').textContent = CONFIG.scheme;   // reveal https:// when focused
    });
    addrInput.addEventListener('blur', function () {
      addrUrlEl.classList.remove('scrolling');
      document.getElementById('addr-scheme').textContent = '';              // hide it again on click-away
      addrInput.scrollLeft = 0; addrUrlEl.scrollLeft = 0;
      addrInput.setSelectionRange(0, 0);
    });
    addrInput.addEventListener('scroll', syncUrlScroll);
    // A plain click selects the whole URL and shows it from the start
    addrInput.addEventListener('mouseup', function () {
      if (addrInput.selectionStart === addrInput.selectionEnd) {
        addrInput.select();
        addrInput.scrollLeft = 0; syncUrlScroll();
      }
    });
    // Keep the two-tone layer in step while dragging a selection
    addrInput.addEventListener('pointerdown', function () {
      var move = function () { syncUrlScroll(); };
      var up = function () { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    });
    // Clicking into the page content blurs the window; drop the URL's focus then too
    window.addEventListener('blur', function () { addrInput.blur(); });
    // A press anywhere outside the field also drops focus and clears the selection
    document.addEventListener('mousedown', function (e) { if (e.target !== addrInput) addrInput.blur(); });

    // ---------------- Certificate Viewer ----------------
    var certOverlay = document.getElementById('cert-overlay');
    var certTabs = document.querySelectorAll('.cert-tab');
    var certGeneral = document.getElementById('cert-general');
    var certDetails = document.getElementById('cert-details');
    var certHierarchy = document.getElementById('cert-hierarchy');
    var certFields = document.getElementById('cert-fields');
    var certFieldValue = document.getElementById('cert-field-value');

    // Escape HTML so values like "<Not part of certificate>" render literally
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function certBlock(title, rows, mono) {
      var html = '<div class="cert-section-title">' + esc(title) + '</div>';
      rows.forEach(function (r) {
        html += '<div class="cert-row"><span class="cert-label">' + esc(r[0]) +
          '</span><span class="cert-value' + (mono ? ' cert-mono' : '') + '">' + esc(r[1]) + '</span></div>';
      });
      return '<div class="cert-block">' + html + '</div>';
    }

    // Build a collapsible tree from { name, value?, children? }
    function buildTreeNode(node, depth, scope, onSelect) {
      var wrapper = document.createElement('div');
      var row = document.createElement('div');
      row.className = 'tree-row';
      row.style.paddingLeft = (8 + depth * 16) + 'px';
      var hasKids = node.children && node.children.length;

      var caret = document.createElement('span');
      caret.className = 'tree-caret';
      caret.textContent = hasKids ? '\u25BE' : '';
      row.appendChild(caret);

      var label = document.createElement('span');
      label.className = 'tree-label';
      label.textContent = node.name;
      row.appendChild(label);
      wrapper.appendChild(row);

      if (hasKids) {
        var kids = document.createElement('div');
        node.children.forEach(function (ch) { kids.appendChild(buildTreeNode(ch, depth + 1, scope, onSelect)); });
        wrapper.appendChild(kids);
        caret.addEventListener('click', function (e) {
          e.stopPropagation();
          var collapsed = kids.classList.toggle('hidden');
          caret.textContent = collapsed ? '\u25B8' : '\u25BE';
        });
      }

      row.addEventListener('click', function () {
        scope.querySelectorAll('.tree-row.selected').forEach(function (r) { r.classList.remove('selected'); });
        row.classList.add('selected');
        if (onSelect) onSelect(node);
      });

      return wrapper;
    }

    function renderTree(container, root, onSelect) {
      container.innerHTML = '';
      container.appendChild(buildTreeNode(root, 0, container, onSelect));
    }

    function renderCertificate() {
      var c = CONFIG.certificate;
      document.getElementById('cert-title').textContent = 'Certificate Viewer: ' + c.subject.commonName;

      certGeneral.innerHTML =
        certBlock('Issued To', [
          ['Common Name (CN)', c.subject.commonName],
          ['Organisation (O)', c.subject.organisation],
          ['Organisational Unit (OU)', c.subject.organisationalUnit]
        ]) +
        certBlock('Issued By', [
          ['Common Name (CN)', c.issuer.commonName],
          ['Organisation (O)', c.issuer.organisation],
          ['Organisational Unit (OU)', c.issuer.organisationalUnit]
        ]) +
        certBlock('Validity Period', [
          ['Issued On', c.validity.issuedOn],
          ['Expires On', c.validity.expiresOn]
        ]) +
        certBlock('SHA-256 Fingerprints', [
          ['Certificate', c.fingerprints.certificate],
          ['Public key', c.fingerprints.publicKey]
        ], true);

      // Details tab trees
      renderTree(certHierarchy, c.hierarchy, null);
      renderTree(certFields, c.fields, function (node) { certFieldValue.textContent = node.value || ''; });
      certFieldValue.textContent = '';

      // Default selections, matching the real viewer
      var hierRows = certHierarchy.querySelectorAll('.tree-row');
      if (hierRows.length) hierRows[hierRows.length - 1].classList.add('selected');
      var fieldRows = certFields.querySelectorAll('.tree-row');
      if (fieldRows.length) fieldRows[0].classList.add('selected');
    }

    function openCert() {
      renderCertificate();
      certTabs.forEach(function (t) { t.classList.toggle('active', t.dataset.tab === 'general'); });
      certGeneral.classList.remove('hidden');
      certDetails.classList.add('hidden');
      certOverlay.classList.remove('hidden');
    }
    function closeCert() { certOverlay.classList.add('hidden'); }

    certTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        certTabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var general = tab.dataset.tab === 'general';
        certGeneral.classList.toggle('hidden', !general);
        certDetails.classList.toggle('hidden', general);
      });
    });

    document.getElementById('cert-close').addEventListener('click', closeCert);
    certOverlay.addEventListener('click', function (e) { if (e.target === certOverlay) closeCert(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCert(); });

    // ---------------- On-device site data dialog ----------------
    var sdOverlay = document.getElementById('sd-overlay');
    var sdSections = document.getElementById('sd-sections');
    var sdManageLink = document.getElementById('sd-manage-link');

    var SD_GLOBE = '<svg class="sd-row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 2.7 2.6 15.3 0 18M12 3c-2.6 2.7-2.6 15.3 0 18"/></svg>';
    var SD_TRASH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/></svg>';
    var SD_BARS = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

    function renderSiteData() {
      var d = CONFIG.siteData;
      document.getElementById('sd-intro-text').textContent = d.intro;
      sdManageLink.textContent = d.manageLinkText;
      if (d.manageUrl) { sdManageLink.href = d.manageUrl; sdManageLink.target = '_blank'; sdManageLink.rel = 'noopener noreferrer'; }
      else { sdManageLink.removeAttribute('href'); }

      var html = '';
      d.sections.forEach(function (sec) {
        html += '<div class="sd-section-title">' + esc(sec.title) + '</div>';
        html += '<div class="sd-section-desc">' + esc(sec.description) + '</div>';
        sec.sites.forEach(function (site) {
          html += '<div class="sd-row">' + SD_GLOBE +
            '<div class="sd-row-main"><div class="sd-site">' + esc(site.name) + '</div>' +
            (site.subtitle ? '<div class="sd-sub">' + esc(site.subtitle) + '</div>' : '') +
            '</div>' +
            '<button class="sd-icon-btn sd-delete" title="Delete">' + SD_TRASH + '</button>' +
            '<button class="sd-icon-btn sd-more" title="More options">' + SD_BARS + '</button>' +
            '</div>';
        });
      });
      sdSections.innerHTML = html;
    }

    // The trash icon removes that site row
    sdSections.addEventListener('click', function (e) {
      var del = e.target.closest('.sd-delete');
      if (del) { var row = del.closest('.sd-row'); if (row) row.remove(); }
    });

    // "Manage site data" only navigates when a URL is configured
    sdManageLink.addEventListener('click', function (e) { if (!CONFIG.siteData.manageUrl) e.preventDefault(); });

    function openSiteData() { renderSiteData(); sdOverlay.classList.remove('hidden'); }
    function closeSiteData() { sdOverlay.classList.add('hidden'); }

    document.getElementById('sd-done').addEventListener('click', closeSiteData);
    sdOverlay.addEventListener('click', function (e) { if (e.target === sdOverlay) closeSiteData(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSiteData(); });

    // ---------------- Window controls + dragging ----------------
    var browserWindow = document.getElementById('browser-window');
    var dragOffset = { x: 0, y: 0 };
    var maximized = false;

    function setMaximized(on) {
      maximized = on;
      browserWindow.classList.toggle('maximized', on);
      if (on) { dragOffset.x = 0; dragOffset.y = 0; browserWindow.style.transform = 'none'; }
    }

    // Minimise and Close both close the window; Maximise toggles full size
    document.querySelectorAll('[data-win]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.dataset.win;
        if (action === 'close' || action === 'min') closeBrowserWindow();
        else if (action === 'max') setMaximized(!maximized);
      });
    });

    (function () {
      var handle = document.querySelector('.title-bar');
      var dragging = false, startX = 0, startY = 0, baseX = 0, baseY = 0;
      var originLeft = 0, originTop = 0, w = 0, h = 0;

      handle.addEventListener('pointerdown', function (e) {
        if (e.target.closest('button') || e.target.closest('[data-win]')) return;  // not from the controls
        if (maximized) return;                     // a maximised window doesn't move
        closePopup();
        var rect = browserWindow.getBoundingClientRect();
        originLeft = rect.left - dragOffset.x;      // window position at zero offset
        originTop = rect.top - dragOffset.y;
        w = rect.width; h = rect.height;
        baseX = dragOffset.x; baseY = dragOffset.y;
        startX = e.clientX; startY = e.clientY;
        dragging = true;
        handle.classList.add('dragging');
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
        try { handle.setPointerCapture(e.pointerId); } catch (_) { }
      });

      handle.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var proposedX = baseX + (e.clientX - startX);
        var proposedY = baseY + (e.clientY - startY);
        // Hard limit: the window stays fully inside the actual browser viewport
        var maxLeft = Math.max(0, window.innerWidth - w);
        var maxTop = Math.max(0, window.innerHeight - h);
        var left = Math.min(Math.max(originLeft + proposedX, 0), maxLeft);
        var top = Math.min(Math.max(originTop + proposedY, 0), maxTop);
        dragOffset.x = left - originLeft;
        dragOffset.y = top - originTop;
        browserWindow.style.transform = 'translate(' + dragOffset.x + 'px,' + dragOffset.y + 'px)';
      });

      function end(e) {
        if (!dragging) return;
        dragging = false;
        handle.classList.remove('dragging');
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        try { handle.releasePointerCapture(e.pointerId); } catch (_) { }
      }
      handle.addEventListener('pointerup', end);
      handle.addEventListener('pointercancel', end);
    })();
  }  // end initBrowserWindow


  window.openBrowserWindow = openBrowserWindow;
  window.closeBrowserWindow = closeBrowserWindow;
})();
