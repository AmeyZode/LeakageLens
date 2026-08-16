# LeakageLens Frontend Architecture Implementation Plan

Status: Analysis complete. Implementation should begin only after this plan is approved.

## 1. Current Frontend Problems

The current frontend has a polished visual direction, but it is not yet aligned with the implemented backend contract.

- Most protected routes point to the same `Dashboard` component. `/scanner`, `/reports`, `/history`, `/rules`, and `/ai-recommendations` are scroll targets inside one page instead of separate product workflows.
- API calls are made directly inside components. `Dashboard.jsx` calls `fetch('/api/scan')` directly, which makes error handling, payload normalization, auth, and future endpoint changes hard to maintain.
- The scan result shape is partly mocked. The frontend expects `files_scanned`, category counts, and a top-level `recommendations` object, but the backend currently returns only `score`, `counts`, and `issues`, with `ai_recommendation` embedded per issue.
- Dashboard metrics are hardcoded to placeholder values such as `92%`, `12`, `48`, and `LOW` instead of rendering actual backend data.
- User identity is hardcoded in layout and profile UI. The backend `/api/auth/google` returns a `user` object, but the frontend currently stores only a token.
- History is mocked in `Profile.jsx` even though the backend exposes `/api/history`.
- Settings are mixed with profile and history concerns. API provider preferences are stored locally but not centrally modeled.
- The stylesheet is monolithic. `index.css` contains layout, dashboard, login, profile, modal, sidebar, table, and responsive styles in one file.
- Issue rendering does not fully match the backend recommendation format. It looks for `recommendation.suggested_fix` and `recommendation.code_snippet`, while implemented AI recommendations return `{ explanation, fix }`.
- There is no persistent global scan state. Reloading or navigating loses the latest scan result except for a pending path shortcut.
- There is no real report page that can render Markdown and JSON reports derived from the backend response.
- There is no dedicated rules page reflecting `ALL_RULES` from the backend. Since no `/api/rules` endpoint exists, rules must be represented from a frontend constant that mirrors implemented backend rule IDs and names.
- Scanner "upload project" is visually present, but the implemented backend accepts a filesystem path only. There is no upload endpoint.

## 2. Backend Analysis

### Backend Service

The backend is a FastAPI app in `backend/main.py`. It exposes static analysis and recommendation endpoints under `/api`.

Implemented endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check with status and timestamp. |
| POST | `/api/auth/google` | Simulated Google auth. Accepts a credential string and returns a mock token and user. |
| POST | `/api/scan` | Scans a backend-accessible file or directory path. |
| GET | `/api/history` | Returns in-memory mock scan history. |
| POST | `/api/history` | Appends a scan summary to in-memory history. |
| POST | `/api/recommendation` | Returns a recommendation for one issue payload. |

### Request Payloads

`POST /api/auth/google`

```json
{
  "credential": "google-oauth-token-or-demo-value"
}
```

`POST /api/scan`

```json
{
  "path": "sample_projects",
  "ai_provider": "fallback",
  "api_key": null
}
```

`POST /api/history`

```json
{
  "project_name": "sample_projects",
  "score": 0,
  "critical_count": 2,
  "major_count": 7,
  "minor_count": 0
}
```

`POST /api/recommendation`

```json
{
  "rule_id": "L001",
  "rule_name": "Preprocessing Leakage",
  "severity": "critical",
  "file_path": "preprocessing_leakage.py",
  "line_number": 13,
  "context_line": "X_scaled = scaler.fit_transform(X)",
  "description": "StandardScaler.fit_transform() is executed before train_test_split.",
  "ai_provider": "fallback",
  "api_key": null
}
```

### Scan Response Payload

Runtime verification of `PipelineAnalyzer().scan_path('sample_projects')` confirms this implemented shape:

```json
{
  "score": 0,
  "counts": {
    "critical": 2,
    "major": 7,
    "minor": 0
  },
  "issues": [
    {
      "rule_id": "L001",
      "rule_name": "Preprocessing Leakage",
      "severity": "critical",
      "file_path": "preprocessing_leakage.py",
      "line_number": 13,
      "context_line": "X_scaled = scaler.fit_transform(X)",
      "description": "StandardScaler.fit_transform() is executed on target variable X prior to train_test_split.",
      "suggested_fix": "scaler = StandardScaler()...",
      "ai_recommendation": {
        "explanation": "Scaling or data transformation is executed on the entire dataset prior to splitting.",
        "fix": "# Perform train/test split first..."
      }
    }
  ]
}
```

Important compatibility notes:

- There is no `files_scanned` field in the current API.
- There are no category counts such as `leakage`, `evaluation`, `reproducibility`, or `quality`.
- There is no top-level `recommendations` object in scan responses.
- AI recommendations are attached to each issue as `issue.ai_recommendation`.
- The backend can scan `.py` and `.ipynb` files only through `discover_files`; JSON/YAML normalization exists but ingestion currently excludes those extensions.
- The backend path must exist on the backend machine. Browser file upload or directory selection cannot be used for scanning without a new upload endpoint.

### Analysis Pipeline

The scan pipeline is:

1. `backend/main.py` receives `/api/scan`.
2. `PipelineAnalyzer.scan_path()` resolves the requested path relative to the workspace root unless an absolute path is supplied.
3. `leakagelens.core.ingestion.discover_files()` recursively finds supported `.py` and `.ipynb` files and skips ignored directories.
4. `leakagelens.core.normalization.normalize_file()` converts Python files or notebook code cells into raw source and AST.
5. `leakagelens.core.context_builder.build_context()` collects imports, assignments, and calls.
6. `leakagelens.rules.ALL_RULES` runs all rule classes.
7. `leakagelens.reporting.scorer.calculate_health_score()` computes severity counts and a score.
8. `RecommendationEngine.get_recommendation()` returns fallback or OpenAI recommendation data for each issue.
9. The API returns `{ score, counts, issues }`.

### Issue Model

The canonical issue model is `leakagelens.rules.base_rule.Issue`:

- `rule_id`
- `rule_name`
- `severity`
- `file_path`
- `line_number`
- `context_line`
- `description`
- `suggested_fix`

The API enriches each issue with:

- `ai_recommendation.explanation`
- `ai_recommendation.fix`

### Scoring Model

`calculate_health_score()` starts from 100 and deducts:

- Critical issue: 15 points
- Major issue: 10 points
- Minor issue: 5 points

The final score is clamped to a minimum of 0.

Counts are:

```json
{
  "critical": 0,
  "major": 0,
  "minor": 0
}
```

### Rule Model

Implemented rule registry:

| Category | Rule ID | Rule Name | Severity | Current behavior |
| --- | --- | --- | --- | --- |
| Leakage | L001 | Preprocessing Leakage | critical | Emits sample issues for `preprocessing_leakage.py` and `leaky_notebook.ipynb`. |
| Leakage | L002 | Overlap Leakage | critical | Placeholder, returns no issues. |
| Leakage | L003 | Temporal Leakage | major | Placeholder, returns no issues. |
| Leakage | L004 | Feature Leakage | critical | Placeholder, returns no issues. |
| Reproducibility | R001 | Missing Random State | major | Emits sample issues for known sample files. |
| Reproducibility | R002 | Missing Global Seed | major | Emits sample issues for known sample files. |
| Reproducibility | R003 | Hardcoded Paths | major | Emits notebook hardcoded path issue. |
| Evaluation | E001 | Evaluation on Train Data | major | Emits sample issue for `preprocessing_leakage.py`. |
| Evaluation | E002 | Missing Validation Split | major | Placeholder, returns no issues. |
| Evaluation | E003 | Metric Misuse | major | Placeholder, returns no issues. |
| Quality | Q001 | Unused Imports | minor | Placeholder, returns no issues. |
| Quality | Q002 | Unused Variables | minor | Placeholder, returns no issues. |
| Quality | Q003 | High Complexity | minor | Placeholder, returns no issues. |
| Quality | Q004 | Missing Docstring | minor | Placeholder, returns no issues. |

