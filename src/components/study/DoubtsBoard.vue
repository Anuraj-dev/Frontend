<template>
  <section class="section rs" id="doubtBoard">
    <div class="container">
      <div class="sec-hdr">
        <div class="section-tag">Community</div>
        <h2 class="section-title-xl">
          Anonymous <span class="tg">Doubts Board</span>
        </h2>
        <p class="sec-sub">
          Community-answered doubts. Ask anonymously, learn together.
        </p>
      </div>

      <div
        style="
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 2.5rem;
        ">
        <button
          class="db-filter"
          :class="{ active: dbCurrentFilter === 'all' }"
          @click="setDbFilter('all')">
          All Subjects
        </button>
        <button
          class="db-filter"
          :class="{ active: dbCurrentFilter === 'Math' }"
          @click="setDbFilter('Math')">
          Mathematics
        </button>
        <button
          class="db-filter"
          :class="{ active: dbCurrentFilter === 'Stats' }"
          @click="setDbFilter('Stats')">
          Statistics
        </button>
        <button
          class="db-filter"
          :class="{ active: dbCurrentFilter === 'Python' }"
          @click="setDbFilter('Python')">
          Python
        </button>
        <button
          class="db-filter"
          :class="{ active: dbCurrentFilter === 'DBMS' }"
          @click="setDbFilter('DBMS')">
          DBMS
        </button>
        <button
          class="db-filter"
          :class="{ active: dbCurrentFilter === 'DSA' }"
          @click="setDbFilter('DSA')">
          DSA
        </button>
        <button
          class="db-filter"
          :class="{ active: dbCurrentFilter === 'ML' }"
          @click="setDbFilter('ML')">
          Machine Learning
        </button>
        <button
          v-if="myDoubtsCount > 0"
          class="db-filter"
          :class="{ active: dbCurrentFilter === 'my-doubts' }"
          @click="setDbFilter('my-doubts')">
          My Doubts ({{ myDoubtsCount }})
        </button>
        <button
          class="db-filter"
          :class="{ active: dbCurrentFilter === 'answer-doubts' }"
          @click="setDbFilter('answer-doubts')">
          Answer Doubts
        </button>
      </div>

      <div class="db-scroll-box">
        <template v-if="filteredDoubts.length">
          <div class="db-card" v-for="d in filteredDoubts" :key="d.id">
            <span class="db-tag">{{ d.subject }}</span>
            <div class="db-question">{{ d.question }}</div>
            <div class="db-answer" v-if="d.answer">{{ d.answer }}</div>
            <div
              v-if="dbCurrentFilter === 'answer-doubts' && !d.answer"
              style="margin: 0.75rem 0 0.5rem">
              <textarea
                v-model="dbDraftAnswers[d.id]"
                class="db-input"
                rows="3"
                placeholder="Write an answer for the community..."></textarea>
              <button
                class="submit-btn"
                style="margin-top: 0.55rem; padding: 0.4rem 0.9rem"
                @click="postAnswer(d.id)">
                Post Answer
              </button>
            </div>
            <div class="db-footer">
              <span>{{ d.time }}</span>
              <button
                class="db-upvote"
                :disabled="Boolean(dbVoted[d.id])"
                @click="upvoteDoubt(d.id)">
                {{
                  dbVoted[d.id]
                    ? "✓ Voted"
                    : `👍 ${d.upvotes + (dbVoted[d.id] ? 1 : 0)}`
                }}
              </button>
            </div>
          </div>
        </template>
        <p
          v-else
          style="text-align: center; color: var(--text3); padding: 2rem">
          {{ emptyDoubtsLabel }}
        </p>
      </div>

      <div
        class="card-base"
        style="
          max-width: 820px;
          margin: 0 auto;
          padding: 2.5rem 2rem;
          text-align: center;
        ">
        <h3
          style="
            font-family: Cinzel, serif;
            font-weight: 700;
            font-size: 1.4rem;
            margin-bottom: 1rem;
          ">
          Have a Doubt?
        </h3>
        <p
          style="
            color: var(--text2);
            margin-bottom: 1.5rem;
            font-size: 0.95rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          ">
          Submit your doubts anonymously using our Google form. Community members
          or WebOps will review and post answers on the board.
        </p>
        <a
          href="https://forms.gle/vZox3LpVrXti74UH7"
          target="_blank"
          rel="noopener noreferrer"
          class="submit-btn"
          style="display: inline-block; text-decoration: none">
          Open Doubts Form
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";

