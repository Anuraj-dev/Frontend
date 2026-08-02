<template>
  <section class="section rs" style="background: var(--bg2)" id="levelPicker">
    <div class="container">
      <div class="sc-layout">
        <!-- LEFT: Level cards (vertical sidebar) -->
        <div class="sc-sidebar">
          <div class="sc-sidebar-hdr">
            <div class="section-tag" style="margin-bottom: 0">Choose Level</div>
          </div>
          <div class="sc-sidebar-cards">
            <div
              v-for="level in levelMeta"
              :key="level.key"
              class="sc-sidebar-card"
              :class="{ active: currentLevel === level.key }"
              @click="loadLevel(level.key)">
              <div class="sc-sidebar-card-top">
                <span class="sc-sidebar-emoji">{{ level.emoji }}</span>
                <div class="sc-sidebar-meta">
                  <h3 class="sc-card-title">{{ level.title }}</h3>
                  <p class="sc-card-desc">{{ level.description }}</p>
                </div>
              </div>
              <div class="sc-card-stats">
                <span class="sc-stat-badge"
                  >{{ (scData[level.key] || []).length }} subjects</span
                >
                <span class="sc-stat-badge">Notes + PYQs</span>
              </div>
              <div class="sc-sidebar-arrow">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Content panel -->
        <div class="sc-panel-wrap">
          <!-- Search + tabs always visible -->
          <div class="sc-panel-search">
            <div class="sc-search-input-wrap">
              <input
                v-model="search"
                type="text"
                placeholder="Search subjects, notes, PYQs..."
                class="form-input sc-mid-search-input" />
              <svg
                class="sc-mid-search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </div>

          <!-- Empty state: no level selected -->
          <div v-if="!currentLevel" class="sc-panel-empty">
            <div style="font-size: 3rem; margin-bottom: 1rem">📚</div>
            <p style="font-size: 1rem; color: var(--text2)">
              Select a level on the left to browse subjects
            </p>
          </div>

          <!-- Level selected: subjects + resources -->
          <template v-else>
            <div class="sc-panel-body">
              <!-- Subject strip -->
              <div class="sc-subject-strip" id="scSubjectStrip">
                <div class="sc-strip-header">
                  <span class="sc-strip-label"
                    >{{ currentLevelLabel }} — Subjects</span
                  >
                  <button class="sc-back-btn" @click="resetLevel">
                    &larr; Clear
                  </button>
                </div>
                <div class="sc-badges-row" id="scSubjectList">
                  <button
                    v-for="subject in filteredSubjects"
                    :key="subject.code"
                    class="sc-subj-badge"
                    :class="{ active: currentSubject?.code === subject.code }"
                    @click="selectSubject(subject)">
                    {{ subject.subject }}
                  </button>
                </div>
              </div>

              <!-- Resource panel -->
              <div class="sc-resource-panel" id="scPanel">
                <template v-if="currentSubject">
                  <div style="margin-bottom: 0.25rem">
                    <div class="section-tag" style="margin-bottom: 0.5rem">
                      {{ currentSubject.code }}
                    </div>
                    <p
                      style="
                        font-size: 0.8rem;
                        color: var(--text3);
                        letter-spacing: 0.03em;
                      ">
                      {{ currentSubject.description }}
                    </p>
                  </div>

                  <div class="sc-tab-bar">
                    <button
                      class="sc-tab"
                      :class="{ active: currentResourceType === 'lectures' }"
                      @click="currentResourceType = 'lectures'">
                      📺 Lectures
                    </button>
                    <button
                      class="sc-tab"
                      :class="{ active: currentResourceType === 'notes' }"
                      @click="currentResourceType = 'notes'">
                      📝 Notes
                    </button>
                    <button
                      class="sc-tab"
                      :class="{ active: currentResourceType === 'pyq' }"
                      @click="currentResourceType = 'pyq'">
                      📄 PYQs
                    </button>
                  </div>

                  <template
                    v-if="currentResourceType === 'notes' && groupedNotes.length">
                    <div
                      class="sc-author-card"
                      v-for="(group, index) in groupedNotes"
                      :key="group.author">
                      <div class="sc-author-header" @click="toggleAuthor(index)">
                        <span class="sc-author-name"
                          >✦ {{ group.author }}
                          <span class="sc-author-count"
                            >({{ group.items.length }}
                            {{
                              group.items.length === 1 ? "note" : "notes"
                            }})</span
                          >
                        </span>
                        <svg
                          class="sc-author-chevron"
                          :style="{
                            transform: openAuthors[index]
                              ? 'rotate(180deg)'
                              : 'rotate(0deg)',
                          }"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                      <div
                        class="sc-author-body"
                        :class="{ open: openAuthors[index] }">
                        <div class="sc-author-notes">
                          <a
                            v-for="item in group.items"
                            :key="item.title"
                            :href="item.link"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="sc-resource-item">
                            <span>{{ cleanTitle(item.title) }}</span>
                            <div
                              style="
                                display: flex;
                                align-items: center;
                                gap: 0.75rem;
                              ">
                              <span v-if="item.badge" class="sc-badge">{{
                                item.badge
                              }}</span>
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                style="color: var(--text3)">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                              </svg>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </template>

                  <template
                    v-else-if="currentResourceType === 'pyq' && groupedPyq.length">
                    <div
                      class="sc-year-group"
                      v-for="group in groupedPyq"
                      :key="group.year">
                      <div class="sc-year-label">
                        {{ group.year === "Google Drive Folder" ? "🗂️" : "📅" }}
                        {{ group.year }}
                        <span class="sc-year-count"
                          >({{ group.items.length }}
                          {{
                            group.year === "Google Drive Folder"
                              ? "folder"
                              : "papers"
                          }})</span
                        >
                      </div>
                      <a
                        v-for="item in group.items"
                        :key="item.title"
                        :href="item.link"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="sc-resource-item">
                        <span>{{ cleanTitle(item.title) }}</span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          style="color: var(--text3)">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </template>

                  <template v-else-if="filteredResources.length">
                    <a
                      v-for="item in filteredResources"
                      :key="item.title"
                      :href="item.link"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="sc-resource-item">
                      <span>{{ cleanTitle(item.title) }}</span>
                      <div
                        style="
                          display: flex;
                          align-items: center;
                          gap: 0.75rem;
                        ">
                        <span v-if="item.badge" class="sc-badge">{{
                          item.badge
                        }}</span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          style="color: var(--text3)">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </a>
                  </template>

                  <div v-else class="sc-empty">
                    <div style="font-size: 2rem">🔍</div>
                    <p style="font-size: 0.85rem">No matching resources found.</p>
                  </div>
                </template>

                <div v-else class="sc-empty">
                  <div style="font-size: 3rem">📖</div>
                  <p style="font-size: 0.9rem">
                    Select a subject above to view resources
                  </p>
                </div>
              </div>
              <!-- /sc-resource-panel -->
            </div>
            <!-- /sc-panel-body -->
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from "vue";

