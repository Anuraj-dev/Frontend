<!--
  Fork-only testing gate: the whole site stays closed until a listed email is typed. App.vue shows
  this instead of the shell, so no route renders behind it.
-->
<template>
  <main class="gate">
    <img class="plate" :src="plate" alt="" aria-hidden="true" />
    <section class="card rise" style="--i: 0" aria-labelledby="gate-h">
      <p class="eyebrow mono">Testing only</p>
      <h1 id="gate-h">This is open for beta testers only.</h1>
      <p class="lede">
        The boatman is checking his list. Name not on it? Then you’re staying on the bank.
      </p>
      <form novalidate @submit.prevent="submit">
        <label for="gate-email">Your email</label>
        <input
          id="gate-email"
          v-model="email"
          type="email"
          autocomplete="email"
          required
          :aria-invalid="error ? 'true' : 'false'"
          aria-describedby="gate-error"
        />
        <button type="submit">Cross over <LineIcon name="arrow" /></button>
        <p id="gate-error" class="error" role="alert">{{ error }}</p>
      </form>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import LineIcon from './LineIcon.vue';
import plate from '../../assets/gate/testing-gate.webp';
import { tryUnlock } from '../../lib/testing-gate.js';

const emit = defineEmits(['unlock']);
const email = ref('');
const error = ref('');

function submit() {
  if (!tryUnlock(email.value)) {
    error.value = 'That email is not on the list. The boatman says come back another day.';
    return;
  }
  emit('unlock');
}
</script>

<style scoped>
.gate {
  position: relative;
  isolation: isolate;
  min-height: 100svh;
  display: grid;
  justify-items: center;
  align-content: start;
  padding: 48px 20px 40px;
  overflow: hidden;
}
.plate {
  position: absolute;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
}
.card {
  width: min(420px, 100%);
  padding: 26px 24px 22px;
  background: var(--card);
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: var(--r);
  box-shadow: var(--shadow);
}
.eyebrow {
  margin: 0 0 10px;
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--mari-ink);
}
h1 {
  margin: 0 0 12px;
  font-size: clamp(30px, 4vw, 36px);
  font-weight: 750;
  letter-spacing: -0.04em;
  line-height: 0.98;
}
.lede {
  margin: 0 0 20px;
  font-size: 14.5px;
  color: var(--ink-2);
  max-width: 62ch;
}
label {
  display: block;
  margin-bottom: 6px;
  font-size: 12.5px;
  color: var(--ink-3);
}
input {
  box-sizing: border-box;
  width: 100%;
  padding: 12px 14px;
  font: inherit;
  font-size: 16px; /* 16px stops iOS zooming into the field */
  color: var(--ink);
  background: var(--paper);
  border: 1px solid var(--line-strong);
  border-radius: 12px;
}
button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 12px 20px;
  font: inherit;
  font-weight: 650;
  color: var(--on-mari);
  background: var(--mari);
  border: 0;
  border-radius: 99px;
  cursor: pointer;
  transition: transform 0.2s var(--ease-spring);
}
button:hover {
  transform: translateY(-1px);
}
.error {
  min-height: 1.4em;
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--verm);
}
@media (max-width: 560px) {
  .gate {
    padding: 28px 16px 32px;
  }
  .card {
    padding: 22px 18px 18px;
  }
}
</style>
