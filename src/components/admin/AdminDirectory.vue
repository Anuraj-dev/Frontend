<!-- Super Admin search of the student directory: name, phone and the rest for every student in
     the house upload, signed in or not. Search only, at most 50 rows; the database records every
     search in the activity log. -->
<template>
  <div>
    <form class="adm-toolbar directory-form" novalidate @submit.prevent="search">
      <label class="adm-field grow">
        <span>Name, email or phone</span>
        <input
          v-model.trim="query"
          class="adm-input"
          type="search"
          autocomplete="off"
          autocapitalize="none"
          spellcheck="false"
          placeholder="Asha, 25f1000000 or 98765"
          maxlength="200"
          :aria-invalid="invalid ? 'true' : undefined"
          :aria-describedby="invalid ? 'directory-invalid' : undefined"
          @input="reset"
        />
      </label>
      <button type="submit" class="adm-btn mari" :disabled="busy">
        <LineIcon name="search" />{{ busy ? 'Searching' : 'Search' }}
      </button>
    </form>
    <p v-if="invalid" id="directory-invalid" class="adm-msg err" role="alert">{{ invalid }}</p>
    <p v-if="error" class="adm-msg err" role="alert">{{ error }}</p>

    <p v-if="busy" class="adm-note" role="status">Searching the directory...</p>

    <p v-else-if="result && !result.rows.length" class="adm-empty" role="status">
      No student in the directory matches this.
    </p>

    <template v-else-if="result">
      <p class="adm-note directory-count" role="status">
        {{ countText }}
      </p>
      <div class="adm-card adm-table-wrap directory-table">
        <table class="adm-table stack">
          <thead>
            <tr>
              <th scope="col">Student</th>
              <th scope="col">Phone</th>
              <th scope="col">Region</th>
              <th scope="col">Term</th>
              <th scope="col">Gender</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in result.rows" :key="s.email">
              <td>
                <b>{{ s.full_name || 'Name not set' }}</b>
                <small class="directory-email">{{ s.email }}</small>
              </td>
              <td data-label="Phone" class="mono">{{ s.phone || '–' }}</td>
              <td data-label="Region">{{ s.region_name || '–' }}</td>
              <td data-label="Term" class="mono">{{ s.term || '–' }}</td>
              <td data-label="Gender">{{ s.gender || '–' }}</td>
              <td data-label="Status">
                <span class="adm-badge" :class="s.signed_in ? '' : 'mari'">{{
                  s.signed_in ? 'Signed in' : 'Not signed in'
                }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import LineIcon from '../site/LineIcon.vue';
import { searchDirectory } from '../../lib/admin.js';
import { errorText } from '../../lib/auth.js';

const query = ref('');
const busy = ref(false);
const error = ref('');
const invalid = ref('');
const result = ref(null);
let sequence = 0;

const countText = computed(() => {
  const { total, rows } = result.value;
  if (total > rows.length)
    return `Showing the first ${rows.length} of ${total}. Type more to narrow it.`;
  return total === 1 ? '1 student' : `${total} students`;
});

// Typing again clears the last answer, so nothing stale sits beside a new search.
function reset() {
  sequence++;
  busy.value = false;
  invalid.value = error.value = '';
  result.value = null;
}

async function search() {
  const value = query.value;
  reset();
  // Same minimum the database enforces; it checks again.
  if (value.length < 3) {
    invalid.value = value ? 'Type at least 3 characters.' : 'Type a name, email or phone.';
    return;
  }
  const token = sequence;
  busy.value = true;
  try {
    const found = await searchDirectory(value);
    if (token === sequence) result.value = found;
  } catch (e) {
    if (token === sequence) error.value = errorText(e);
  } finally {
    if (token === sequence) busy.value = false;
  }
}

onBeforeUnmount(() => sequence++);
</script>

<style scoped>
.grow {
  flex: 1 1 280px;
}
.directory-form {
  align-items: flex-end;
}
.directory-form .adm-btn svg {
  width: 16px;
  height: 16px;
}
.directory-count {
  margin: 16px 0 8px;
}
.directory-table td b {
  display: block;
}
.directory-email {
  color: var(--ink-3);
  font-size: 12.5px;
  overflow-wrap: anywhere;
}
</style>
