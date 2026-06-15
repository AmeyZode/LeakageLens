# LeakageLens 🔍

**LeakageLens** is an AI-powered static analysis platform designed to identify data leakage, reproducibility issues, evaluation mistakes, and machine learning anti-patterns in ML projects.

This document describes the directory tree, the role of each directory, and the purpose of every file in the workspace.

---

## 📁 Complete Directory Tree

```text
LeakageLens/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   └── IssueAccordion.jsx
│   │   ├── views/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── backend/
│   ├── main.py
│   └── analyzer.py
├── leakagelens/
│   ├── core/
│   │   ├── __init__.py
│   │   ├── ingestion.py
│   │   ├── normalization.py
│   │   └── context_builder.py
│   ├── rules/
│   │   ├── __init__.py
│   │   ├── base_rule.py
│   │   ├── leakage_rules.py
│   │   ├── reproducibility_rules.py
│   │   ├── evaluation_rules.py
│   │   └── quality_rules.py
│   ├── ai/
│   │   ├── __init__.py
│   │   ├── recommendation_engine.py
│   │   └── prompt_templates.py
│   ├── reporting/
│   │   ├── __init__.py
│   │   ├── scorer.py
│   │   └── report_generator.py
│   ├── __init__.py
│   └── main.py
├── tests/
│   ├── test_ingestion.py
│   ├── test_normalization.py
│   ├── test_context_builder.py
│   ├── test_rules.py
│   └── test_reporting.py
├── leakagelens.egg-info/
│   ├── PKG-INFO
│   ├── SOURCES.txt
│   ├── dependency_links.txt
│   ├── entry_points.txt
│   ├── requires.txt
│   └── top_level.txt
├── sample_projects/
│   ├── preprocessing_leakage.py
│   └── leaky_notebook.ipynb
├── pyproject.toml
├── requirements.txt
├── LICENSE
└── LeakageLens.code-workspace
```

---

## 📦 Directory and File Reference

### 1. Root Directory (`/`)
Main workspace container housing project meta-configurations, licensing, dependencies, and code workspaces.

- **`pyproject.toml`**: Package installer configuration defining package dependencies, metadata, versions, and CLI entry points.
- **`requirements.txt`**: Standard list of required Python library packages for quick environment set up (`pip install -r requirements.txt`).
- **`LICENSE`**: MIT license terms governing open-source code usage.
- **`LeakageLens.code-workspace`**: VS Code configuration file tailored to set up the LeakageLens environment.

---

### 2. Web Interface Directories

#### 📂 Folder: `/frontend/`
Houses the React client-side application built with Vite.
- **`package.json`**: Standard dependencies declaration for React and dev configurations for Vite.
- **`vite.config.js`**: Vite configuration file enabling the `@vitejs/plugin-react` compiler and proxy settings to route `/api` to the backend.
- **`index.html`**: Root mount entry point document importing `/src/main.jsx`.
- **📂 Folder: `/frontend/src/`**: Contains core React logic.
  - **`main.jsx`**: Bootstraps the React framework, mounting the root component into DOM.
  - **`App.jsx`**: Top-level application shell coordinating views routing, user tokens, and global layout.
  - **`index.css`**: Styling directives and HSL custom property variables.
  - **📂 Subfolder: `src/components/`**: Exposes reusable React layout blocks.
  - **📂 Subfolder: `src/views/`**: Exposes page route components.
    - **`Home.jsx`**: Feature details overview cards.
    - **`Login.jsx`**: Handles Gmail validation and loading spinners.
    - **`Profile.jsx`**: Configurations input forms for custom OpenAI API keys.
    - **`Dashboard.jsx`**: Scanner trigger buttons, radial charts, and suggested fix modals.

#### 📂 Folder: `/backend/`
Houses the FastAPI web service logic exposing endpoints for authentication, scanning, and recommendations.
- **`main.py`**: FastAPI application handling auth, scanning target paths, logging profile records, and returning AI recommendations.
- **`analyzer.py`**: Runs AST checks to detect preprocessing data leakage, unseeded splits, and unvalidated pipelines.

---

### 3. Core Python Package Directory (`/leakagelens/`)
The main Python module folder housing the static analysis codebase and runner entry point.

