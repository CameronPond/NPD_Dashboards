(function () {
  const STORAGE_KEY = 'imi.promptExecution.sessionState.v1';
  const library = window.IMI_PROMPT_LIBRARY || {};
  const prompts = Array.isArray(library.prompts) ? library.prompts : [];
  const categories = Array.isArray(library.categories) ? library.categories : [];

  const state = {
    activeCategory: null,
    filters: {
      search: '',
      department: '',
      npd_stage: '',
      complexity: '',
      value: '',
      confidence: ''
    },
    selectedPromptId: null,
    visiblePromptIds: []
  };

  const els = {
    categoryGrid: document.getElementById('categoryGrid'),
    matrixBody: document.getElementById('matrixBody'),
    detailPanel: document.getElementById('detailPanel'),
    matrixSummary: document.getElementById('matrixSummary'),
    telemetryTotal: document.getElementById('telemetryTotal'),
    telemetryVisible: document.getElementById('telemetryVisible'),
    telemetryStatus: document.getElementById('telemetryStatus'),
    searchInput: document.getElementById('searchInput'),
    departmentFilter: document.getElementById('departmentFilter'),
    stageFilter: document.getElementById('stageFilter'),
    complexityFilter: document.getElementById('complexityFilter'),
    valueFilter: document.getElementById('valueFilter'),
    confidenceFilter: document.getElementById('confidenceFilter'),
    clearFiltersBtn: document.getElementById('clearFiltersBtn')
  };

  function byId(id) {
    return prompts.find((p) => p.id === id) || null;
  }

  function safeText(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    return String(value);
  }

  function renderCategoryGrid() {
    const cards = categories.map((cat) => {
      const active = state.activeCategory === cat.name;
      return `
        <button class="category-card ${active ? 'active' : ''}" data-category="${cat.name}" type="button">
          <div class="category-name">${cat.name}</div>
          <div class="category-meta">${cat.count} prompts</div>
          <div class="category-desc">${cat.description}</div>
        </button>`;
    });

    const allActive = state.activeCategory === null;
    cards.unshift(`
      <button class="category-card ${allActive ? 'active' : ''}" data-category="__ALL__" type="button">
        <div class="category-name">All Categories</div>
        <div class="category-meta">${prompts.length} prompts</div>
        <div class="category-desc">Show full prompt matrix across all focus areas.</div>
      </button>`);

    els.categoryGrid.innerHTML = cards.join('');

    els.categoryGrid.querySelectorAll('.category-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = btn.getAttribute('data-category');
        if (value === '__ALL__') {
          state.activeCategory = null;
        } else if (state.activeCategory === value) {
          state.activeCategory = null;
        } else {
          state.activeCategory = value;
        }
        applyFiltersAndRender();
      });
    });
  }

  function buildSelect(selectEl, values) {
    const unique = Array.from(new Set(values.filter((v) => v !== undefined && v !== null && v !== ''))).sort((a, b) => String(a).localeCompare(String(b)));
    const options = ['<option value="">All</option>'].concat(unique.map((v) => `<option value="${String(v)}">${String(v)}</option>`));
    selectEl.innerHTML = options.join('');
  }

  function initFilters() {
    buildSelect(els.departmentFilter, prompts.map((p) => p.department));
    buildSelect(els.stageFilter, prompts.map((p) => p.npd_stage));
    buildSelect(els.complexityFilter, prompts.map((p) => p.complexity));
    buildSelect(els.valueFilter, prompts.map((p) => p.value));
    buildSelect(els.confidenceFilter, prompts.map((p) => p.confidence));

    els.searchInput.addEventListener('input', () => {
      state.filters.search = els.searchInput.value.trim().toLowerCase();
      applyFiltersAndRender();
    });

    els.departmentFilter.addEventListener('change', () => {
      state.filters.department = els.departmentFilter.value;
      applyFiltersAndRender();
    });

    els.stageFilter.addEventListener('change', () => {
      state.filters.npd_stage = els.stageFilter.value;
      applyFiltersAndRender();
    });

    els.complexityFilter.addEventListener('change', () => {
      state.filters.complexity = els.complexityFilter.value;
      applyFiltersAndRender();
    });

    els.valueFilter.addEventListener('change', () => {
      state.filters.value = els.valueFilter.value;
      applyFiltersAndRender();
    });

    els.confidenceFilter.addEventListener('change', () => {
      state.filters.confidence = els.confidenceFilter.value;
      applyFiltersAndRender();
    });

    els.clearFiltersBtn.addEventListener('click', () => {
      state.activeCategory = null;
      state.filters = {
        search: '',
        department: '',
        npd_stage: '',
        complexity: '',
        value: '',
        confidence: ''
      };
      els.searchInput.value = '';
      els.departmentFilter.value = '';
      els.stageFilter.value = '';
      els.complexityFilter.value = '';
      els.valueFilter.value = '';
      els.confidenceFilter.value = '';
      applyFiltersAndRender();
    });
  }

  function matchesSearch(prompt, query) {
    if (!query) return true;
    const blob = [
      prompt.title,
      prompt.category,
      prompt.subcategory,
      prompt.department,
      prompt.npd_stage,
      prompt.use_case,
      prompt.output_type,
      prompt.purpose,
      prompt.prompt,
      prompt.expected_output,
      prompt.coaching_notes,
      ...(prompt.failure_modes || []),
      ...(prompt.follow_up_prompts || []),
      ...((prompt.variables || []).flatMap((v) => [v.name, v.description, v.example]))
    ]
      .join(' ')
      .toLowerCase();

    return query.split(/\s+/).every((token) => blob.includes(token));
  }

  function filterPrompts() {
    return prompts.filter((p) => {
      if (state.activeCategory && p.category !== state.activeCategory) return false;
      if (state.filters.department && p.department !== state.filters.department) return false;
      if (state.filters.npd_stage && p.npd_stage !== state.filters.npd_stage) return false;
      if (state.filters.complexity && p.complexity !== state.filters.complexity) return false;
      if (state.filters.value && String(p.value) !== state.filters.value) return false;
      if (state.filters.confidence && String(p.confidence) !== state.filters.confidence) return false;
      if (!matchesSearch(p, state.filters.search)) return false;
      return true;
    });
  }

  function renderMatrix(visiblePrompts) {
    if (!visiblePrompts.length) {
      els.matrixBody.innerHTML = '<tr class="empty-row"><td colspan="10">No prompts match current filters.</td></tr>';
      return;
    }

    const rows = visiblePrompts
      .map((p) => {
        const active = p.id === state.selectedPromptId ? 'active' : '';
        return `<tr class="${active}" data-id="${p.id}">
          <td>${safeText(p.title, 'Untitled')}</td>
          <td>${safeText(p.category, '-')}</td>
          <td>${safeText(p.department, '-')}</td>
          <td>${safeText(p.npd_stage, '-')}</td>
          <td>${safeText(p.use_case, '-')}</td>
          <td>${safeText(p.output_type, '-')}</td>
          <td>${safeText(p.complexity, '-')}</td>
          <td>${safeText(p.time_to_execute, '-')} min</td>
          <td>${safeText(p.confidence, '-')}</td>
          <td>${safeText(p.value, '-')}</td>
        </tr>`;
      })
      .join('');

    els.matrixBody.innerHTML = rows;

    els.matrixBody.querySelectorAll('tr[data-id]').forEach((row) => {
      row.addEventListener('click', () => {
        state.selectedPromptId = row.getAttribute('data-id');
        renderMatrix(visiblePrompts);
        renderDetailPanel();
        persistState();
      });
    });
  }

  function renderDetailPanel() {
    const prompt = byId(state.selectedPromptId);

    if (!state.visiblePromptIds.length) {
      els.detailPanel.innerHTML = `
        <h2 class="detail-title">No Matching Prompts</h2>
        <div class="section"><p>Current filter combination yields zero records. Use <strong>Clear Filters</strong> to reset the matrix.</p></div>`;
      return;
    }

    if (!prompt) {
      els.detailPanel.innerHTML = `
        <h2 class="detail-title">Select a Prompt</h2>
        <div class="section"><p>Choose a row in the matrix to view execution details.</p></div>`;
      return;
    }

    const tags = [prompt.category, prompt.subcategory, prompt.department, prompt.npd_stage, prompt.complexity]
      .filter(Boolean)
      .map((t) => `<span class="tag">${t}</span>`)
      .join('');

    const variableItems = (prompt.variables || [])
      .map((v) => `<li><strong>${safeText(v.name, 'unnamed')}</strong> — ${safeText(v.description, 'No description')} <br/><em>Example:</em> ${safeText(v.example, '-')}</li>`)
      .join('');

    const failureItems = (prompt.failure_modes || []).map((m) => `<li>${m}</li>`).join('');
    const followUpItems = (prompt.follow_up_prompts || []).map((m) => `<li>${m}</li>`).join('');

    els.detailPanel.innerHTML = `
      <h2 class="detail-title">${safeText(prompt.title, 'Untitled Prompt')}</h2>
      <div class="tag-row">${tags}</div>

      <div class="section"><h3>Purpose</h3><p>${safeText(prompt.purpose, 'No purpose provided.')}</p></div>
      <div class="section"><h3>Prompt</h3><div class="prompt-block">${safeText(prompt.prompt, 'Template unavailable.')}</div></div>
      <div class="section"><h3>Variables</h3><ul>${variableItems || '<li>No variables defined.</li>'}</ul></div>
      <div class="section"><h3>Expected Output</h3><p>${safeText(prompt.expected_output, 'No expected output schema provided.')}</p></div>
      <div class="section"><h3>Coaching Notes</h3><p>${safeText(prompt.coaching_notes, 'No coaching notes provided.')}</p></div>
      <div class="section"><h3>Failure Modes</h3><ul>${failureItems || '<li>No failure modes documented.</li>'}</ul></div>
      <div class="section"><h3>Follow-Up Prompts</h3><ul>${followUpItems || '<li>No follow-up prompts listed.</li>'}</ul></div>
    `;
  }

  function renderTelemetry(visibleCount) {
    els.telemetryTotal.textContent = String(prompts.length);
    els.telemetryVisible.textContent = String(visibleCount);
    els.telemetryStatus.textContent = 'READY';
  }

  function persistState() {
    const snapshot = {
      activeCategory: state.activeCategory,
      filters: state.filters,
      selectedPromptId: state.selectedPromptId
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (err) {
      // No-op for restricted environments
    }
  }

  function restoreState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        state.activeCategory = parsed.activeCategory || null;
        state.filters = Object.assign(state.filters, parsed.filters || {});
        state.selectedPromptId = parsed.selectedPromptId || null;
      }
    } catch (err) {
      // fall back to defaults
    }

    els.searchInput.value = state.filters.search || '';
    els.departmentFilter.value = state.filters.department || '';
    els.stageFilter.value = state.filters.npd_stage || '';
    els.complexityFilter.value = state.filters.complexity || '';
    els.valueFilter.value = state.filters.value || '';
    els.confidenceFilter.value = state.filters.confidence || '';
  }

  function applyFiltersAndRender() {
    const visiblePrompts = filterPrompts();
    state.visiblePromptIds = visiblePrompts.map((p) => p.id);

    if (!state.visiblePromptIds.includes(state.selectedPromptId)) {
      state.selectedPromptId = state.visiblePromptIds[0] || null;
    }

    renderCategoryGrid();
    renderMatrix(visiblePrompts);
    renderDetailPanel();
    renderTelemetry(visiblePrompts.length);

    els.matrixSummary.textContent = `${visiblePrompts.length} visible of ${prompts.length}`;

    persistState();
  }

  function init() {
    initFilters();
    restoreState();
    applyFiltersAndRender();
  }

  init();
})();