import scData from "../../data/scData_generated.js";

// Shared with the doubts board, so the view owns it.
const search = defineModel("search", { type: String, default: "" });

const tabs = ["All Levels", "Foundation", "Diploma", "BS Degree"];
const activeTab = ref("All Levels");

const levelMeta = [
  {
    key: "foundation",
    emoji: "🌱",
    title: "Foundation Level",
    description:
      "Maths, English, Computational Thinking, Statistics, Python basics",
  },
  {
    key: "diploma",
    emoji: "📐",
    title: "Diploma Level",
    description: "DSA, DBMS, Machine Learning, App Development, Java and more",
  },
  {
    key: "bs",
    emoji: "🎓",
    title: "BS Degree Level",
    description: "Deep Learning, LLMs, NLP, CV, MLOps and more electives",
  },
];

const tabToLevel = {
  Foundation: "foundation",
  Diploma: "diploma",
  "BS Degree": "bs",
};

const visibleLevels = computed(() => {
  if (activeTab.value === "All Levels") return levelMeta;
  const key = tabToLevel[activeTab.value];
  return levelMeta.filter((l) => l.key === key);
});

const currentLevel = ref(null);
const currentSubjectCode = ref(null);
const currentResourceType = ref("notes");
const openAuthors = ref({});

const driveLinks = {
  foundationPyq:
    "https://drive.google.com/drive/folders/1Fq3vpXmmN3moEFa9TdBqkBfkMfjaPyh-",
  diplomaPyq:
    "https://drive.google.com/drive/folders/1FnI9uXbnSGqMBRLWyWPD5839R9xXjS5I",
  notes: {
    BSMA1001:
      "https://drive.google.com/drive/folders/1SuT80Mt_1mhgeDb8_PF5nE2f626wI-5C",
    BSMA1002:
      "https://drive.google.com/drive/folders/1TVvNKumzi1tD5rRPR4B_SHfR6KyHXgkv",
    BSHS1001:
      "https://drive.google.com/drive/folders/1TJ_i7aNmcKBk_DAA7EmzCKTJ5fEBYWOD",
    BSCS1001:
      "https://drive.google.com/drive/folders/15BrCrZ0cBxcOOhDFwavZX9WJnwXu149O",
    BSMA1003:
      "https://drive.google.com/drive/folders/1T0Vk5wWuGlhKhCv1qGYnS7T5_mmceeFy",
    BSMA1004:
      "https://drive.google.com/drive/folders/1TNS9WHBWUKInU2Jey23DRwzNySeRjB3O",
    BSHS1002:
      "https://drive.google.com/drive/folders/1z68X9eGokOfrzlaCKV3v16bSpgInneKd",
    BSCS1002:
      "https://drive.google.com/drive/folders/1O7w1hXO6d0uptWs1U4BCMGVEdfSDxNWo",
    BSCS2001:
      "https://drive.google.com/drive/folders/1PtqrInqJV0ZcZbis2hFndmOM08lMmoS_",
    BSCS2005:
      "https://drive.google.com/drive/folders/1Q-FPcyrurSml35qHizU6An3_c7f8_xie",
    BSCS2003:
      "https://drive.google.com/drive/folders/1MbGGvTyRM0-27le2He5TKdhw8HSPfC0j",
    BSCS2006:
      "https://drive.google.com/drive/folders/1Pl7g4i6e9HRR5ZQLYaJlbj6BQ-16ZtDK",
    BSCS2002:
      "https://drive.google.com/drive/folders/1Pn7Zaa8tfXbXIBbiX9WYg_WcfIVMHCdG",
    BSSE2001:
      "https://drive.google.com/drive/folders/1PsMUC0fAMCNVB5HVgZ_TZQC3CWhT5K3g",
    BSMS2002:
      "https://drive.google.com/drive/folders/1UTximp3FWwJV6_5nBmJlISPIbzvMu8s0",
    BSMS2001:
      "https://drive.google.com/drive/folders/1UIjX4MUeJBQnSJqRnO5XI8SFm50XDPml",
    BSCS2004:
      "https://drive.google.com/drive/folders/1ODZY3E2PcsaFrzIHPo5lUhQZaBszZxxS",
    BSCS2008:
      "https://drive.google.com/drive/folders/1UIVGGZYEldx98djyOI6aR18ec-07Qies",
    BSCS2007:
      "https://drive.google.com/drive/folders/1UFpj7Lauj4l_YvA8U6tR0dqubv4K0gwy",
    BSSE2002:
      "https://drive.google.com/drive/folders/1UK3pOkccniwBm1-YfpQgjrEfXFMrOtVy",
  },
};

