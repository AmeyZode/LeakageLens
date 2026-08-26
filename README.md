<div align="center">

# 🛡️ LeakageLens

**Static Data Leakage Analysis, ML Pipeline Reliability & AI Remediation Engine**

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![React 19](https://img.shields.io/badge/react-19.x-61dafb.svg)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/tailwind-v4.x-38bdf8.svg)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![Groq AI](https://img.shields.io/badge/Groq-GPT--OSS%20120B-f55036.svg)](https://groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*An automated static analysis platform designed to uncover data contamination, hold-out leakage, lookahead bias, and reproducibility risks across machine learning scripts and Jupyter notebooks without executing untrusted code.*

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Dual-Engine Architecture](#-dual-engine-architecture)
- [Leakage Detection Catalog](#-leakage-detection-catalog)
- [Web Application Modules](#-web-application-modules)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [One-Command Startup](#one-command-startup)
  - [Manual Setup (Backend + Frontend)](#manual-setup)
- [Groq AI Engine Configuration](#-groq-ai-engine-configuration)
- [CLI & API Usage](#-cli--api-usage)
- [Project Structure](#-project-structure)
- [Academic Context & Authors](#-academic-context--authors)

---

## 🌟 Overview

Data leakage is one of the most pervasive failure modes in machine learning: models achieve near-perfect cross-validation accuracy during development, but experience catastrophic performance degradation upon deployment to real-world data.

**LeakageLens** statically inspects Python scripts (`.py`) and Jupyter Notebooks (`.ipynb`) using an Abstract Syntax Tree (AST) parser combined with a trained Machine Learning risk classifier to detect subtle dataflow leaks across train/test partition boundaries, quantify overoptimism risk, and generate context-aware code remediation patches powered by **Groq Cloud (GPT-OSS 120B / Llama 3.3)**.

---

## ✨ Key Features

- 🔍 **Static AST Inspection**: Discovers boundary breaches without running unverified code or needing heavy execution environments.
- 📓 **Jupyter Notebook Parser**: Automatically extracts multi-cell notebook flows (`.ipynb`), cell execution orders, and cross-cell dependencies.
- ⚡ **Dual-Engine Detection**: Combines 10+ deterministic AST heuristic rules with a trained Random Forest + TF-IDF Machine Learning Classifier.
- 📈 **ML Overoptimism Estimator**: Estimates generalization inflation gap ($\Delta = \text{Apparent} - \text{Production}$) and highlights dominant contamination drivers.
- 🌐 **Interactive Directed Acyclic Graph (DAG)**: 5-stage dataflow visualizer tracing feature transformations across split boundaries.
- 🤖 **Groq AI Code Fixer**: Sub-second generation of side-by-side refactored code patches using **Groq GPT-OSS 120B / Llama 3.3**.
- 🎨 **Minimalist Dark UI**: Built with React 19, Tailwind CSS v4, and shadcn/ui design primitives.

---

## 🏗️ Dual-Engine Architecture

```
                       ┌───────────────────────────────────────────┐
                       │        Input Python / Notebook Code       │
                       └─────────────────────┬─────────────────────┘
                                             │
                     ┌───────────────────────┴───────────────────────┐
                     ▼                                               ▼
     ┌───────────────────────────────┐               ┌───────────────────────────────┐
     │   Layer 1: AST Rule Engine    │               │  Layer 2: ML Leakage Model    │
     │  (10+ Static Heuristic Rules) │               │  (RandomForest + TF-IDF)      │
     ├───────────────────────────────┤               ├───────────────────────────────┤
     │ • Preprocessing fit (L001)    │               │ • Continuous Risk (0-100%)    │
     │ • Global Imputation (L002)    │               │ • Generalization Gap (Δ drop) │
     │ • Target Proxy Leak (L004)    │               │ • Overoptimism Index          │
     │ • Temporal Shuffling (L005)   │               │ • Feature Importances         │
     │ • Group Leakage (L006)        │               │ • Probabilistic Classification│
     │ • Random State Seeds (R001)   │               │   (Clean / Suspicious / Leak) │
     │ • Evaluation on Train (E001)  │               │                               │
     └───────────────┬───────────────┘               └───────────────┬───────────────┘
                     │                                               │
                     └───────────────────────┬───────────────────────┘
                                             ▼
                             ┌───────────────────────────────┐
                             │       Merged Diagnosis        │
                             │  (Score, Highlights & DAG)    │
                             └───────────────┬───────────────┘
                                             ▼
                             ┌───────────────────────────────┐
                             │  Layer 3: Groq (GPT-OSS 120B) │
                             │  AI Code Transformation & Fix │
                             └───────────────────────────────┘
```

---

## 🛡️ Leakage Detection Catalog

LeakageLens evaluates code across 7+ core vulnerability archetypes:

| Rule ID | Violation Name | Severity | Description |
| :--- | :--- | :--- | :--- |
| **`L001`** | **Preprocessing Scaling Leakage** | `Critical` | Scaling (`StandardScaler`, `MinMaxScaler`, `RobustScaler`, `OneHotEncoder`) fitted on full dataset prior to `train_test_split`. |
| **`L002`** | **Global Imputation Leakage** | `Critical` | Missing value imputers (`SimpleImputer`, `KNNImputer`) fitted across full dataset before partitioning. |
| **`L004`** | **Target Variable & Encoding Leakage** | `Critical` | Target mean statistics (`groupby('target').transform('mean')`, `TargetEncoder`) computed globally without isolation. |
| **`L005`** | **Temporal Lookahead Bias** | `Critical` | Time-series data split with `shuffle=True` or future expanding windows (`shift(-1)`), violating chronological causality. |
| **`L006`** | **Group / Subject Identity Leakage** | `Major` | Grouped entities (patients, customers) split randomly instead of grouped (`GroupShuffleSplit`, `GroupKFold`). |
| **`R001`** | **Missing Deterministic Seed** | `Major` | Stochastic splitters (`train_test_split`) or estimators (`RandomForestClassifier`) missing `random_state`. |
| **`E001`** | **Evaluation on Training Partition** | `Major` | Reporting validation scores via `model.score(X_train, y_train)` instead of holdout test data. |
| **`E003`** | **Evaluation Metric Misuse** | `Minor` | Evaluating classification models with regression metrics (e.g. MSE instead of accuracy/F1). |
| **`Q001`** | **Unused Imports & Dead Code** | `Minor` | Unused package imports cluttering codebase and increasing attack surface. |

---

## 🖥️ Web Application Modules

The frontend is organized into 3 focused, high-performance tabs:

1. 📊 **Dashboard Tab**:
   - **0–100 Pipeline Health Index** with vulnerability count badges.
   - **ML Overoptimism Estimator** displaying apparent vs. true estimated production accuracy.
   - **Severity Distribution Donut Chart** & **Static Detection Rule Breakdown Bar Chart**.
   - **Literature Benchmark Comparison Table** (*LeakageDetector 1.0/2.0*, *mlinspect*, *Sasse et al.*).

2. ⚡ **Scanner & Live Code Editor**:
   - **Direct File Ingestion**: Drop or select any `.py`, `.ipynb`, or `.zip` file — contents immediately load into the Live Editor.
   - **Groq API Key Config**: Persistent `localStorage` storage for instant sub-second inference with **GPT-OSS 120B**.
   - **Live Terminal AST Stream Log**: Real-time trace of parsing, dataflow boundary traversal, and model scoring events.

3. 🔍 **Auditor & DAG Diagnostic Center**:
   - **Line-by-Line Code Inspector**: Color-coded line highlights (rose for Critical, amber for Major, sky for Minor) with inline bug callouts.
   - **Dataflow Graph Visualizer**: 5-node pipeline DAG showing where data leaked across the partition boundary.
   - **Jupyter Notebook Cell Inspector**: Detailed cell execution dependency viewer.
   - **AI Quick-Fix Modal**: Side-by-side diff view comparing faulty code (`-`) with clean, remediated code (`+`).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**

### One-Command Startup
To start both the FastAPI backend and the Vite React frontend simultaneously:

```bash
chmod +x start_dev.sh
./start_dev.sh
```

---

### Manual Setup

#### 1. Backend Setup
```bash
# Create and activate virtual environment (optional)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (Port 8000)
python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be accessible at: `http://127.0.0.1:8000` (Swagger docs: `http://127.0.0.1:8000/docs`).

#### 2. Frontend Setup
```bash
cd frontend

# Install node dependencies
npm install

# Start Vite dev server (Port 3000)
npm run dev -- --port 3000
```
Frontend web interface will be accessible at: `http://localhost:3000`.

---

## ⚡ Groq AI Engine Configuration

LeakageLens supports sub-second AI patch generation using Groq's high-speed LPU infrastructure:

1. Get a free API key at [console.groq.com](https://console.groq.com/keys).
2. Enter your key in the **Groq API Key** input box in the **Scanner & Editor** tab.
3. The key is securely saved in your browser's `localStorage` (`leakagelens_groq_key`).
4. Default primary model: `openai/gpt-oss-120b` (with automatic fallback to `llama-3.3-70b-versatile` and `llama-3.1-8b-instant`).

*Note: If no Groq API Key is provided, LeakageLens uses local deterministic rule heuristics so scanning works completely offline.*

---

## 💻 CLI & API Usage

### Running via CLI
```bash
# Audit a Python file or directory
python3 -m leakagelens.main audit sample_projects/customer_churn_pipeline.py

# Export audit to Markdown
python3 -m leakagelens.main audit sample_projects/customer_churn_pipeline.py --format markdown --output audit_report.md
```

### Running Backend REST API Directly
```bash
# Scan a live code snippet
curl -X POST http://127.0.0.1:8000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"code": "from sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\nX_s = scaler.fit_transform(X)", "filename": "script.py"}'
```

---

## 📁 Project Structure

```
LeakageLens/
├── backend/                        # FastAPI Backend Application
│   ├── main.py                     # API route handlers (/scan, /scan-file, /history)
│   ├── analyzer.py                 # Multi-rule execution & model inference coordinator
│   └── uploads/                    # Temporary storage for uploaded file scans
│
├── frontend/                       # React 19 + Tailwind CSS v4 Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/Navbar.jsx   # Top navigation header & status pills
│   │   │   ├── dashboard/          # Scorecard, charts & benchmark comparison
│   │   │   ├── scanner/            # Live editor, dropzone & Groq key config
│   │   │   ├── auditor/            # Line inspector, DAG visualizer, fix diff modal
│   │   │   ├── common/             # ErrorBoundary & shared wrappers
│   │   │   └── ui/                 # Minimalist shadcn/ui primitives (Button, Card, Badge, Modal)
│   │   ├── services/api.js         # Backend API adapter & Groq direct client
│   │   ├── utils/sampleData.js     # Literature benchmarks & sample models
│   │   ├── App.jsx                 # Root application state & tab switcher
│   │   └── main.jsx                # React DOM entry point
│   ├── vite.config.js              # Vite bundler configuration
│   └── package.json
│
├── leakagelens/                    # Core Python Static Analysis Engine
│   ├── core/                       # AST ingestion, normalization & context builder
│   ├── rules/                      # 10+ deterministic static detection rules
│   ├── ml/                         # Trained ML leakage model & feature extractor
│   ├── ai/                         # Groq recommendation engine & prompt templates
│   └── reporting/                  # Scorer & Markdown/JSON report generators
│
├── sample_projects/                # Real-world benchmark & testing pipelines
│   ├── customer_churn_pipeline.py  # Production clean ML pipeline script
│   └── customer_churn_analysis.ipynb # Production clean Jupyter notebook
│
├── start_dev.sh                    # Unified one-command dev startup script
├── requirements.txt                # Python backend dependencies
└── README.md                       # Project documentation
```

---

## 👥 Academic Context & Authors

**LeakageLens** is developed by:
- **Amey Chandraprakash Zode**
- **Yedhukrishna Vijayan**
- **Aditya Prakash Pulipati**
- **Pranav Vinayak Tahsildar**
- **Prof. Priyanka P. Sherkhane**

*Department of Computer Engineering, Pillai College of Engineering, New Panvel, Maharashtra, India.*

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