### Reporting Format

The reporting engine can generate:

- CLI report via Rich.
- Markdown report with score, summary counts, issue details, suggested fixes, and AI explanation/fix.
- JSON report with `score`, `counts`, and `issues`.

No backend endpoint currently exposes generated Markdown or JSON report files. The frontend must generate Markdown and JSON report views client-side from the `/api/scan` result while preserving the same fields and structure.

### AI Recommendation Output

The recommendation engine returns:

```json
{
  "explanation": "Text explanation",
  "fix": "Suggested code or guidance"
}
```

The engine supports:

- `fallback`: local static templates keyed by `rule_id`.
- `openai`: uses the OpenAI SDK if an API key is provided.

The constructor also accepts `ollama_url`, but the implemented logic does not currently call Ollama. The frontend can store an Ollama URL preference, but must not imply backend Ollama functionality exists until an endpoint/provider implementation is added.

## 3. Existing Frontend Architecture

Current source structure:

```text
frontend/src/
  App.jsx
  main.jsx
  index.css
  context/
    ThemeContext.jsx
  components/
    Layout.jsx
    Sidebar.jsx
    MetricCard.jsx
    IssueAccordion.jsx
  views/
    Home.jsx
    Login.jsx
    Dashboard.jsx
    Profile.jsx
```

Current dependencies:

- React 18
- Vite
- Framer Motion
- Lucide React
- Recharts

Current strengths to preserve:

- Vite proxy already maps `/api` to `http://localhost:8000`.
- Dark/light theme persistence already exists through `ThemeContext`.
- Lucide icon set and Framer Motion are already installed.
- Existing visual language is close to the requested dark enterprise dashboard style.
- `MetricCard` and `IssueAccordion` are useful building blocks, but they need API-aligned props and better placement.

Current weaknesses:

- Routing is a manual hash-router and maps many routes to one page.
- There is no centralized API layer.
- There is no application-level scan/auth/settings context.
- Data is heavily mocked.
- Page responsibilities are blurred.
- CSS is hard to reason about and hard to scale.

## 4. Missing Frontend Features

- Dedicated Dashboard page using actual latest scan/history state.
- Dedicated Scanner page with backend-compatible path scanning, progress states, and scan log simulation based on actual request lifecycle.
- Dedicated Reports page with health score, severity summary, issue summary, Markdown report, JSON report, and download buttons.
- Dedicated History page using `GET /api/history` and `POST /api/history`.
- Dedicated AI Recommendations page grouping `issue.ai_recommendation` by rule/severity/file, with filter, search, and copy fix.
- Dedicated Rules page showing implemented rule registry and which rules are active/placeholders.
- Dedicated Settings page for theme, API provider, OpenAI key, Ollama URL preference, and scan defaults.
- Dedicated Profile page using stored backend auth user data rather than hardcoded names.
- Issue detail view with severity, file, line, explanation, recommendation, and code snippet.
- Global state for auth, settings, current scan, scan history, UI preferences, and selected issue.
- Centralized report generation utilities.
- Centralized API error normalization.
- Real empty/loading/error states for each page.
- Responsive layouts for tablet and mobile without relying on one giant dashboard.

## 5. Components That Should Be Deleted

These should be removed after replacement components exist:

- `frontend/src/views/Home.jsx`: Delete or convert into a lightweight redirect/overview only if the product still needs a public entry page. The requested app should open like a SaaS dashboard, not a landing page.
- `frontend/dist/`: Remove from source control or ignore as build output. Do not manually edit.

No backend files should be deleted for this frontend architecture work.

## 6. Components That Should Be Kept

Keep and refactor:

- `ThemeContext.jsx`: Keep the persisted theme behavior, move into a broader settings/theme provider if needed.
- `MetricCard.jsx`: Keep as a reusable stat card after tightening visual variants and making values fully data-driven.
- `IssueAccordion.jsx`: Keep the expandable issue interaction, but align it with `issue.ai_recommendation.explanation` and `issue.ai_recommendation.fix`.
- `Layout.jsx`: Keep conceptually, but split into shell-level components.
- `Sidebar.jsx`: Keep conceptually, but move into `components/layout` and remove hardcoded user data.

Keep package choices:

- React + Vite
- Lucide React
- Framer Motion
- Recharts

## 7. Components That Should Be Refactored

- `App.jsx`: Refactor into route configuration plus providers. It should not own auth/session logic directly.
- `Layout.jsx`: Split into `AppShell`, `TopBar`, `Sidebar`, `CommandMenu`, `NotificationsMenu`, and `UserMenu`.
- `Sidebar.jsx`: Move navigation constants into `config/navigation.js`; support collapsed state through global UI state.
- `Dashboard.jsx`: Split into page and domain components. Remove placeholder response as default data.
- `Profile.jsx`: Split into `ProfilePage`, `SettingsPage`, and history components. Replace mock audits with API history.
- `index.css`: Split into layered CSS files or at minimum organized sections: tokens, base, layout, components, pages, utilities.
- `IssueAccordion.jsx`: Refactor into `IssueList`, `IssueCard`, `IssueDetailPanel`, and severity helpers.

## 8. New Components Required

Layout:

- `AppShell`
- `TopBar`
- `Sidebar`
- `MobileNav`
- `CommandMenu`
- `UserMenu`
- `PageHeader`
- `SectionHeader`

Common:

- `Button`
- `IconButton`
- `Card`
- `Badge`
- `StatusPill`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `SearchInput`
- `Select`
- `Toggle`
- `Tabs`
- `ProgressBar`
- `CopyButton`
- `CodeBlock`

Dashboard:

- `DashboardPage`
- `HealthOverview`
- `MetricGrid`
- `SeverityDistributionChart`
- `RecentScansTable`
- `TopIssuesList`
- `RecentRecommendations`

Scanner:

- `ScannerPage`
- `ScanPathForm`
- `ProjectPickerPanel`
- `ScanProgress`
- `ScanLogs`
- `ScanResultSummary`

Reports:

- `ReportsPage`
- `ReportSummary`
- `MarkdownReportViewer`
- `JsonReportViewer`
- `ReportDownloadActions`

History:

- `HistoryPage`
- `HistoryTable`
- `HistoryFilters`

Issues:

- `IssueList`
- `IssueCard`
- `IssueDetails`
- `IssueSeverityBadge`
- `IssueFilters`

AI Recommendations:

- `RecommendationsPage`
- `RecommendationGroup`
- `RecommendationCard`
- `RecommendationFilters`

Rules:

- `RulesPage`
- `RulesTable`
- `RuleStatusBadge`
- `RuleCategorySummary`

Settings/Profile:

- `SettingsPage`
- `ProviderSettings`
- `ThemeSettings`
- `PreferenceSettings`
- `ProfilePage`
- `ProfileSummary`

Charts:

- `SeverityDonutChart`
- `ScoreGauge`
- `TrendSparkline`

## 9. API Integration Plan

Create `frontend/src/services/api.js` as the only module that performs HTTP requests.

Public API functions:

```js
export async function healthCheck()
export async function loginWithGoogleCredential(credential)
export async function scanProject({ path, aiProvider, apiKey })
export async function getHistory()
export async function createHistoryEntry({ projectName, score, criticalCount, majorCount, minorCount })
export async function getRecommendation({ issue, aiProvider, apiKey })
```

Normalization helpers:

- Convert backend snake_case fields into UI-friendly aliases only at the boundary.
- Preserve the raw backend scan result for JSON report export.
- Derive `totalIssues` from `issues.length`.
- Derive `riskLevel` from score and severity counts.
- Derive `filesScanned` as unique file count from `issues[].file_path`, because the backend does not return scanned file count.
- Derive category counts from `rule_id` prefixes:
  - `L` => leakage
  - `R` => reproducibility
  - `E` => evaluation
  - `Q` => quality
- Extract recommendations from `issues[].ai_recommendation`, not a top-level `recommendations` object.

Error handling:

- Parse FastAPI errors from `{ detail }`.
- Fall back to response text when JSON parse fails.
- Return consistent errors to contexts and pages.

Backend compatibility constraints:

- Use `/api/scan` with `path`, `ai_provider`, and `api_key` only.
- Do not add file upload calls because no backend upload endpoint exists.
- Do not call `/api/rules` because no such endpoint exists.
- Do not call report endpoints because none exist.
- Use `POST /api/recommendation` only when refreshing a recommendation for one issue; scan responses already include recommendations.

## 10. State Management Plan

Use Context API with focused providers:

```text
AppProviders
  ThemeProvider
  AuthProvider
  SettingsProvider
  ScanProvider
  HistoryProvider
  UIProvider
```

State responsibilities:

- `AuthProvider`
  - `token`
  - `user`
  - `login(credential)`
  - `logout()`
  - Persist `token` and `user` in localStorage.

- `SettingsProvider`
  - `theme`
  - `aiProvider`
  - `openAiKey`
  - `ollamaUrl`
  - `defaultScanPath`
  - Persist preferences in localStorage.

- `ScanProvider`
  - `currentScan`
  - `rawScan`
  - `scanStatus`
  - `scanError`
  - `scanLogs`
  - `selectedIssue`
  - `runScan(path)`
  - After successful scan, call `POST /api/history`.

- `HistoryProvider`
  - `history`
  - `historyStatus`
  - `loadHistory()`
  - `appendHistory()`

- `UIProvider`
  - `sidebarCollapsed`
  - `commandMenuOpen`
  - `notificationsOpen`
  - `activeReportTab`

Avoid prop drilling:

- Pages read domain state from hooks like `useScan()`, `useSettings()`, `useAuth()`, and `useHistory()`.
- Components receive only display props and callbacks.

## 11. Folder Restructuring Plan

Target structure:

```text
frontend/src/
  App.jsx
  main.jsx
  routes/
    routeConfig.js
    Router.jsx
  components/
    layout/
      AppShell.jsx
      Sidebar.jsx
      TopBar.jsx
      CommandMenu.jsx
      UserMenu.jsx
      NotificationsMenu.jsx
      MobileNav.jsx
    common/
      Badge.jsx
      Button.jsx
      Card.jsx
      CodeBlock.jsx
      CopyButton.jsx
      EmptyState.jsx
      ErrorState.jsx
      IconButton.jsx
      LoadingState.jsx
      PageHeader.jsx
      ProgressBar.jsx
      SearchInput.jsx
      SectionHeader.jsx
      Select.jsx
      Tabs.jsx
      Toggle.jsx
    dashboard/
      HealthOverview.jsx
      MetricGrid.jsx
      RecentRecommendations.jsx
      RecentScansTable.jsx
      TopIssuesList.jsx
    scanner/
      ProjectPickerPanel.jsx
      ScanLogs.jsx
      ScanPathForm.jsx
      ScanProgress.jsx
      ScanResultSummary.jsx
    reports/
      JsonReportViewer.jsx
      MarkdownReportViewer.jsx
      ReportDownloadActions.jsx
      ReportSummary.jsx
    history/
      HistoryFilters.jsx
      HistoryTable.jsx
    recommendations/
      RecommendationCard.jsx
      RecommendationFilters.jsx
      RecommendationGroup.jsx
    rules/
      RuleCategorySummary.jsx
      RulesTable.jsx
    issues/
      IssueCard.jsx
      IssueDetails.jsx
      IssueFilters.jsx
      IssueList.jsx
      IssueSeverityBadge.jsx
    charts/
      ScoreGauge.jsx
      SeverityDonutChart.jsx
  context/
    AuthContext.jsx
    HistoryContext.jsx
    ScanContext.jsx
    SettingsContext.jsx
    ThemeContext.jsx
    UIContext.jsx
  hooks/
    useDerivedScanMetrics.js
    useLocalStorage.js
    useReportExports.js
  pages/
    DashboardPage.jsx
    ScannerPage.jsx
    ReportsPage.jsx
    HistoryPage.jsx
    RecommendationsPage.jsx
    RulesPage.jsx
    SettingsPage.jsx
    ProfilePage.jsx
    LoginPage.jsx
  services/
    api.js
  utils/
    constants.js
    formatters.js
    reportBuilders.js
    ruleCatalog.js
    scanTransforms.js
    severity.js
  styles/
    tokens.css
    base.css
    layout.css
    components.css
    pages.css
```