const currentLevelLabel = computed(() => {
  if (currentLevel.value === "foundation") return "🌱 Foundation";
  if (currentLevel.value === "diploma") return "📐 Diploma";
  if (currentLevel.value === "bs") return "🎓 BS Degree";
  return "Subjects";
});

const levelSubjects = computed(() => {
  if (!currentLevel.value) return [];
  return scData[currentLevel.value] || [];
});

function subjectMatchesSearch(subject, query) {
  const q = query.toLowerCase();
  if (subject.subject.toLowerCase().includes(q)) return true;
  if (
    String(subject.code || "")
      .toLowerCase()
      .includes(q)
  )
    return true;
  const resources = subject.resources || {};
  return ["lectures", "notes", "pyq"].some((type) =>
    (resources[type] || []).some((item) =>
      String(item.title || "")
        .toLowerCase()
        .includes(q),
    ),
  );
}

const filteredSubjects = computed(() => {
  const q = search.value.trim().toLowerCase();

  let baseSubjects = [];
  if (activeTab.value === "All Levels" && q) {
    // Collect all subjects from all levels for global search
    ["foundation", "diploma", "bs"].forEach((lvl) => {
      (scData[lvl] || []).forEach((sub) => {
        baseSubjects.push({ ...sub, levelKey: lvl });
      });
    });
  } else {
    // Only current level subjects
    baseSubjects = levelSubjects.value.map((sub) => ({
      ...sub,
      levelKey: currentLevel.value,
    }));
  }

  if (!q) return baseSubjects;

  return baseSubjects.filter((subject) => subjectMatchesSearch(subject, q));
});

