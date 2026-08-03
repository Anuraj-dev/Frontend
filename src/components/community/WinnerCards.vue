<template>
  <div class="winners-grid">
    <div v-for="event in events" :key="event.id" class="winner-card">
      <div class="winner-card-header">
        <span class="winner-event-tag">{{ event.type }}</span>
        <h3 class="winner-event-title">{{ event.title }}</h3>
      </div>
      <div v-if="event.noWinner" class="no-winner">
        <span class="no-winner-icon">—</span>
        <span>{{ noWinnerText }}</span>
      </div>
      <ul v-else class="winners-list">
        <li v-for="(winner, index) in event.winners" :key="index" class="winner-row">
          <span class="winner-rank">{{ index + 1 }}</span>
          <div class="winner-info">
            <span class="winner-name">{{ winner.name }}</span>
            <span class="winner-email" v-if="winner.email">{{ winner.email }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineProps({
  events: { type: Array, required: true },
  // Only rendered for entries flagged `noWinner`.
  noWinnerText: { type: String, default: '' },
});
</script>