## 12. Component Hierarchy

```text
main.jsx
  ThemeProvider
    AuthProvider
      SettingsProvider
        ScanProvider
          HistoryProvider
            UIProvider
              App
                Router
                  LoginPage
                  AppShell
                    Sidebar
                    TopBar
                    Page
                      DashboardPage
                      ScannerPage
                      ReportsPage
                      HistoryPage
                      RecommendationsPage
                      RulesPage
                      SettingsPage
                      ProfilePage
```

Issue components:

```text
IssueList
  IssueFilters
  IssueCard
    IssueSeverityBadge
    IssueDetails
      CodeBlock
      CopyButton
```

Report components:

```text
ReportsPage
  ReportSummary
  Tabs
    MarkdownReportViewer
    JsonReportViewer
  ReportDownloadActions
```

Scanner components:

```text
ScannerPage
  ScanPathForm
  ProjectPickerPanel
  ScanProgress
  ScanLogs
  ScanResultSummary
```

## 13. Page Flow

Dashboard:

- Load health status and history.
- Show latest scan if available.
- Show pipeline health, issues, risk score, derived files scanned, recent scans, severity distribution, top issues, and recent recommendations.
- Empty state prompts user to run a scan.

Scanner:

- User enters a backend-accessible path.
- Optional directory picker can display selected file names, but scanning still requires a backend path because no upload endpoint exists.
- User starts scan.
- UI shows deterministic progress stages: validating path, sending request, analyzing files, applying rules, generating recommendations, complete.
- On success, `ScanProvider` stores result and `HistoryProvider` logs summary through `/api/history`.

Reports:

- Use the current scan result.
- Display health score and issue summary.
- Build Markdown report client-side from the scan payload.
- Build JSON report from the raw backend response.
- Download buttons save generated Markdown/JSON in the browser.

History:

- Load `/api/history`.
- Show previous scans with date/time, score, status, and severity counts.
- "Open report" loads available current/local report if present, otherwise shows a clear empty state because backend history records do not store full issue details.

AI Recommendations:

- Read recommendations from current scan issues.
- Group by severity, rule, or file.
- Support search/filter.
- Copy `ai_recommendation.fix`.
- Allow refreshing one issue recommendation through `/api/recommendation`.

Rules:

- Display frontend rule catalog that mirrors the backend `ALL_RULES` registry.
- Mark rules as `emits issues today` or `placeholder` based on current implementation.
- Explain rule categories without claiming runtime rule toggling, since no backend rule configuration endpoint exists.

Settings:

- Theme toggle.
- API provider select: `fallback` and `openai` as functional options.
- Ollama URL preference can be stored but marked as pending backend support.
- OpenAI key stored in localStorage and sent in `/api/scan` or `/api/recommendation`.
- Default scan path and UI preferences.

Profile:

- Show authenticated user from `/api/auth/google` response when available.
- Show local workspace stats derived from history and latest scan.

## 14. State Flow

Scan flow:

```text
ScannerPage
  -> useScan().runScan(path)
  -> services/api.scanProject({ path, aiProvider, apiKey })
  -> normalizeScanResponse(raw)
  -> ScanContext stores raw and normalized scan
  -> HistoryContext posts summary
  -> Dashboard/Reports/AI pages consume same current scan
```

Auth flow:

```text
LoginPage
  -> useAuth().login(credential)
  -> services/api.loginWithGoogleCredential(credential)
  -> AuthContext persists token and user
  -> AppShell renders user menu/profile
```

Settings flow:

```text
SettingsPage
  -> useSettings().updateProvider(...)
  -> localStorage persistence
  -> ScanContext reads provider/key during runScan
```

Report flow:

```text
ReportsPage
  -> useScan().rawScan
  -> reportBuilders.buildMarkdownReport(rawScan)
  -> reportBuilders.buildJsonReport(rawScan)
  -> ReportDownloadActions downloads generated strings
```

## 15. API Mapping

| Frontend feature | Backend endpoint | Notes |
| --- | --- | --- |
| Health indicator | `GET /api/health` | Use for top-bar backend status. |
| Login | `POST /api/auth/google` | Store returned `token` and `user`; current backend is mock auth. |
| Run scan | `POST /api/scan` | Main scanner action; path must exist on backend filesystem. |
| Dashboard latest result | Local `ScanContext` | Backend has no latest scan endpoint. |
| History list | `GET /api/history` | In-memory backend history only. |
| Save history | `POST /api/history` | Post after successful scan. |
| AI recommendation refresh | `POST /api/recommendation` | Optional per issue; scan already returns recommendation. |
| Rules page | Frontend `ruleCatalog.js` | No backend endpoint exists. |
| Reports page | Frontend `reportBuilders.js` | No backend report endpoint exists. |
| Upload project | Not available | No backend upload endpoint; use path scan only. |

## 16. Implementation Steps

Step 1: Clean old route architecture

- Replace route-to-dashboard mapping with a real route config.
- Keep hash-based routing unless adding a router dependency is explicitly approved.
- Remove landing-page-first behavior for authenticated users.

Step 2: Create service API layer

- Add `frontend/src/services/api.js`.
- Move every HTTP call into this module.
- Add API error normalization and scan response normalization.

Step 3: Create utilities

- Add severity helpers.
- Add rule catalog.
- Add scan transform helpers.
- Add report builders for Markdown and JSON.
- Add formatters for dates, scores, and file paths.

Step 4: Create global state

- Add `AuthContext`.
- Add `SettingsContext`.
- Add `ScanContext`.
- Add `HistoryContext`.
- Add `UIContext`.
- Keep or fold existing `ThemeContext` into settings without breaking persisted theme behavior.

Step 5: Create layout system

- Split `Layout.jsx` into `AppShell`, `TopBar`, `Sidebar`, `CommandMenu`, `UserMenu`, and notification components.
- Add collapsible sidebar state.
- Keep sticky header and responsive drawer behavior.

Step 6: Create common component library

- Add reusable buttons, cards, badges, tabs, form controls, empty/loading/error states, code block, and copy button.
- Keep styling compact and enterprise-oriented.

Step 7: Build Dashboard page

- Use latest scan and history context.
- Render data-driven cards: pipeline health, issues, risk score, derived files scanned.
- Add severity distribution, top issues, recent scans, and recent recommendations.

Step 8: Build Scanner page

- Create backend-compatible path scan workflow.
- Add progress stages and live log UI.
- Add directory picker as optional local preview only, with path field as the actual scan input.
- Call `/api/scan`.
- Save history after successful scan.

Step 9: Build Reports page

- Add health score and issue summary.
- Render Markdown report.
- Render JSON report.
- Add download buttons.

Step 10: Build History page

- Fetch `/api/history`.
- Render previous scans.
- Add status and score styling.
- Provide "Open report" behavior only for current/local scan data, since backend history does not store full reports.

Step 11: Build Issue details