const currentSubject = computed(
  () =>
    levelSubjects.value.find((s) => s.code === currentSubjectCode.value) || null,
);

const filteredResources = computed(() => {
  if (!currentSubject.value) return [];
  const source =
    currentSubject.value.resources?.[currentResourceType.value] || [];
  const q = search.value.trim().toLowerCase();
  if (!q) return source;
  return source.filter((item) =>
    String(item.title || "")
      .toLowerCase()
      .includes(q),
  );
});

function parseAuthor(title) {
  const match = String(title).match(/\(by\s+(.+?)\)\s*$/i);
  return match ? match[1].trim() : "Unknown";
}

function cleanTitle(title) {
  let cleaned = String(title || "")
    .replace(/\s*\(by\s+.+?\)\s*$/i, "")
    .trim();
  cleaned = cleaned.replace(/^[\s\-–:]+/, "");
  return cleaned || String(title || "Untitled");
}

function parsePYQYear(title) {
  const monthYear = String(title).match(
    /(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i,
  );
  if (monthYear) return monthYear[2];
  const yearOnly = String(title).match(/\b(20\d{2})\b/);
  return yearOnly ? yearOnly[1] : "Other";
}

const groupedNotes = computed(() => {
  if (currentResourceType.value !== "notes") return [];
  const map = new Map();
  filteredResources.value.forEach((item) => {
    const author = parseAuthor(item.title);
    if (!map.has(author)) map.set(author, []);
    map.get(author).push(item);
  });
  const groups = Array.from(map.entries())
    .sort((a, b) => {
      if (a[0] === "Unknown") return 1;
      if (b[0] === "Unknown") return -1;
      return a[0].localeCompare(b[0]);
    })
    .map(([author, items]) => ({ author, items }));

  if (currentSubject.value) {
    const subjectCode = currentSubject.value.code;
    let driveLink = driveLinks.notes[subjectCode];
    if (
      !driveLink &&
      currentSubject.value.subject &&
      currentSubject.value.subject.toLowerCase().includes("analytics")
    ) {
      driveLink = driveLinks.notes["BSMS2002"];
    }
    if (driveLink) {
      groups.unshift({
        author: "Google Drive Folder",
        items: [
          {
            title: `Subject Wise Notes - ${currentSubject.value.subject}`,
            link: driveLink,
          },
        ],
      });
    }
  }

  return groups;
});

const groupedPyq = computed(() => {
  if (currentResourceType.value !== "pyq") return [];
  const map = new Map();
  filteredResources.value.forEach((item) => {
    const year = parsePYQYear(item.title);
    if (!map.has(year)) map.set(year, []);
    map.get(year).push(item);
  });
  const groups = Array.from(map.entries())
    .sort((a, b) => {
      if (a[0] === "Other") return 1;
      if (b[0] === "Other") return -1;
      return Number(b[0]) - Number(a[0]);
    })
    .map(([year, items]) => ({ year, items }));

  if (currentSubject.value) {
    const subjectCode = currentSubject.value.code;
    const isFoundation =
      currentLevel.value === "foundation" ||
      (String(subjectCode).startsWith("BS") &&
        String(subjectCode).includes("10"));
    const isDiploma =
      currentLevel.value === "diploma" ||
      (String(subjectCode).startsWith("BS") &&
        String(subjectCode).includes("20"));

    if (isFoundation) {
      groups.unshift({
        year: "Google Drive Folder",
        items: [
          { title: "Foundation End term PYQs", link: driveLinks.foundationPyq },
        ],
      });
    } else if (isDiploma) {
      groups.unshift({
        year: "Google Drive Folder",
        items: [{ title: "Diploma ET PYQs", link: driveLinks.diplomaPyq }],
      });
    }
  }

  return groups;
});

function toggleAuthor(index) {
  openAuthors.value = {
    ...openAuthors.value,
    [index]: !openAuthors.value[index],
  };
}

function loadLevel(level) {
  currentLevel.value = level;
  currentResourceType.value = "notes";
  openAuthors.value = {};
  const first = (scData[level] || [])[0];
  currentSubjectCode.value = first ? first.code : null;
}

function selectSubject(subject) {
  if (subject.levelKey && subject.levelKey !== currentLevel.value) {
    currentLevel.value = subject.levelKey;
  }
  currentSubjectCode.value = subject.code;
  currentResourceType.value = "notes";
  openAuthors.value = {};
}

function resetLevel() {
  currentLevel.value = null;
  currentSubjectCode.value = null;
  currentResourceType.value = "notes";
  openAuthors.value = {};
}

watch(activeTab, (newTab) => {
  if (newTab === "All Levels") return;
  const key = tabToLevel[newTab];
  if (key) loadLevel(key);
});

watch(filteredSubjects, (subjects) => {
  if (!currentLevel.value || !subjects.length) return;
  const hasActive = subjects.some((s) => s.code === currentSubjectCode.value);
  if (!hasActive) currentSubjectCode.value = subjects[0].code;
});
</script>

<style scoped src="./study-shared.css"></style>

<style scoped>
/* ─── Two-column layout ───────────────────────────────────── */
.sc-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.75rem;
  align-items: start;
}