- **`__init__.py`**: Exposes package version information and acts as the module initialization hook.
- **`main.py`**: The primary CLI program entrypoint built with `Typer`, coordinating scanning, context generation, lint evaluations, and outputs.

#### 📂 Subfolder: `leakagelens/core/`
*Sub-package containing base data parsing logic, directory traversal, and graph-construction modules.*
- **`__init__.py`**: Standard package initialization file.
- **`ingestion.py`**: Defines functions to discover project files recursively while excluding standard virtual environment folders (`.venv`, `node_modules`, etc.).
- **`normalization.py`**: Translates `.py` files and `.ipynb` notebook code cells into unified Abstract Syntax Tree (AST) representations, maintaining cell line mapping.
- **`context_builder.py`**: Builds context data (such as import bindings and variables assignment chains) and structures a variables dependency flow graph.

#### 📂 Subfolder: `leakagelens/rules/`
*Sub-package housing individual linting rules checking code against ML anti-patterns and reproducibility failures.*
- **`__init__.py`**: Aggregates and instantiates all rule classes to expose them as a list.
- **`base_rule.py`**: Houses the base `BaseRule` class and the `Issue` Pydantic model for reporting violations.
- **`leakage_rules.py`**: Placeholder classes evaluating preprocessing leaks, dataset overlaps, temporal splits, and target variable leaks.
- **`reproducibility_rules.py`**: Placeholder classes checking for missing random states, global seeds, or hardcoded system paths.
- **`evaluation_rules.py`**: Placeholder classes validating test sets segregation, train-test splits, and regression/classification metric combinations.
- **`quality_rules.py`**: Placeholder classes assessing clean code criteria like unused imports, variables, complexity, and docstrings.

#### 📂 Subfolder: `leakagelens/ai/`
*Sub-package structuring recommendations, prompt builders, and LLM providers adapters.*
- **`__init__.py`**: Package initialization file.
- **`recommendation_engine.py`**: Skeleton class to orchestrate suggestions from OpenAI, Ollama, or fallback local template lists.
- **`prompt_templates.py`**: Stores instruction layouts and output format specifications for AI models.

#### 📂 Subfolder: `leakagelens/reporting/`
*Sub-package structuring grading calculations, outputs, and report generation.*
- **`__init__.py`**: Package initialization file.
- **`scorer.py`**: Maps severities to numerical deductions and calculates final health grades.
- **`report_generator.py`**: Structures logs for command terminal UI (Rich), markdown file prints, or JSON outputs.

---

### 4. Unit Tests Directory (`/tests/`)
Contains test suites to run validations and maintain code stability.

- **`test_ingestion.py`**: Asserts ingestion scanner imports and file exclusions.
- **`test_normalization.py`**: Asserts parser imports and code cell stitching components.
- **`test_context_builder.py`**: Asserts import resolutions and graph construction modules.
- **`test_rules.py`**: Asserts validation rules logic loading and checks.
- **`test_reporting.py`**: Asserts report writers and scoring module imports.

---

### 5. Sample Projects Directory (`/sample_projects/`)
Demo templates containing target bugs to evaluate auditor capabilities.

- **`preprocessing_leakage.py`**: Mock script demonstrating standard preprocessing leakage and missing seeds.
- **`leaky_notebook.ipynb`**: Mock Jupyter Notebook containing hardcoded absolute paths and unsorted splits.

---

### 6. Package Metadata Directory (`/leakagelens.egg-info/`)
This directory is auto-generated by Python's `setuptools` packaging library when the package is installed in editable/development mode (`pip install -e .`). It contains distribution metadata that `pip` and python use to track installed packages.

- **`PKG-INFO`**: Document containing package meta details such as name, version, descriptions, and license.
- **`SOURCES.txt`**: Automatic registry cataloging all project files included in the build.
- **`dependency_links.txt`**: Links indicating dependency packages locations.
- **`entry_points.txt`**: Registry connecting commands to executable hooks (maps the `leakagelens` CLI trigger directly to `leakagelens.main:app`).
- **`requires.txt`**: Package requirements declarations describing the packages to install.
- **`top_level.txt`**: Record describing the primary namespace module (e.g. `leakagelens`).
