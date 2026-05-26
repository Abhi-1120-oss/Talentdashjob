/**
 * TalentDash Web Client — full interactive UI
 */
const API_BASE = window.location.origin;

const state = {
  view: "browse",
  page: 1,
  companyPage: 1,
  loading: false,
  lastSalaryData: null,
};

const $ = (id) => document.getElementById(id);

// ——— Utilities ———

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatLpa(lpa) {
  return `${Number(lpa).toFixed(1)} LPA`;
}

function formatInr(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function parseApiError(err, fallback) {
  if (!err) return fallback;
  if (typeof err.detail === "string") return err.detail;
  if (Array.isArray(err.detail)) return err.detail.map((d) => d.msg || d).join(", ");
  return fallback;
}

function showToast(msg, type = "info") {
  const el = $("toast");
  el.textContent = msg;
  el.className = `toast toast-${type}`;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => el.classList.add("hidden"), 3500);
}

function setLoading(panel, on) {
  const map = {
    browse: "loading",
    companies: "companyLoading",
    stats: "statsLoading",
  };
  const el = $(map[panel]);
  if (el) el.classList.toggle("hidden", !on);
  state.loading = on;
  $("searchBtn").disabled = on;
  $("clearBtn").disabled = on;
  $("refreshBtn").disabled = on;
}

// ——— API ———

async function api(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
  });
  let body = {};
  try {
    body = await res.json();
  } catch (_) {}
  if (!res.ok) {
    throw new Error(parseApiError(body, `Request failed (${res.status})`));
  }
  return body;
}

async function loadHealthStatus() {
  try {
    const h = await api("/health");
    const el = $("dbStatus");
    if (h.database?.includes("mock")) {
      el.textContent = "Demo data";
      el.className = "db-status demo";
    } else if (h.database === "ok") {
      el.textContent = `${h.record_count ?? 0} records`;
      el.className = "db-status live";
    } else {
      el.textContent = "DB offline";
      el.className = "db-status warn";
    }
  } catch (_) {
    $("dbStatus").textContent = "Offline";
  }
}

// ——— Render ———

function renderSalaryCard(item) {
  return `
    <article class="salary-card clickable" data-id="${escapeHtml(item.id)}" tabindex="0" role="button" aria-label="View ${escapeHtml(item.company)} salary details">
      <div class="card-top">
        <h3>${escapeHtml(item.company)}</h3>
        <span class="level-pill">${escapeHtml(item.level)}</span>
      </div>
      <p class="role">${escapeHtml(item.role)}</p>
      <p class="comp">${formatLpa(item.total_compensation_lpa)}</p>
      <p class="sub-comp">${formatInr(item.total_compensation_inr)} total</p>
      <div class="meta">
        <span class="badge">📍 ${escapeHtml(item.location)}</span>
        <span class="badge">${escapeHtml(item.experience_years)} yrs</span>
        <span class="badge">${Math.round(item.confidence_score * 100)}% conf</span>
        <span class="badge">${escapeHtml(item.source)}</span>
      </div>
    </article>
  `;
}

function renderCompanyCard(item) {
  const roles = (item.top_roles || []).map(escapeHtml).join(", ");
  return `
    <article class="salary-card company-card clickable" data-company="${escapeHtml(item.company)}" tabindex="0" role="button" aria-label="View ${escapeHtml(item.company)} salaries">
      <h3>${escapeHtml(item.company)}</h3>
      <p class="comp">${formatLpa(item.avg_total_lpa)} <span class="avg-label">avg</span></p>
      <div class="meta">
        <span class="badge">${item.record_count} records</span>
        <span class="badge">${item.min_total_lpa}–${item.max_total_lpa} LPA range</span>
      </div>
      <p class="role">${roles || "—"}</p>
      <span class="card-cta">View salaries →</span>
    </article>
  `;
}

function renderPagination(containerId, meta, onPage) {
  const el = $(containerId);
  if (!meta || meta.total_pages <= 1) {
    el.classList.add("hidden");
    el.innerHTML = "";
    return;
  }
  el.classList.remove("hidden");
  el.innerHTML = `
    <button type="button" class="page-btn" data-page="${meta.page - 1}" ${!meta.has_prev ? "disabled" : ""}>← Prev</button>
    <span class="page-info">Page ${meta.page} of ${meta.total_pages} · ${meta.total} total</span>
    <button type="button" class="page-btn" data-page="${meta.page + 1}" ${!meta.has_next ? "disabled" : ""}>Next →</button>
  `;
  el.querySelectorAll(".page-btn:not([disabled])").forEach((btn) => {
    btn.addEventListener("click", () => onPage(Number(btn.dataset.page)));
  });
}