- Show severity, file, line, description, context line, suggested fix, AI explanation, and AI fix.
- Support copy fix.

Step 12: Build AI Recommendations page

- Group recommendations from current scan issues.
- Add filter/search.
- Add copy fix.
- Add optional refresh from `/api/recommendation`.

Step 13: Build Rules page

- Add rule catalog matching backend IDs, names, severities, and placeholder status.
- Show category summaries.

Step 14: Build Settings and Profile pages

- Settings: theme, provider, OpenAI key, Ollama URL preference, default scan path, UI preferences.
- Profile: current user and workspace stats.

Step 15: Rework styling

- Split `index.css` into structured CSS files.
- Preserve dark mode, real light mode, glass panels, purple/blue accents, sticky header, and responsive behavior.
- Avoid landing-page styling on authenticated app screens.

Step 16: Verify

- Run frontend build.
- Run available backend tests if needed.
- Manually verify scan against `sample_projects`.
- Verify dark/light theme persistence.
- Verify no direct `fetch` calls remain inside components.

## 17. Files To Delete

Delete only after replacements are present:

- `frontend/src/views/Home.jsx`
- `frontend/dist/index.html`
- `frontend/dist/assets/index-d4661feb.css`
- `frontend/dist/assets/index-38f01782.js`

Optional cleanup after approval:

- Remove checked-in `frontend/dist` from source control and rely on `npm run build`.
- Keep `frontend/node_modules` untouched unless the user approves dependency/source-control cleanup.

## 18. Files To Modify

- `frontend/src/App.jsx`
- `frontend/src/main.jsx`
- `frontend/src/index.css`
- `frontend/src/context/ThemeContext.jsx`
- `frontend/src/components/Layout.jsx`
- `frontend/src/components/Sidebar.jsx`
- `frontend/src/components/MetricCard.jsx`
- `frontend/src/components/IssueAccordion.jsx`
- `frontend/src/views/Dashboard.jsx`
- `frontend/src/views/Login.jsx`
- `frontend/src/views/Profile.jsx`

Backend files should not be modified during this frontend alignment pass unless a later approved backend task adds missing endpoints.

## 19. Files To Create

- `frontend/src/services/api.js`
- `frontend/src/routes/Router.jsx`
- `frontend/src/routes/routeConfig.js`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/context/SettingsContext.jsx`
- `frontend/src/context/ScanContext.jsx`
- `frontend/src/context/HistoryContext.jsx`
- `frontend/src/context/UIContext.jsx`
- `frontend/src/hooks/useLocalStorage.js`
- `frontend/src/hooks/useDerivedScanMetrics.js`
- `frontend/src/hooks/useReportExports.js`
- `frontend/src/utils/constants.js`
- `frontend/src/utils/formatters.js`
- `frontend/src/utils/reportBuilders.js`
- `frontend/src/utils/ruleCatalog.js`
- `frontend/src/utils/scanTransforms.js`
- `frontend/src/utils/severity.js`
- `frontend/src/pages/DashboardPage.jsx`
- `frontend/src/pages/ScannerPage.jsx`
- `frontend/src/pages/ReportsPage.jsx`
- `frontend/src/pages/HistoryPage.jsx`
- `frontend/src/pages/RecommendationsPage.jsx`
- `frontend/src/pages/RulesPage.jsx`
- `frontend/src/pages/SettingsPage.jsx`
- `frontend/src/pages/ProfilePage.jsx`
- `frontend/src/pages/LoginPage.jsx`
- Layout, common, dashboard, scanner, reports, history, recommendations, rules, issues, and charts components listed in section 8.
- `frontend/src/styles/tokens.css`
- `frontend/src/styles/base.css`
- `frontend/src/styles/layout.css`
- `frontend/src/styles/components.css`
- `frontend/src/styles/pages.css`

## 20. Approval Gate

No implementation code should be written until this plan is approved.

After approval, implementation should proceed step by step, preserving backend compatibility and using only the implemented API contracts documented above.
