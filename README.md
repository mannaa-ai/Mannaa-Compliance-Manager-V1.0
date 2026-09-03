# ANMAT Full Compliance Manager (anmat.sa)

> **Enterprise GRC, Regulatory Audit & Standards Compliance Platform**  
> Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Dexie IndexedDB (Offline Vault)**, and **Electron (Windows Desktop Application)**.

---

## 🌟 Overview

**ANMAT Compliance Manager** is a bilingual (Arabic & English) compliance and audit management suite preloaded with **23 official regulatory frameworks and ISO standards** comprising **1,639 controls & clauses**. It features client questionnaire export/import roundtrips, multi-tier scoring (Compliance % + CMMI 0–5 Maturity + Custom Weights), evidence attachment vaults, and boardroom-ready reporting.

---

## 📑 Pre-Loaded Frameworks & Standards (1,639 Total Controls)

### 🇸🇦 Saudi Regulatory Standards
1. **NCA ECC-1:2018** (Essential Cybersecurity Controls) - 200 Controls
2. **SAMA CSF** (Cyber Security Framework) - 291 Controls
3. **NCA CSCC v2.0** (Cloud Cybersecurity Controls) - 98 Controls
4. **NCA TCC-1:2021** (Telework Cybersecurity Controls) - 61 Controls
5. **NCA DCC v1.0** (Data Cybersecurity Controls) - 55 Controls

### 🌐 International ISO Standards
6. **ISO 27001** (Information Security - ISMS) - 173 Controls & Clauses
7. **ISO 22301** (Business Continuity - BCMS) - 44 Controls & Clauses
8. **ISO 20000-1** (IT Service Management - ITSM) - 44 Controls & Clauses
9. **ISO 9001** (Quality Management System - QMS) - 75 Controls & Clauses
10. **ISO 14001** (Environmental Management - EMS) - 45 Controls & Clauses
11. **ISO 45001** (Occupational Health & Safety - OH&S) - 42 Controls & Clauses
12. **ISO 37000** (Governance of Organizations) - 78 Controls & Clauses
13. **ISO 37001** (Anti-Bribery Management - ABMS) - 27 Controls & Clauses
14. **ISO 37301** (Compliance Management - CMS) - 49 Controls & Clauses
15. **ISO 31000** (Risk Management Guidelines) - 27 Controls & Clauses
16. **ISO 50001** (Energy Management - EnMS) - 52 Controls & Clauses
17. **ISO 55001** (Asset Management System) - 28 Controls & Clauses
18. **ISO 41001** (Facility Management Systems) - 27 Controls & Clauses
19. **ISO 30401** (Knowledge Management - KMS) - 27 Controls & Clauses
20. **ISO 10002** (Customer Complaints Handling) - 27 Controls & Clauses
21. **ISO 19011** (Guidelines for Auditing Management Systems) - 61 Controls & Clauses
22. **ISO 42001** (AI Management System - AIMS) - 18 Controls & Clauses

### 🇺🇸 US National Standards
23. **NIST CSF 2.0** (Cybersecurity Framework 2024) - 106 Subcategories

---

## 🚀 Getting Started & Setup Guide

### 1. Prerequisites
- **Node.js** (v18 or v20+ recommended)
- **npm** or **pnpm**
- **Git**

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd "Full Compliance Manager"
npm install
```

### 3. Run Development Web Server
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### 4. Run Electron Desktop App (Windows)
```bash
npm run electron:dev
```

### 5. Build Production Application
- **Web Build**:
  ```bash
  npm run build
  ```
- **Windows Desktop Standalone Executable (`.exe`)**:
  ```bash
  npm run electron:build
  ```

---

## 🛠️ Key Architectural Details

- **Database**: Local `Dexie.js` IndexedDB storing `projects`, `assessments`, `evidence`, and `customFrameworks`.
- **Questionnaire Roundtrip**:
  - `exportClientQuestionnaireExcel(framework, assessments, clientName)`: Exports client-ready formatted `.xlsx`.
  - `parseAnsweredQuestionnaire(fileBuffer, frameworkId, projectId)`: Auto-parses client responses and updates the audit tracker.
- **Visual Identity**: Official **ANMAT Technology (`logo1.png`)**, Google Font **Cairo**, full dark/light theme adaptation and Arabic RTL / English LTR bilingual interface.
- **Strict Project Filtering**: When an audit workspace is opened with selected standards, only the chosen standards are active and rendered.

---

## 📂 Project Structure

```
Full Compliance Manager/
├── public/
│   ├── logos/                 # Official ANMAT and standard badges
│   └── logo1.png              # Primary ANMAT brand logo
├── src/
│   ├── components/            # React UI components (AssessmentView, Overview, Sidebar, LoginPage, etc.)
│   ├── data/
│   │   ├── extracted_frameworks.json # Master JSON of 23 standards (1,639 controls)
│   │   └── frameworks.ts      # Framework loader and aggregator
│   ├── db/
│   │   └── index.ts           # Dexie IndexedDB client-side database
│   ├── utils/
│   │   ├── i18n.ts            # Arabic/English translations & RTL support
│   │   └── importer.ts        # Excel questionnaire & custom standard parsers
│   ├── App.tsx                # Main application state & routing controller
│   └── main.tsx               # App entry point
├── electron/
│   └── main.cjs               # Electron desktop process wrapper
├── ISO Standards/             # Reference standard PDFs (Clauses 4-10)
├── package.json
└── vite.config.ts
```

---

## 🔒 Security & Offline Readiness
All assessment data, client findings, and evidence references remain strictly stored on the client machine inside IndexedDB. No external cloud transmission occurs unless exported by the auditor.