function renderQuickStats(meta) {
  const bar = $("quickStats");
  if (!meta) {
    bar.classList.add("hidden");
    return;
  }
  bar.classList.remove("hidden");
  bar.innerHTML = `
    <div class="stat-item"><div class="val">${meta.total}</div><div class="lbl">Results</div></div>
    <div class="stat-item"><div class="val">${meta.page}</div><div class="lbl">Page</div></div>
    <div class="stat-item"><div class="val">${meta.total_pages}</div><div class="lbl">Pages</div></div>
  `;
}

function openSalaryModal(item) {
  $("modalTitle")?.remove();
  $("modalBody").innerHTML = `
    <h2 id="modalTitle" class="modal-title">${escapeHtml(item.company)}</h2>
    <p class="modal-sub">${escapeHtml(item.role)} · ${escapeHtml(item.level)}</p>
    <div class="modal-highlight">${formatLpa(item.total_compensation_lpa)}</div>
    <dl class="detail-list">
      <dt>Total (INR)</dt><dd>${formatInr(item.total_compensation_inr)}</dd>
      <dt>Base</dt><dd>${formatInr(item.base_salary_inr)} (${formatLpa(item.base_salary_lpa)})</dd>
      <dt>Bonus</dt><dd>${formatInr(item.bonus_inr)}</dd>
      <dt>Stock</dt><dd>${formatInr(item.stock_inr)}</dd>
      <dt>Location</dt><dd>${escapeHtml(item.location)}</dd>
      <dt>Experience</dt><dd>${escapeHtml(item.experience_years)} years</dd>
      <dt>Confidence</dt><dd>${Math.round(item.confidence_score * 100)}%</dd>
      <dt>Source</dt><dd>${escapeHtml(item.source)}</dd>
    </dl>
    ${item.source_url ? `<a class="btn secondary full-width" href="${escapeHtml(item.source_url)}" target="_blank" rel="noopener">View source</a>` : ""}
  `;
  $("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  $("modal").classList.add("hidden");
  document.body.style.overflow = "";
}

// ——— Data loaders ———

async function loadFilters() {
  try {
    const f = await api("/api/v1/filters");
    const loc = $("location");
    const lvl = $("level");
    f.locations.forEach((l) => {
      const o = document.createElement("option");
      o.value = l;
      o.textContent = l;
      loc.appendChild(o);
    });
    f.levels.forEach((l) => {
      const o = document.createElement("option");
      o.value = l;
      o.textContent = l;
      lvl.appendChild(o);
    });
  } catch (e) {
    console.warn("filters load failed", e);
  }
}

function getSearchParams(page = 1) {
  const params = new URLSearchParams({ page: String(page), page_size: "20" });
  const company = $("company").value.trim();
  const role = $("role").value.trim();
  const location = $("location").value;
  const level = $("level").value;
  const sort = $("sort").value;
  if (company) params.set("company", company);
  if (role) params.set("role", role);
  if (location) params.set("location", location);
  if (level) params.set("level", level);
  if (sort) params.set("sort", sort);
  return params;
}

async function searchSalaries(page = 1) {
  state.page = page;
  $("error").classList.add("hidden");
  $("results").innerHTML = "";
  setLoading("browse", true);

  try {
    const data = await api(`/api/v1/salaries?${getSearchParams(page)}`);
    state.lastSalaryData = data;
    setLoading("browse", false);

    if (!data.data?.length) {
      $("results").innerHTML = `
        <div class="empty-state">
          <p>No salaries match your filters.</p>
          <button type="button" class="btn secondary" id="emptyClearBtn">Clear filters</button>
        </div>`;
      $("emptyClearBtn")?.addEventListener("click", clearFilters);
      $("pagination").classList.add("hidden");
      renderQuickStats({ total: 0, page: 1, total_pages: 1 });
      return;
    }

    $("results").innerHTML = data.data.map(renderSalaryCard).join("");
    renderQuickStats(data.meta);
    renderPagination("pagination", data.meta, searchSalaries);

    $("results").querySelectorAll(".salary-card.clickable").forEach((card) => {
      const id = card.dataset.id;
      const item = data.data.find((r) => r.id === id);
      const open = () => item && openSalaryModal(item);
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    });
  } catch (e) {
    setLoading("browse", false);
    $("error").classList.remove("hidden");
    $("error").textContent = e.message;
    showToast(e.message, "error");
  }
}

async function loadCompanies(page = 1) {
  state.companyPage = page;
  $("companyError").classList.add("hidden");
  $("companyList").innerHTML = "";
  setLoading("companies", true);

  try {
    const data = await api(`/api/v1/companies?page=${page}&page_size=20`);
    setLoading("companies", false);

    if (!data.data?.length) {
      $("companyList").innerHTML = `<div class="empty-state"><p>No company data yet.</p></div>`;
      $("companyPagination").classList.add("hidden");
      return;
    }

    $("companyList").innerHTML = data.data.map(renderCompanyCard).join("");
    renderPagination("companyPagination", data.meta, loadCompanies);

    $("companyList").querySelectorAll(".company-card").forEach((card) => {
      const company = card.dataset.company;
      const go = () => {
        $("company").value = company;
        setView("browse");
        searchSalaries(1);
        showToast(`Showing salaries for ${company}`, "info");
      };
      card.addEventListener("click", go);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      });
    });
  } catch (e) {
    setLoading("companies", false);
    $("companyError").classList.remove("hidden");
    $("companyError").textContent = e.message;
    showToast(e.message, "error");
  }
}

