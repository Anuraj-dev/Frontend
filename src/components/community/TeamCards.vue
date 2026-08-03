<template>
  <div class="team-grid">
    <div v-for="member in members" :key="member.name" class="team-card">
      <div class="team-photo-wrap">
        <img :src="member.photo" :alt="member.name" class="team-photo" />
        <div class="team-overlay">
          <h4 class="team-name">{{ member.name }}</h4>
        </div>
      </div>

      <div class="team-footer">
        <p class="team-course">{{ member.role }} · {{ member.level }}</p>

        <div class="team-socials">
          <!-- Email -->
          <a :href="member.email" class="social-btn" title="Email">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </a>

          <!-- LinkedIn -->
          <a :href="member.linkedin" class="social-btn" title="LinkedIn" target="_blank">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
              />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>

          <!-- Instagram -->
          <a :href="member.instagram" class="social-btn" title="Instagram" target="_blank">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  members: { type: Array, required: true },
});
</script>
