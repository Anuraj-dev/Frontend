<template>
  <div class="past-events-grid">
    <div v-for="event in events" :key="event.id" class="past-event-card">
      <div class="past-event-img-wrap">
        <!-- Blurred backdrop fills the frame so letterboxed art has no black bars -->
        <img :src="event.image" class="past-event-img-blur" aria-hidden="true" />
        <img :src="event.image" :alt="event.title" class="past-event-img" />
        <div class="past-event-overlay">
          <span class="past-event-date">{{ event.date }}</span>
        </div>
      </div>
      <div class="past-event-body">
        <span class="event-type-tag">{{ event.type }}</span>
        <h3 class="past-event-title">{{ event.title }}</h3>
        <p class="past-event-desc">{{ event.description }}</p>
        <div class="past-event-stat">👥 {{ event.attendees }} attended</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  events: { type: Array, required: true },
});
</script>
