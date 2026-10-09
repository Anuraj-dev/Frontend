<!-- Member form on its own route. Same field renderer as the Lounge dialog. -->
<template>
  <main class="wrap">
    <header class="head rise" style="--i: 0">
      <p class="kicker">House form</p>
      <h1>{{ form?.title || 'Form' }}</h1>
      <p class="sub">
        {{ form?.description || 'Signed-in members only. Answers are saved on your account.' }}
      </p>
    </header>

    <p v-if="loadError" class="msg err" role="alert">{{ loadError }}</p>
    <p v-else-if="!ready" class="msg" role="status">Opening the form…</p>
    <p v-else-if="!form" class="msg err" role="alert">
      This form is closed or outside your audience.
    </p>

    <form v-else class="slip rise" style="--i: 1" @submit.prevent="send">
      <p v-if="form.submitted" class="msg" role="status">You already sent this one.</p>
      <FormFields
        v-else
        ref="fieldsEl"
        v-model:save-phone="savePhone"
        :fields="form.fields || []"
      />
      <p v-if="error" class="msg err" role="alert">{{ error }}</p>
      <p v-if="invite" class="msg" role="status">
        WhatsApp invite:
        <a :href="invite" target="_blank" rel="noopener noreferrer">Open the group</a>. Request
        entry there. An admin checks house membership (and region, for regional groups) before they
        add you. Sending this form is not admission.
      </p>
      <p v-else-if="done" class="msg" role="status">
        Saved. If this form has a WhatsApp group, the invite appears after the database confirms
        your response.
      </p>
      <div class="acts">
        <button v-if="!form.submitted && !done" class="go" type="submit" :disabled="busy">
          {{ busy ? 'Sending…' : 'Send' }}
        </button>
        <RouterLink class="ghost" to="/lounge">Back to the Lounge</RouterLink>
      </div>
    </form>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import FormFields from '../components/lounge/FormFields.vue';
import {
  fetchInvite,
  formById,
  hydrateLounge,
  lounge,
  submitLoungeForm,
} from '../components/lounge/session.js';
import { auth, errorText } from '../lib/auth.js';

const route = useRoute();
const ready = ref(false);
const loadError = ref('');
const fieldsEl = ref(null);
const savePhone = ref(false);
const busy = ref(false);
const error = ref('');
const done = ref(false);
const invite = ref('');

const form = computed(() => formById(route.params.id));

onMounted(async () => {
  if (!auth.session || !auth.profile) return;
  try {
    if (!lounge.ready) await hydrateLounge();
  } catch (err) {
    loadError.value = errorText(err);
  } finally {
    ready.value = true;
  }
});

async function send() {
  if (busy.value || !form.value || form.value.submitted) return;
  busy.value = true;
  error.value = '';
  try {
    const result = await submitLoungeForm(
      form.value.id,
      fieldsEl.value?.answers() ?? {},
      savePhone.value
    );
    done.value = true;
    invite.value = result?.invite_url || '';
    if (!invite.value && result?.response_id) {
      invite.value = (await fetchInvite(form.value.id).catch(() => '')) || '';
    }
  } catch (err) {
    error.value = errorText(err);
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.wrap {
  max-width: 760px;
  margin: 0 auto;
  padding: 40px 24px 72px;
  display: grid;
  gap: 22px;
}
.kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mari-ink);
}
h1 {
  margin: 0;
  font-size: clamp(34px, 4.4vw, 48px);
  font-weight: 750;
  letter-spacing: -0.04em;
  line-height: 0.95;
}
.sub {
  margin: 12px 0 0;
  max-width: 62ch;
  color: var(--ink-2);
  font-size: 17px;
  line-height: 1.45;
}
.slip {
  display: grid;
  gap: 14px;
  padding: 22px 24px 18px;
  border-radius: var(--r);
  background: var(--card);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
}
.msg {
  margin: 0;
  color: var(--ink-2);
  font-size: 15px;
  line-height: 1.45;
}
.msg.err {
  color: var(--verm);
}
.acts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.go,
.ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 99px;
  font-size: 15px;
  font-weight: 650;
  text-decoration: none;
}
.go {
  border: 0;
  background: var(--mari);
  color: var(--on-mari);
}
.go:disabled {
  opacity: 0.55;
}
.ghost {
  border: 1.5px solid var(--line-strong);
  background: transparent;
  color: var(--ink);
}
:deep(.ff) {
  display: grid;
  gap: 14px;
}
:deep(.ff-field),
:deep(.ff-multi legend) {
  display: grid;
  gap: 6px;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink-2);
}
:deep(.ff-field input),
:deep(.ff-field select),
:deep(.ff-field textarea),
:deep(.ff-other input[type='text']) {
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  border: 1.5px solid var(--line-strong);
  border-radius: 12px;
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  text-transform: none;
  letter-spacing: 0;
}
:deep(.ff-multi) {
  margin: 0;
  padding: 0;
  border: 0;
  display: grid;
  gap: 8px;
}
:deep(.ff-check),
:deep(.ff-other) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  text-transform: none;
  letter-spacing: 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--ink);
}
@media (max-width: 760px) {
  .wrap {
    padding: 24px 16px 40px;
  }
}
</style>