/* ─── Left sidebar ────────────────────────────────────────── */
.sc-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: sticky;
  top: 100px;
}

.sc-sidebar-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sc-sidebar-card {
  background: var(--surface);
  border: 1px solid rgba(212, 160, 23, 0.15);
  border-radius: 14px;
  padding: 1.6rem 1.4rem;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.sc-sidebar-card:hover {
  border-color: rgba(212, 160, 23, 0.4);
  background: rgba(212, 160, 23, 0.04);
}

.sc-sidebar-card.active {
  border-color: var(--accent);
  background: rgba(212, 160, 23, 0.07);
  box-shadow: 0 0 0 2px rgba(212, 160, 23, 0.2);
}

.sc-sidebar-card.active .sc-sidebar-arrow {
  color: var(--accent);
  transform: translateX(3px);
}

.sc-sidebar-card-top {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.sc-sidebar-emoji {
  font-size: 1.6rem;
  flex-shrink: 0;
  line-height: 1;
  margin-top: 0.1rem;
}

.sc-sidebar-meta {
  flex: 1;
  min-width: 0;
}

.sc-sidebar-card .sc-card-title {
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.sc-sidebar-card .sc-card-desc {
  font-size: 0.75rem;
  margin-bottom: 0;
  line-height: 1.5;
}

.sc-sidebar-arrow {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  color: var(--text3);
  transition: all 0.2s;
}

/* ─── Right panel ─────────────────────────────────────────── */
.sc-panel-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sc-panel-search {
  margin-bottom: 0;
  flex-shrink: 0;
}

/* Wrapper that holds strip + resource panel as one fixed box */
.sc-panel-body {
  display: flex;
  flex-direction: column;
  height: 580px;
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
}

/* Subject strip: fixed top, no scroll */
.sc-subject-strip {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  border-radius: 0;
  padding: 1.25rem 1.5rem;
  flex-shrink: 0;
}

/* Resource panel: fills remaining height, scrollable */
.sc-resource-panel {
  background: var(--surface);
  padding: 1.5rem 2rem;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(212, 160, 23, 0.3) transparent;
}

.sc-resource-panel::-webkit-scrollbar {
  width: 5px;
}
.sc-resource-panel::-webkit-scrollbar-thumb {
  background: rgba(212, 160, 23, 0.3);
  border-radius: 99px;
}

/* ─── Responsive ──────────────────────────────────────────── */
@media (max-width: 900px) {
  .sc-layout {
    grid-template-columns: 1fr;
  }
  .sc-sidebar {
    position: static;
  }
  .sc-sidebar-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}

.sc-level-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-color: rgba(212, 160, 23, 0.15) !important;
}

.sc-level-card:hover {
  transform: translateY(-6px);
}

.sc-level-card.active {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 2px rgba(212, 160, 23, 0.3);
}

.sc-card-emoji {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.sc-card-desc {
  font-size: 0.82rem;
  margin-bottom: 1rem;
}

.sc-browse-btn {
  font-size: 0.82rem;
  padding: 0.5rem 1.1rem;
  pointer-events: none;
}

.sc-strip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.sc-badges-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sc-subj-badge {
  padding: 0.4rem 0.9rem;
  font-size: 0.82rem;
}

.sc-tab-bar {
  display: flex;
  gap: 0.5rem;
  margin: 1.5rem 0 1.25rem;
  flex-wrap: wrap;
}

.sc-tab {
  padding: 0.45rem 1.1rem;
  font-size: 0.82rem;
}

.sc-resource-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  background: rgba(212, 160, 23, 0.03);
  border: 1px solid var(--border);
  border-radius: 10px;
  text-decoration: none;
  color: var(--text);
  font-size: 0.88rem;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
}

.sc-resource-item:hover {
  background: rgba(212, 160, 23, 0.08);
}

.sc-badge {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(212, 160, 23, 0.15);
  color: var(--accent);
  border: 1px solid rgba(212, 160, 23, 0.3);
  padding: 0.15rem 0.55rem;
  border-radius: 99px;
}

.sc-author-card {
  background: rgba(212, 160, 23, 0.04);
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 0.75rem;
  overflow: hidden;
}

.sc-author-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.15rem;
  cursor: pointer;
}

.sc-author-name {
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sc-author-count {
  font-size: 0.7rem;
  color: var(--text3);
}

.sc-author-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease;
}

.sc-author-body.open {
  max-height: 2000px;
}

.sc-author-notes {
  padding: 0 1rem 1rem;
}

.sc-year-group {
  margin-bottom: 1.25rem;
}

.sc-year-label {
  font-family: Cinzel, serif;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--accent);
  margin-bottom: 0.5rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid rgba(212, 160, 23, 0.15);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sc-year-count {
  font-size: 0.7rem;
  color: var(--text3);
  font-weight: 400;
}

@media (max-width: 768px) {
  .sc-sidebar-cards {
    grid-template-columns: 1fr;
  }

  .sc-badges-row {
    max-height: 200px;
    overflow-y: auto;
  }
}
</style>
