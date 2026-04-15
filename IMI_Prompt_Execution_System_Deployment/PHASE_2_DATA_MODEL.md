# PHASE 2 — Data Model (JSON Schema)

## 1) JSON Schema Definition

The complete schema is defined in:

- `prompt-system.schema.json`

It is JSON Schema Draft 2020-12 and enforces all required prompt fields:

- `id`
- `title`
- `category`
- `subcategory`
- `department`
- `npd_stage`
- `use_case`
- `output_type`
- `complexity`
- `time_to_execute`
- `confidence`
- `value`
- `purpose`
- `prompt`
- `variables` (array of objects with `name`, `description`, `example`)
- `expected_output`
- `coaching_notes`
- `failure_modes` (array)
- `follow_up_prompts` (array)

---

## 2) Example Object (Valid Against Schema)

```json
{
  "id": "prm_imi_magnetic_lift_risk_assessment",
  "title": "Magnetic Lift Retrofit Risk Assessment",
  "category": "NPD",
  "subcategory": "Concept Evaluation",
  "department": "Engineering",
  "npd_stage": "Define",
  "use_case": "Evaluate technical and operational risk before committing to a custom magnetic lift retrofit program.",
  "output_type": "Risk Register",
  "complexity": "L3",
  "time_to_execute": 35,
  "confidence": 4,
  "value": 5,
  "purpose": "Create a decision-grade risk register that allows engineering and manufacturing to identify constraints early, define mitigations, and prevent late-stage redesign churn.",
  "prompt": "You are an IMI engineering analyst. Build a structured risk register for the proposed retrofit using: customer process data, part geometry, duty cycle, environmental constraints, and safety requirements. Return ranked risks with severity, occurrence, detection, and mitigation owner.\n\nInputs:\n- Product family: {{product_family}}\n- Application: {{application_context}}\n- Lift target: {{lift_mass_kg}} kg\n- Throughput: {{throughput_per_hour}} parts/hr\n- Environmental factors: {{environmental_factors}}\n- Existing failure history: {{historical_failures}}\n\nOutput constraints:\n1) Include at least 12 risks\n2) Group by mechanical, magnetic, electrical, controls, operator, compliance\n3) Provide mitigation sequence by implementation priority\n4) Flag unknowns requiring data collection",
  "variables": [
    {
      "name": "product_family",
      "description": "IMI product family or magnetic subsystem being evaluated.",
      "example": "Permanent Lift Magnets - Retrofit Series"
    },
    {
      "name": "application_context",
      "description": "Process context where system will operate.",
      "example": "Stamping line blank transfer between press stages"
    },
    {
      "name": "lift_mass_kg",
      "description": "Required lift mass in kilograms at nominal operation.",
      "example": "185"
    },
    {
      "name": "throughput_per_hour",
      "description": "Required production throughput in parts per hour.",
      "example": "420"
    },
    {
      "name": "environmental_factors",
      "description": "Relevant shop-floor conditions affecting performance.",
      "example": "Oil mist, abrasive fines, 38C ambient, washdown every shift"
    },
    {
      "name": "historical_failures",
      "description": "Known failure events from prior installs or similar systems.",
      "example": "Dropped part during peak heat cycle, intermittent sensor drift"
    }
  ],
  "expected_output": "A risk register table with columns: risk_id, category, description, severity(1-10), occurrence(1-10), detection(1-10), RPN, mitigation, owner, verification_method, due_phase.",
  "coaching_notes": "Prioritize concrete engineering mechanisms over generic risks. If data is missing, mark the uncertainty explicitly and define a data-collection action tied to a phase owner.",
  "failure_modes": [
    "Risks are listed without quantification or ranking.",
    "Mitigations are generic and not tied to owners.",
    "Unknowns are omitted, creating false confidence.",
    "Compliance and operator safety risks are under-scoped."
  ],
  "follow_up_prompts": [
    "Convert top 5 risks into a validation test plan with pass/fail criteria.",
    "Generate a mitigation implementation schedule by NPD stage.",
    "Draft an executive decision memo summarizing go/no-go criteria."
  ]
}
```

---

## 3) Validation Rules

### 3.1 Structural Rules

1. Prompt objects MUST contain all required fields listed above.
2. Unknown fields are rejected (`additionalProperties: false`).
3. `variables` MUST be an array of objects with:
   - `name`
   - `description`
   - `example`
4. `failure_modes` and `follow_up_prompts` MUST be non-empty arrays of strings.

### 3.2 Type and Constraint Rules

1. `id` must match: `^prm_[a-z0-9]+(?:_[a-z0-9]+)*$`
2. `complexity` is restricted to: `L1 | L2 | L3 | L4`
3. `time_to_execute` must be integer minutes in range `1..240`
4. `confidence` and `value` must be integer scores in range `1..5`
5. Categorical fields (`category`, `department`, `npd_stage`, `output_type`) are enum constrained.
6. Long-form text fields enforce min/max lengths for data quality consistency.
7. Variable `name` must match: `^[a-z][a-z0-9_]{1,62}$`

### 3.3 Operational Validation Rules (Recommended)

These should be checked in application logic in addition to JSON Schema:

1. `id` must be globally unique in the prompt catalog.
2. Variable names should be unique within each prompt (no duplicate semantic inputs).
3. Placeholder tokens used in `prompt` (e.g. `{{variable_name}}`) should resolve to declared `variables[].name`.
4. `npd_stage` should be compatible with the prompt's category workflow.
5. `coaching_notes` should include at least one quality-control instruction.