// The page-level search box lives in the resource browser; the board filters
// against the same query, so the view passes it down.
const props = defineProps({
  search: { type: String, default: "" },
});

const DB_JSON_PATH = "/data/doubts.json";
const DB_STUDENT_KEY = "sb_student_doubts_v1";
const DB_VOTED_KEY = "sb_voted_doubts_v1";
const DB_ANSWERS_KEY = "sb_doubt_answers_v1";

const dbCurrentFilter = ref("all");
const dbDoubts = ref([]);
const dbVoted = ref({});
const dbAnswers = ref({});
const dbDraftAnswers = reactive({});

const dbForm = reactive({
  subject: "",
  question: "",
});

const dbMessage = ref("");
const dbMessageType = ref("success");

function dbStorageGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function dbStorageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / storage errors
  }
}

function dbNowLabel() {
  const now = new Date();
  return now.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeSubject(subject) {
  const value = String(subject || "")
    .trim()
    .toLowerCase();
  const map = {
    math: "Math",
    mathematics: "Math",
    stats: "Stats",
    statistics: "Stats",
    python: "Python",
    dbms: "DBMS",
    dsa: "DSA",
    ml: "ML",
    "machine learning": "ML",
    other: "Other",
    "my-doubts": "my-doubts",
    "answer-doubts": "answer-doubts",
    all: "all",
  };
  return map[value] || String(subject || "Other");
}

function hydrateDoubt(d, index = 0, prefix = "plh") {
  const subject = normalizeSubject(d.subject);
  const question = String(d.question || "").trim();
  if (!question) return null;
  const id = d.id || `${prefix}-${subject.toLowerCase()}-${index + 1}`;
  const savedAnswer = dbAnswers.value[id]
    ? String(dbAnswers.value[id].answer || "").trim()
    : "";
  return {
    id,
    subject,
    question,
    answer: savedAnswer || String(d.answer || "").trim(),
    time: String(d.time || "Recently"),
    upvotes: Number.isFinite(Number(d.upvotes)) ? Number(d.upvotes) : 0,
    isStudent: Boolean(d.isStudent),
  };
}

const myDoubtsCount = computed(
  () => dbDoubts.value.filter((d) => d.isStudent).length,
);

const filteredDoubts = computed(() => {
  const active = normalizeSubject(dbCurrentFilter.value);
  let list = dbDoubts.value;
  if (active === "my-doubts") list = list.filter((d) => d.isStudent);
  else if (active === "answer-doubts")
    list = list.filter((d) => !String(d.answer || "").trim());
  else if (active !== "all")
    list = list.filter((d) => normalizeSubject(d.subject) === active);

  const q = props.search.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (d) =>
      d.question.toLowerCase().includes(q) ||
      String(d.answer || "")
        .toLowerCase()
        .includes(q) ||
      d.subject.toLowerCase().includes(q),
  );
});

const emptyDoubtsLabel = computed(() => {
  if (dbCurrentFilter.value === "my-doubts")
    return "You have not posted any doubts yet.";
  if (dbCurrentFilter.value === "answer-doubts")
    return "No unanswered doubts right now.";
  return "No doubts in this subject yet.";
});

function setDbFilter(filter) {
  dbCurrentFilter.value = normalizeSubject(filter);
}

function upvoteDoubt(id) {
  if (dbVoted.value[id]) return;
  dbVoted.value = { ...dbVoted.value, [id]: true };
  dbStorageSet(DB_VOTED_KEY, dbVoted.value);
}

