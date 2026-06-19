# TargetProof Model

**Standard edition** — a private, on-device security assessment tool for practitioners of the [TargetProof Model](https://www.targetproof.com/model). Households and family offices map protection posture across people, institutions, and lifestyle using the NIST CSF-aligned control catalog. Everything runs locally. No cloud. No AI in this edition.

> **Discretion is not a feature. It is the foundation.**

---

## Who this is for

- **Practitioners** delivering the TargetProof Model to client households
- **Family offices** and estate teams maintaining an internal security posture record
- **Households** that want a structured assessment without AI or external data connectors

This repository ships the **Standard** build: guided Assistant (rule-based, no language model), full control catalog, intake, spectrum, recommendations, and encrypted local storage.

AI and Connected editions (on-device LLM, Knowledge layer) are distributed separately on client USB media.

---

## Quick start

### Windows
```bat
START.bat
```
Or:
```powershell
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

### macOS
Double-click `START.command` (first time: right-click → Open).

### Linux
```bash
chmod +x start.sh start-server.sh
./start.sh
```

A local server opens at `http://127.0.0.1:8765/unlock.html`. **Keep the terminal window open** while working.

### First launch
1. **Create a vault password** (minimum 14 characters) — encrypts the assessment in this browser.
2. Complete **Setup** with household name and scope.
3. Work through **Intake**, **Controls**, **Spectrum**, and **Summary** at your pace.
4. Use **Model Assistant** for guided answers from your scored data (no generative AI).

---

## What's in the model

| Tab | Purpose |
|-----|---------|
| **Setup** | Household profile, four-question methodology loop |
| **Intake** | Properties, participants, travel, incidents, technology |
| **Spectrum** | NIST CSF mapping, FTC advisories, breach pattern library |
| **Controls** | 156 controls across Govern → Recover with gap scoring |
| **Recommendations** | Remediation areas linked to TargetProof services (optional, user-initiated) |
| **Summary** | Executive narrative, roadmaps, maturity dashboard |
| **Review** | Effectiveness and residual-risk capture |
| **Assistant** | Guided Q&A from local model data only |
| **Your Data** | Encrypted export, import, lock, backups |

---

## Privacy and security

- **On-device only** — assessment data is encrypted in the browser vault (Web Crypto PBKDF2 + AES-GCM).
- **No telemetry** — TargetProof receives nothing from this tool.
- **Optional encrypted backups** — `.sanctuary.json` exports with a separate passphrase.
- **Local HTTP server** — binds to `127.0.0.1` only; path traversal blocked.
- **Content Security Policy** — scripts restricted to this origin.

Recommendation links on the Recommendations tab open [targetproof.com](https://www.targetproof.com/model) only when the user clicks them.

---

## Backups

**Your Data → Download Backup**

- Choose **encrypted export** (recommended) for off-device storage.
- Plain `.json` import/export is supported for migration between machines running the same app.

Clearing browser data erases the local vault. Export regularly.

---

## Project structure

```
├── unlock.html / vault.js     Password gate and encrypted storage
├── index.html / app.js        Main application shell
├── catalog.js                 Control catalog (156 controls)
├── framework.js               Methodology, NIST, spectrum content
├── services.js                Remediation service mappings
├── assistant.js               Guided Assistant (no LLM)
├── edition.js                 Edition flags (Standard locked in this repo)
├── config.js                  standardOnly: true for this distribution
├── assets/brand/              TargetProof branding and UI background
└── start.ps1 / START.bat      Local static file server (port 8765)
```

---

## Building from source

Requires PowerShell (Windows) or a POSIX shell (Mac/Linux). No Node.js runtime for the app itself.

```powershell
# Package Standard edition to sibling folder
.\publish-standard.ps1 -Destination "..\targetproof-model"
```

The unified USB build (Standard / AI / Connected at setup) uses `prepare-usb.ps1` in the full development kit.

---

## Requirements

- **Browser:** Chrome, Edge, or Firefox (Web Crypto required for vault)
- **Network:** Not required after launch; local server only
- **Port:** `8765` on loopback — close other instances before starting

---

## Support

**TargetProof, LLC** · [targetproof.com](https://www.targetproof.com) · [Model overview](https://www.targetproof.com/model)

For practitioner licensing and client delivery, contact your TargetProof adviser.

---

## Version

**v1.5** — TargetProof Model · Standard