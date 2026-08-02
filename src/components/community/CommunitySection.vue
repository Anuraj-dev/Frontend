<template>
  <section class="section rs" :style="alt ? 'background: var(--bg2)' : undefined">
    <div class="container">
      <div class="section-header">
        <div class="section-tag">{{ tag }}</div>
        <h2 class="section-title-xl">{{ title }} <span class="tg">{{ accent }}</span></h2>
        <p class="desc" style="max-width: 600px">{{ desc }}</p>
      </div>
      <slot />
    </div>
  </section>
</template>

<script setup>
// Section shell shared by the Technical / Cultural / E-Sports community pages.
// Colours come from src/assets/community.css via the page's variant class.
defineProps({
  tag: { type: String, required: true },
  title: { type: String, required: true },
  accent: { type: String, required: true },
  desc: { type: String, required: true },
  // `true` renders the alternating --bg2 band.
  alt: { type: Boolean, default: false },
});
</script>