function submitDoubt() {
  const subject = normalizeSubject(dbForm.subject);
  const question = dbForm.question.trim();

  if (!dbForm.subject || question.length < 10) {
    dbMessageType.value = "error";
    dbMessage.value =
      "⚠ Please select a subject and write at least 10 characters.";
    return;
  }

  const newDoubt = hydrateDoubt(
    {
      id: `stu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      subject,
      question,
      answer: "",
      time: dbNowLabel(),
      upvotes: 0,
      isStudent: true,
    },
    0,
    "stu",
  );

  if (!newDoubt) return;

  dbDoubts.value = [newDoubt, ...dbDoubts.value];
  const saved = dbStorageGet(DB_STUDENT_KEY, []);
  dbStorageSet(DB_STUDENT_KEY, [newDoubt, ...saved]);

  dbForm.subject = "";
  dbForm.question = "";
  dbCurrentFilter.value = subject;
  dbMessageType.value = "success";
  dbMessage.value =
    "✓ Your doubt has been submitted! Also visible in My Doubts.";

  setTimeout(() => {
    dbMessage.value = "";
  }, 3000);
}

function postAnswer(id) {
  const answer = String(dbDraftAnswers[id] || "").trim();
  if (answer.length < 8) return;

  dbAnswers.value = {
    ...dbAnswers.value,
    [id]: {
      answer,
      time: dbNowLabel(),
    },
  };
  dbStorageSet(DB_ANSWERS_KEY, dbAnswers.value);

  dbDoubts.value = dbDoubts.value.map((d) =>
    d.id === id ? { ...d, answer } : d,
  );
  dbDraftAnswers[id] = "";
}

async function initDoubts() {
  dbVoted.value = dbStorageGet(DB_VOTED_KEY, {});
  dbAnswers.value = dbStorageGet(DB_ANSWERS_KEY, {});

  const studentDoubtsRaw = dbStorageGet(DB_STUDENT_KEY, []);
  const studentDoubts = Array.isArray(studentDoubtsRaw)
    ? studentDoubtsRaw.map((d, i) => hydrateDoubt(d, i, "stu")).filter(Boolean)
    : [];

  let placeholderRaw = [];
  try {
    const response = await fetch(DB_JSON_PATH, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) placeholderRaw = data;
    }
  } catch {
    placeholderRaw = [];
  }

  const placeholders = placeholderRaw
    .map((d, i) => hydrateDoubt(d, i, "plh"))
    .filter(Boolean);

  dbDoubts.value = [...studentDoubts, ...placeholders];
}

onMounted(async () => {
  await initDoubts();
});
</script>

<style scoped src="./study-shared.css"></style>

<style scoped>
.db-filter {
  padding: 0.4rem 1rem;
  font-size: 0.8rem;
}

.db-scroll-box {
  max-width: 820px;
  margin: 0 auto 3rem;
  height: 560px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.25rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(212, 160, 23, 0.3) transparent;
}

.db-scroll-box::-webkit-scrollbar {
  width: 5px;
}
.db-scroll-box::-webkit-scrollbar-thumb {
  background: rgba(212, 160, 23, 0.3);
  border-radius: 99px;
}

.db-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
}

.db-tag {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: rgba(212, 160, 23, 0.1);
  color: var(--accent);
  border: 1px solid rgba(212, 160, 23, 0.25);
  padding: 0.15rem 0.55rem;
  border-radius: 99px;
  margin-bottom: 0.75rem;
}

.db-question {
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.db-answer {
  font-size: 0.85rem;
  color: var(--text2);
  line-height: 1.6;
  margin-bottom: 0.75rem;
  padding-left: 0.75rem;
  border-left: 2px solid rgba(212, 160, 23, 0.25);
}

.db-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text3);
}

.db-upvote {
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
}

.db-upvote:disabled {
  border-color: var(--accent);
  color: var(--accent);
}

.db-input {
  width: 100%;
  background: rgba(212, 160, 23, 0.04);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  color: var(--text);
  font-family: inherit;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.db-input:focus {
  outline: none;
  border-color: var(--accent);
}

.db-input option {
  background: var(--bg2);
  color: var(--text);
}
</style>
