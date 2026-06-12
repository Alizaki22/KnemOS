# KnemOS Issues & Vulnerabilities Tracker

This document outlines known flaws, technical debt, bugs, and potential vulnerabilities across the KnemOS codebase.

## 🐛 Known Bugs

1. **Tauri Export Native Limitation**:
   - **Status**: ✅ **FIXED in Desktop App**. Integrated `@tauri-apps/plugin-dialog` and `@tauri-apps/plugin-fs` to natively save JSON export files to disk, while falling back gracefully to clipboard copy for web builds.

2. **Drag-and-Drop Interference (Tauri)**:
   - **Status**: ✅ **FIXED in Desktop App**. 
     - Replaced broad `data-tauri-drag-region` on interactive titlebar elements.
     - Addressed Chromium WebView2 requirement by strictly enforcing `dataTransfer.setData()` in all React `onDragStart` handlers, restoring parity with browser DND behavior.

3. **Incremental Compilation OS Error (Windows)**:
   - **Issue**: Rust's `cargo` occasionally fails with `os error 183 (Cannot create a file when that file already exists)` when building `knemos_lib` incrementally.
   - **Workaround**: Run `cargo clean` inside `src-tauri` occasionally.

## 🕳️ Flaws & Loopholes

1. **State Hydration Desync**:
   - **Status**: ✅ **FIXED**. Implemented a `pendingDetectionCache` and a robust `useStableWebSocket` hook. The system now silently syncs processes and uses deterministic hashing to deduplicate tabs and apps. This prevents UI snapping and duplicate ghost entries.

2. **Backend Mocks**:
   - **Status**: ✅ **RESOLVED (Phase 23)**. `/api/workspace/summary` and `/api/workspace/suggest` are now dynamically powered by the local Qwen2.5 model via `workspace_namer.py` and Ollama instead of hardcoded strings.

3. **Incomplete Theme Inversion**:
   - **Status**: ✅ **RESOLVED (Design Decision)**. As per project direction, the "Minimal White" theme is the strict identity. `tauri.conf.json` has been hard-locked to `"theme": "Light"` to prevent Windows from applying native dark mode inversion to titlebars and scrollbars. Dark mode support has been explicitly deprecated.

## 🔒 Security Vulnerabilities

1. **CORS & CSP Configuration**:
   - **Issue**: We had to temporarily remove strict Content Security Policy (`csp`) from `tauri.conf.json` because it was aggressively blocking Tauri's own internal IPC schema (`ipc: http://ipc.localhost`). 
   - **Risk**: A relaxed CSP makes the frontend webview vulnerable to XSS if we ever load unverified third-party content.
   - **Fix Required**: Write a granular CSP that explicitly permits `ipc:`, `tauri:`, and `http://127.0.0.1:8765`, blocking everything else.

2. **Local Port Binding**:
   - **Status**: ✅ **FIXED (Phase 23)**. The FastAPI backend generates a cryptographic JWT token on startup and writes it to `data/.auth_token`. Tauri retrieves this securely via rust `get_auth_token`, and all sensitive routes (`/api/memory`, `/api/chat`, etc) require a `Bearer` token or `?token=` query param.
   - **Exception**: The Chrome Extension routes (`/api/system`) are left intentionally unprotected as browser extensions run in a local sandbox without filesystem access to read the auth token.

3. **Local Vector DB Unencrypted**:
   - ChromaDB stores embeddings and OCR strings in plain text on the local disk (`./data/chromadb`). Anyone with physical access or malware can read this semantic history.

## 📈 Technical Debt

- **Store Bloat**: `ui.store.ts` and `categories.store.ts` have tightly coupled concerns (e.g., `ui.store` tracking pending counts, while `categories.store` manages the actual pending objects).

✅ **RESOLVED DEBT**:
- **Monolithic App.tsx**: The backend polling loops were successfully replaced by an event-driven `useStableWebSocket` architecture, drastically reducing CPU load and file bloat in `App.tsx`.

## ⏱️ Scheduler Problems
- **Status**: ✅ **FIXED (Phase 23)**. `capture_and_index` (OCR/embeddings) now runs in an isolated `ThreadPoolExecutor(max_workers=2)`, preventing heavy vector calculations from blocking the main asyncio event loop. The WebSocket and UI updates are now completely decouple from background processing lag.

## 🔌 WebSocket Issues
- **Status**: ✅ **FIXED (Phase 23)**. Implemented an offline `outbox` queue in `ws.store.ts` via Zustand. Messages sent while the backend is down are queued in memory and seamlessly flushed upon successful reconnection.

## 💾 Memory Concerns
- **ChromaDB Ballooning**:
  - **Status**: ✅ **FIXED (Phase 23)**. `_enforce_screenshot_retention` now cleanly purges vectors directly from the `screen_memory_v2` collection using `col.delete(ids=deleted_ids)`, ensuring the DB size scales strictly with the 48h/100-file retention policy.
- **Tauri Webview RAM**: Continuous DOM updates for `system.ram` and `system.processes` might cause minor memory leaks over long sessions. Needs performance profiling.