async function loadStats() {
  $("statsError").classList.add("hidden");
  $("platformStats").innerHTML = "";
  $("locationBreakdown").classList.add("hidden");
  setLoading("stats", true);

  try {
    const s = await api("/api/v1/stats");
    setLoading("stats", false);

    const sources = Object.entries(s.records_by_source || {})
      .map(([k, v]) => `<span class="badge">${escapeHtml(k)}: ${v}</span>`)
      .join("");

    $("platformStats").innerHTML = `
      <div class="stats-bar">
        <div class="stat-item"><div class="val">${s.total_records}</div><div class="lbl">Records</div></div>
        <div class="stat-item"><div class="val">${s.total_companies}</div><div class="lbl">Companies</div></div>
        <div class="stat-item"><div class="val">${Math.round((s.avg_confidence || 0) * 100)}%</div><div class="lbl">Confidence</div></div>
      </div>
      <h3 class="section-label">By source</h3>
      <div class="meta">${sources || "<span class='badge'>—</span>"}</div>
    `;

    const locs = Object.entries(s.records_by_location || {});
    if (locs.length) {
      $("locationBreakdown").classList.remove("hidden");
      $("locationBreakdown").innerHTML = `
        <h3>Top locations</h3>
        <ul class="location-list">
          ${locs.map(([loc, n]) => `<li><span>${escapeHtml(loc)}</span><strong>${n}</strong></li>`).join("")}
        </ul>
      `;
    }
  } catch (e) {
    setLoading("stats", false);
    $("statsError").classList.remove("hidden");
    $("statsError").textContent = e.message;
    showToast(e.message, "error");
  }
}

// ——— View & actions ———

function setView(view) {
  state.view = view;

  document.querySelectorAll(".tab-item").forEach((tab) => {
    const active = tab.dataset.view === view;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });

  $("browseView").classList.toggle("hidden", view !== "browse");
  $("companiesView").classList.toggle("hidden", view !== "companies");
  $("statsView").classList.toggle("hidden", view !== "stats");

  if (view === "browse" && !$("results").children.length) searchSalaries(1);
  if (view === "companies") loadCompanies(1);
  if (view === "stats") loadStats();
}

function clearFilters() {
  $("searchForm").reset();
  $("location").selectedIndex = 0;
  $("level").selectedIndex = 0;
  searchSalaries(1);
  showToast("Filters cleared", "info");
}

function refreshCurrentView() {
  loadHealthStatus();
  if (state.view === "browse") searchSalaries(state.page);
  else if (state.view === "companies") loadCompanies(state.companyPage);
  else loadStats();
  showToast("Refreshed", "info");
}

// ——— Event bindings ———

$("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  searchSalaries(1);
});

$("clearBtn").addEventListener("click", clearFilters);
$("refreshBtn").addEventListener("click", refreshCurrentView);

document.querySelectorAll(".tab-item").forEach((tab) => {
  tab.addEventListener("click", () => setView(tab.dataset.view));
});

document.querySelectorAll("[data-action='close-modal']").forEach((el) => {
  el.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$("modal").classList.contains("hidden")) closeModal();
});

// ——— Init ———
loadHealthStatus();
loadFilters();
searchSalaries(1);
