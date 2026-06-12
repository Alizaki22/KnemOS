# KnemOS Issues & Vulnerabilities Tracker

This document outlines known flaws, technical debt, bugs, and potential vulnerabilities across the KnemOS codebase.

## 🐛 Known Bugs

1. **Tauri Export Native Limitation**:
   - **Status**: ✅ **FIXED in Desktop App**. Export fallback now triggers a visible success `toast` to the user when JSON is successfully copied to the clipboard, providing proper UX feedback until native OS dialogs are implemented.

2. **Drag-and-Drop Interference (Tauri)**:
   - **Status**: ✅ **FIXED in Desktop App**. 
     - Replaced broad `data-tauri-drag-region` on interactive titlebar elements.
     - Addressed Chromium WebView2 requirement by strictly enforcing `dataTransfer.setData()` in all React `onDragStart` handlers, restoring parity with browser DND behavior.

3. **Incremental Compilation OS Error (Windows)**:
   - **Issue**: Rust's `cargo` occasionally fails with `os error 183 (Cannot create a file when that file already exists)` when building `knemos_lib` incrementally.
   - **Workaround**: Run `cargo clean` inside `src-tauri` occasionally.

## 🕳️ Flaws & Loopholes

1. **State Hydration Desync**:
   - The UI assumes the FastAPI backend dictates the source of truth for `workspaces` and `categories`. However, because the drag-and-drop feature has a **Deferred Commitment** (pending changes overlay), if the backend pushes an update via WebSocket *while* the user has pending local moves, the UI might violently snap back or create duplicate category entries.

2. **Backend Mocks**:
   - The `chat.py` and `workspace` routing are currently heavily mocked. They rely on string-matching rather than true RAG (Retrieval-Augmented Generation) against ChromaDB.

3. **Incomplete Theme Inversion**:
   - **Status**: ✅ **RESOLVED (Design Decision)**. As per project direction, the "Minimal White" theme is the strict identity. `tauri.conf.json` has been hard-locked to `"theme": "Light"` to prevent Windows from applying native dark mode inversion to titlebars and scrollbars. Dark mode support has been explicitly deprecated.

## 🔒 Security Vulnerabilities

1. **CORS & CSP Configuration**:
   - **Issue**: We had to temporarily remove strict Content Security Policy (`csp`) from `tauri.conf.json` because it was aggressively blocking Tauri's own internal IPC schema (`ipc: http://ipc.localhost`). 
   - **Risk**: A relaxed CSP makes the frontend webview vulnerable to XSS if we ever load unverified third-party content.
   - **Fix Required**: Write a granular CSP that explicitly permits `ipc:`, `tauri:`, and `http://127.0.0.1:8765`, blocking everything else.

2. **Local Port Binding**:
   - The FastAPI backend binds to `127.0.0.1:8765`. If another malicious local process is running, it could theoretically poll `/api/memory/screenshots` to exfiltrate user data.
   - **Fix Required**: Implement a local auth token handshake (e.g., Tauri generates a JWT on launch and passes it to the backend via CLI args).

3. **Local Vector DB Unencrypted**:
   - ChromaDB stores embeddings and OCR strings in plain text on the local disk (`./data/chromadb`). Anyone with physical access or malware can read this semantic history.

## 📈 Technical Debt

- **Monolithic App.tsx**: The backend polling loops (`fetchHealth`, `fetchRam`, `fetchFocus`) are clustered inside a massive `useEffect` inside `App.tsx`. These should be broken out into a dedicated `useBackendSync` custom hook.
- **Store Bloat**: `ui.store.ts` and `categories.store.ts` have tightly coupled concerns (e.g., `ui.store` tracking pending counts, while `categories.store` manages the actual pending objects).
