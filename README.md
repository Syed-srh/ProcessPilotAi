# ProcessPilot AI 🤖⚡

> **Core Product Thesis:** *"AI decides within boundaries. Workflows control execution. Humans control high-risk actions."*

ProcessPilot AI is an enterprise-grade **SOP-to-Workflow AI Compiler and Multi-Agent Orchestration Platform**. It automatically converts plain-text Standard Operating Procedures (SOPs), company policies, and business descriptions into executable, visual workflow graphs executed by 6 specialized autonomous AI agents with human-in-the-loop safety guardrails.

---

## 📑 Table of Contents
- [1. Project Name](#1-project-name)
- [2. Problem Statement](#2-problem-statement)
- [3. Features](#3-features)
- [4. Technology Stack](#4-technology-stack)
- [5. Screenshots](#5-screenshots)
- [6. Live Demo](#6-live-demo)
- [7. Backend](#7-backend)
- [8. Setup Instructions](#8-setup-instructions)
- [9. Environment Variables](#9-environment-variables)

---

## 1. Project Name
**ProcessPilot AI** (v1.0 MVP Production Release)

---

## 2. Problem Statement

In modern enterprises and operations teams, Standard Operating Procedures (SOPs) live in static documents (PDFs, Notion pages, Word docs). Processing everyday requests—such as customer refunds, employee onboarding, vendor approvals, or expense reimbursements—requires human operators to:
1. Manually read and interpret complex multi-step policies.
2. Manually query databases and verify customer/order eligibility.
3. Manually trigger payment APIs or webhooks.
4. Manually send confirmation emails.

This manual process is **slow, error-prone, unscalable, and lacks transparent auditability**.

### 💡 How ProcessPilot AI Solves This:
- **Instant SOP Compilation:** Turn written plain-text SOPs into structured, visual workflow graphs in seconds using an AI provider router with automatic fallback.
- **Controlled Autonomous Execution:** Deploy a team of 6 specialized AI agents (**Planner**, **Decision**, **Execution**, **Validation**, **Recovery**, **Monitoring**) to orchestrate every step.
- **Human-in-the-Loop Safeguards:** Prevent unconstrained AI actions. When a step involves high monetary risk (e.g., refunds $\ge$ ₹5,000) or low confidence, execution safely pauses and routes an interactive authorization card to a human manager's **Approvals Inbox**.
- **Real-Time Audit Telemetry:** Stream live multi-agent execution logs and reasoning traces over Socket.IO WebSockets for full enterprise transparency.

---

## 3. Features

### 🚀 Core Features
- **AI SOP-to-Workflow Compiler (`/workflows/new`):**
  - Converts natural language business SOPs into Zod-schema validated React Flow graphs.
  - Multi-tier AI Router Fallback Chain: **Google Gemini 1.5 Flash** $\rightarrow$ **Groq (llama-3.3-70b)** $\rightarrow$ **Deterministic Keyword Generator**.
- **6-Agent Orchestration Engine:**
  - 📋 **Planner Agent:** Topologically sorts workflow steps and generates execution plans with confidence scoring.
  - 🧠 **Decision Agent:** LLM-backed policy compliance evaluation.
  - ⚡ **Execution Agent:** Performs node actions (`MANUAL_TRIGGER`, `CONDITION`, `HTTP_REQUEST`, `DATABASE_QUERY`, `SEND_EMAIL`, `SCHEMA_VALIDATION`, `AI_DECISION`, `HUMAN_APPROVAL`).
  - 🛡️ **Validation Agent:** Evaluates output schema validity and triggers the **Approval Gate** rule `(threshold exceeded OR confidence < minConfidenceThreshold)`.
  - 🩺 **Recovery Agent:** Categorizes failures (`NETWORK_ERROR`, `AI_BUDGET_EXCEEDED`, `SCHEMA_MISMATCH`) with exponential backoff retries.
  - 📜 **Monitoring Agent:** Emits immutable real-time execution logs and reasoning traces to PostgreSQL.
- **Human-in-the-Loop Approvals Inbox (`/approvals`):**
  - Interactive queue for human operators to `Approve & Resume`, `Reject & Terminate`, or `Edit & Approve` paused workflow executions.
- **Interactive Visual Workflow Canvas (`/workflows/[id]`):**
  - Drag-and-drop React Flow canvas with custom nodes, node palette, property configuration drawer, and live graph validation.
- **Real-Time Audit Telemetry & Timeline (`/executions/[id]`):**
  - Live execution history and agent reasoning traces powered by Socket.IO WebSockets.
- **Dry-Run Simulation Mode (`/workflows/[id]/simulation`):**
  - Predicts workflow execution paths and approval gates without making real external API calls or database mutations.
- **Server-Side AI Budget Protection:**
  - Configurable `maxAiCalls` per execution to prevent infinite LLM loops and force-escalate with `AI_BUDGET_EXCEEDED` reason upon breach.
- **Role-Based Access Control (RBAC):**
  - Role capabilities for `ADMIN`, `OPERATOR`, and `VIEWER` with JWT authentication and bcrypt hashing (cost 12).

---

## 4. Technology Stack

### Frontend
- **Framework:** Next.js (Pages Router, React 18, TypeScript)
- **Styling:** Vanilla CSS, Tailwind CSS, Lucide React Icons
- **State Management:** Zustand
- **Workflow Canvas:** React Flow (`@xyflow/react`)
- **Real-Time Client:** Socket.IO Client
- **HTTP Client:** Axios
- **Form & Schema Validation:** React Hook Form, Zod

### Backend & Database
- **Runtime & Server:** Node.js, Express, TypeScript
- **Database ORM:** Prisma ORM
- **Database Server:** PostgreSQL (Hosted via **Supabase**)
- **Real-Time Server:** Socket.IO Engine
- **Auth & Security:** JWT (JSON Web Tokens), bcrypt (cost 12), Helmet, Cors, Express Rate Limit

### AI Services & Fallback Routing
- **Primary AI Provider:** Google Gemini API (`gemini-1.5-flash`)
- **Secondary AI Provider:** GroqCloud API (`llama-3.3-70b-versatile`)
- **Final Fallback:** Deterministic Rule-Based Keyword Compiler

---

## 5. Project includes

### 📊 1. Workflows Library & Management
*Manage, search, duplicate, and create visual workflow graphs.*

### 🎨 2. Interactive React Flow Canvas
*Drag-and-drop workflow canvas with custom node palette and configuration drawer.*   

### 📬 3. Pending Approvals Inbox (Human-in-the-Loop)
*Review paused high-risk executions with reasoning traces, threshold badges, and authorization controls.*

### 📜 4. Real-Time Multi-Agent Execution Telemetry Log
*Step-by-step agent telemetry streaming live over WebSockets.*

---

## 6. Live Demo
- **Frontend App (Vercel):** [https://processpilot-ai.vercel.app](https://processpilot-ai.vercel.app) *(Deploy URL)*

---

## 7. Backend
- **Backend API (Render):** [https://processpilot-ai.onrender.com/api](https://processpilot-ai.onrender.com/api) *(Deploy URL)*
- **API Health Endpoint:** [https://processpilot-ai.onrender.com/api/health](https://processpilot-ai.onrender.com/api/health)

---

## 8. Setup Instructions

Follow these steps to run ProcessPilot AI locally on your development machine:

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **PostgreSQL**: Local PostgreSQL instance OR a free **Supabase** database URI

### 1. Clone the Repository
```bash
git clone https://github.com/Syed-srh/ProcessPilotAi.git
cd ProcessPilotAi
```

### 2. Install Workspace Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create `.env` files for server and client (see [Section 9](#9-environment-variables)):
```bash
# Server Environment File
cp server/.env.example server/.env

# Client Environment File
cp client/.env.example client/.env
```

### 4. Sync Database Schema & Seed Demo Dataset
```bash
# Push Prisma schema to PostgreSQL database
npm run prisma:push --workspace=server

# Seed demo operator user & refund workflow
npm run seed --workspace=server
```

### 5. Run Automated Tests
```bash
npm run test --workspace=server
```

### 6. Start the Development Servers
```bash
npm run dev
```
- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)

### 7. Sign In with Seeded Demo Credentials
- **Email:** `operator@processpilot.ai`
- **Password:** `Operator123!`

---

## 9. Environment Variables

> **IMPORTANT:** Never commit raw API keys, passwords, or sensitive credentials to GitHub.

### Server Environment Variables (`server/.env`)

```env
# Server Port & Node Environment
PORT=5000
NODE_ENV=development

# Database Connections (Supabase / PostgreSQL)
# Connect to Postgres via Transaction-mode Pooler (port 6543)
DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:6543/postgres?pgbouncer=true"

# Connect to Postgres via Session-mode Pooler for Prisma DDL Migrations (port 5432)
DIRECT_URL="postgresql://<USER>:<PASSWORD>@<HOST>:5432/postgres"

# Authentication Security
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
JWT_EXPIRES_IN="7d"

# Frontend Client URL (Cors & WebSockets)
CLIENT_URL="http://localhost:3000"

# AI Provider Keys
GEMINI_API_KEY="your-google-gemini-api-key"
GROQ_API_KEY="your-groq-cloud-api-key"
```

### Client Environment Variables (`client/.env`)

```env
# Public Backend API Gateway URL
NEXT_PUBLIC_API_URL="http://localhost:5000/api"

# Public WebSocket Gateway URL
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
```

---

## 📄 License
This project is licensed under the **MIT License**.
