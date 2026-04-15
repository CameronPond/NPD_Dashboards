# IMI Prompt Execution System

## 1. Full Layout Specification

### 1.1 Purpose
The interface is designed as a command surface for structured AI prompt execution inside Industrial Magnetics Incorporated. It is optimized for:

- rapid task selection
- fast prompt retrieval
- consistent output quality
- low-ambiguity prompt packaging
- dense technical information display

This is intentionally not a browse-heavy dashboard. The system is tuned for direct action.

### 1.2 Layout Order
Top to bottom, the interface is organized as:

1. **Telemetry Header** (fixed)
2. **Category Card Grid**
3. **Filter Strip**
4. **Prompt Matrix**
5. **Right-Side Detail Panel**

### 1.3 Telemetry Header
Fixed-height command header with three functional bands:

- **System identity block**
  - system name
  - sub-label
  - company identity
- **Telemetry strip**
  - total prompt count
  - filtered prompt count
  - active filter count
- **Status block**
  - system status
  - selected prompt readiness state
  - live clock

Design intent:

- stay visible at all times
- confirm current system state without scrolling
- preserve orientation during filtering and row selection

### 1.4 Category Card Grid
Dense horizontal card grid directly below the header.

Each card contains:

- category name
- prompt count
- single-line or short description

Behavior:

- click card to activate category filter
- active card receives visual emphasis
- counts recalculate based on all non-category filters
- includes an “All Active Domains” aggregate card

### 1.5 Filter Strip
Single dense strip under the category cards.

Controls:

- search
- department
- NPD stage
- complexity
- value
- confidence
- reset filters

Behavior:

- instant client-side filtering
- no page reload
- no modal workflow
- state remains synchronized with matrix and detail panel

### 1.6 Prompt Matrix
Primary operational surface.

Columns:

- Title
- Category
- Department
- NPD Stage
- Use Case
- Output Type
- Complexity
- Time
- Confidence
- Value

Design characteristics:

- compact row density (~32px)
- sticky header row
- monospace metadata cells
- score cells use immediate color coding
- row click drives detail panel
- selected row stays visually anchored

### 1.7 Right-Side Detail Panel
Persistent detail surface for the current selection.

Sections:

1. **Title and tags**
2. **Purpose**
3. **Selection telemetry**
4. **Prompt body** (monospace)
5. **Variables**
6. **Expected output**
7. **Coaching notes**
8. **Failure modes**
9. **Follow-up prompts**
10. **Scalable architecture note**

Action controls:

- copy prompt
- copy prompt package

Purpose:

- keep execution context visible
- package prompts cleanly for downstream AI use
- reduce dependence on memory or side conversations

### 1.8 Visual System
Style constraints applied:

- dark theme
- amber primary accent
- thin borders
- low-motion interaction
- monospace for telemetry, matrix metadata, and prompt content
- functional density over decoration

---

## 2. Component Structure

### 2.1 Top-Level Component Tree

```text
App
├── TelemetryHeader
│   ├── SystemIdentity
│   ├── TelemetryStrip
│   └── StatusBlock
├── Workspace
│   ├── ContentColumn
│   │   ├── CategoryGrid
│   │   ├── FilterStrip
│   │   └── PromptMatrix
│   └── DetailPanel
│       ├── PromptOverviewCard
│       ├── SelectionTelemetryCard
│       ├── PromptBodyCard
│       ├── VariablesCard
│       ├── ExpectedOutputCard
│       ├── CoachingNotesCard
│       ├── FailureModesCard
│       ├── FollowUpsCard
│       └── ArchitectureCard
```

### 2.2 Component Responsibilities

#### TelemetryHeader
- exposes system-level state
- stays fixed during scroll
- summarizes prompt volume and filter activity

#### CategoryGrid
- provides first-level narrowing by work domain
- exposes category counts tied to current filter base

#### FilterStrip
- controls all active search and segmentation logic
- updates state in real time

#### PromptMatrix
- displays the current filtered execution catalog
- supports selection and rapid scanning

#### DetailPanel
- renders the selected prompt package
- acts as the execution handoff surface

---

## 3. UI Hierarchy

```text
Prompt Execution System
├── Header
│   ├── Company Eyebrow
│   ├── System Name
│   ├── System Sub-Label
│   ├── Prompt Count
│   ├── Filter Count
│   ├── Status
│   └── Clock
├── Left Content Stack
│   ├── Category Card Grid
│   │   ├── All Active Domains
│   │   ├── NPD Decision Support
│   │   ├── Sales Engineering
│   │   ├── Product Management
│   │   ├── Manufacturing Readiness
│   │   ├── Competitive Intelligence
│   │   └── Application Engineering
│   ├── Filter Strip
│   │   ├── Search
│   │   ├── Department
│   │   ├── NPD Stage
│   │   ├── Complexity
│   │   ├── Value
│   │   ├── Confidence
│   │   └── Reset Filters
│   └── Prompt Matrix
│       ├── Sticky Table Header
│       └── Dense Prompt Rows
└── Right Detail Stack
    ├── Title + Tags + Purpose + Actions
    ├── Prompt Metadata
    ├── Prompt Body
    ├── Variables
    ├── Expected Output
    ├── Coaching Notes
    ├── Failure Modes
    ├── Follow-Up Prompts
    └── Architecture Notes
```

---

## 4. Structured Data Model

### 4.1 Root Model

```ts
type SystemModel = {
  meta: {
    systemName: string;
    subLabel: string;
    organization: string;
    version: string;
  };
  schema: {
    category: Category;
    prompt: PromptDefinition;
  };
  categories: Category[];
  prompts: PromptDefinition[];
};
```

### 4.2 Category Schema

```ts
type Category = {
  id: string;
  name: string;
  description: string;
  accent: string;
};
```

### 4.3 Prompt Schema

```ts
type PromptDefinition = {
  id: string;
  title: string;
  categoryId: string;
  department: string;
  npdStage: string;
  useCase: string;
  outputType: string;
  complexity: "Low" | "Medium" | "High";
  estimatedTime: string;
  confidence: number; // 1-5
  value: number; // 1-5
  tags: string[];
  purpose: string;
  prompt: string;
  variables: PromptVariable[];
  expectedOutput: string[];
  coachingNotes: string[];
  failureModes: string[];
  followUpPrompts: string[];
};

type PromptVariable = {
  name: string;
  type: string;
  required: boolean;
  note: string;
};
```

### 4.4 Interaction State

```ts
type ViewState = {
  activeCategory: string;   // "all" or category id
  search: string;
  department: string;       // "All" or department value
  stage: string;            // "All" or stage value
  complexity: string;       // "All" or complexity value
  minValue: number;         // 0, 3, 4, 5
  minConfidence: number;    // 0, 3, 4, 5
  selectedPromptId: string;
};
```

---

## 5. Interaction Logic

### 5.1 Category Selection
- selecting a category narrows the matrix to one domain
- category counts remain based on the current non-category filter stack
- selecting “all” clears only the category constraint

### 5.2 Search
- performs immediate text match across:
  - title
  - use case
  - output type
  - purpose
  - department
  - stage
  - category

### 5.3 Filter Stack
All filters run on the client and combine as intersection logic:

```text
search
AND department
AND stage
AND complexity
AND min value
AND min confidence
AND category
```

### 5.4 Selection Management
- current row selection persists when possible
- if a filter removes the selected row, selection moves to the first visible row
- if no row remains, the detail panel displays an empty state

### 5.5 Telemetry Updates
On every render cycle, the interface recalculates:

- visible prompt count
- filtered row count
- active filter count
- selection state message

### 5.6 Prompt Export
Two copy paths are supported:

1. **Copy Prompt**
   - copies only the raw prompt body
2. **Copy Package**
   - copies title
   - metadata
   - purpose
   - prompt body
   - variable schema

This supports fast transfer into external AI systems or future internal orchestration layers.

---

## 6. Scalable Architecture

### 6.1 Current Architecture
The delivered version is a static single-file interface with an embedded catalog and local state.

Logical layers:

```text
Catalog Layer
→ State Layer
→ Filter Engine
→ Render Layer
→ Prompt Export Layer
```

### 6.2 Scaling Path

#### Catalog Externalization
Prompt and category objects can move from embedded JavaScript into:

- versioned JSON files
- internal REST endpoints
- product data services
- admin-managed prompt registries

#### State Management Upgrade
The current state object can be replaced by:

- a dedicated store
- URL-synchronized state
- user profile persistence
- role-based prompt visibility logic

#### Execution Integration
Copy actions can evolve into:

- direct AI service dispatch
- prompt run logging
- variable form completion workflows
- saved execution history
- approval workflows for controlled prompts

#### Governance Layer
The prompt schema supports future additions such as:

- owner
- revision
- approved status
- last validated date
- restricted audience
- linked templates
- linked evidence sources

---

## 7. Outcome

This system provides:

- a dense UI layout optimized for engineering speed
- a formal component structure
- a clear UI hierarchy
- a structured prompt data model
- deterministic interaction logic
- a scalable architecture path for future internal tooling
