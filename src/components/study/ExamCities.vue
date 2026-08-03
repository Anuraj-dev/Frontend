<template>
  <!-- Exam Cities Section -->
  <section class="section rs" id="examCities">
    <div class="container">
      <div class="sec-hdr">
        <div class="section-tag">Exam Info</div>
        <h2 class="section-title-xl">IITM BS <span class="tg">Exam Cities</span></h2>
        <p class="sec-sub">
          Find your nearest exam centre. Cities are organized by state across India.
        </p>
      </div>

      <!-- Search -->
      <div class="ec-search-wrap">
        <div class="sc-search-input-wrap" style="max-width: 420px; margin: 0 auto 1.5rem">
          <input
            v-model="citySearch"
            type="text"
            placeholder="Search city or state..."
            class="form-input sc-mid-search-input"
          />
          <svg
            class="sc-mid-search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      </div>

      <div class="ec-layout">
        <!-- LEFT: Region sidebar -->
        <div class="ec-sidebar">
          <div class="sc-sidebar-hdr">
            <div class="section-tag" style="margin-bottom: 0">Choose Region</div>
          </div>
          <div class="ec-sidebar-cards">
            <div
              v-for="region in examRegionMeta"
              :key="region.key"
              class="ec-sidebar-card"
              :class="{ active: activeRegion === region.key }"
              @click="selectExamRegion(region.key)"
            >
              <div class="ec-sidebar-card-top">
                <span class="ec-sidebar-emoji">{{ region.emoji }}</span>
                <div class="ec-sidebar-meta">
                  <h3 class="sc-card-title">{{ region.key }}</h3>
                </div>
              </div>
              <div class="sc-card-stats">
                <span class="sc-stat-badge">{{ region.stateCount }} states</span>
                <span class="sc-stat-badge">{{ region.cityCount }} cities</span>
              </div>
              <div class="ec-sidebar-arrow">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Cities panel -->
        <div class="ec-panel-wrap">
          <div v-if="!activeRegion" class="sc-panel-empty">
            <div style="font-size: 3rem; margin-bottom: 1rem">📍</div>
            <p style="font-size: 1rem; color: var(--text2)">
              Select a region on the left to view exam cities
            </p>
          </div>

          <div v-else class="ec-panel-body">
            <div class="ec-strip-header">
              <span class="sc-strip-label">{{ activeRegion }} — Exam Cities</span>
              <button class="sc-back-btn" @click="resetExamRegion">&larr; Clear</button>
            </div>

            <div class="ec-cities-scroll">
              <div class="ec-grid">
                <div v-for="row in filteredExamCities" :key="row.state" class="ec-card card-base">
                  <div class="ec-state">{{ row.state }}</div>
                  <div class="ec-cities-list">
                    <span v-for="city in row.cities" :key="city" class="ec-city-tag">{{
                      city
                    }}</span>
                  </div>
                </div>
              </div>

              <div v-if="filteredExamCities.length === 0" class="sc-empty">
                <div style="font-size: 2.5rem">🔍</div>
                <p>No cities found for "{{ citySearch }}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

// ─── Exam Cities ─────────────────────────────────────────────────────────────
const citySearch = ref('');
const activeRegion = ref(null);

const examCitiesData = [
  {
    state: 'Andaman & Nicobar Islands',
    region: 'Kolkata',
    cities: ['Port Blair'],
  },
  {
    state: 'Andhra Pradesh',
    region: 'Hyderabad',
    cities: [
      'Anantapur',
      'Bhimavaram',
      'Guntur',
      'Kadapa',
      'Kurnool',
      'Rajahmundry',
      'Tirupathi',
      'Vijayawada',
      'Vishakhapatnam',
    ],
  },
  { state: 'Arunachal Pradesh', region: 'Kolkata', cities: ['Naharlagun'] },
  {
    state: 'Assam',
    region: 'Kolkata',
    cities: ['Dibrugarh', 'Guwahati', 'Silchar', 'Tezpur'],
  },
  {
    state: 'Bihar',
    region: 'Patna',
    cities: ['Patna', 'Bhagalpur', 'Gaya', 'Muzaffarpur', 'Darbhanga'],
  },
  { state: 'Chhattisgarh', region: 'Patna', cities: ['Raipur'] },
  { state: 'Delhi', region: 'Delhi', cities: ['Delhi'] },
  { state: 'Goa', region: 'Mumbai', cities: ['Panaji'] },
  {
    state: 'Gujarat',
    region: 'Mumbai',
    cities: ['Ahmedabad', 'Anand', 'Rajkot', 'Surat', 'Vadodara'],
  },
  {
    state: 'Haryana',
    region: 'Chandigarh',
    cities: ['Faridabad', 'Gurgaon', 'Kurukshetra'],
  },
  {
    state: 'Himachal Pradesh',
    region: 'Chandigarh',
    cities: ['Hamirpur', 'Shimla'],
  },
  {
    state: 'Jammu & Kashmir',
    region: 'Chandigarh',
    cities: ['Jammu', 'Srinagar'],
  },
  {
    state: 'Jharkhand',
    region: 'Patna',
    cities: ['Dhanbad', 'Jamshedpur', 'Ranchi'],
  },
  {
    state: 'Karnataka',
    region: 'Bengaluru',
    cities: ['Belgaum', 'Bengaluru', 'Dharwad', 'Gulbarga', 'Mangalore', 'Mysore'],
  },
  {
    state: 'Kerala',
    region: 'Bengaluru',
    cities: ['Calicut', 'Ernakulam', 'Kollam', 'Kottayam', 'Palakkad', 'Thrissur', 'Trivandrum'],
  },
  {
    state: 'Madhya Pradesh',
    region: 'Mumbai',
    cities: ['Bhopal', 'Gwalior', 'Indore', 'Jabalpur'],
  },
  {
    state: 'Maharashtra',
    region: 'Mumbai',
    cities: [
      'Amravati',
      'Aurangabad',
      'Jalgaon',
      'Kolhapur',
      'Mumbai',
      'Nagpur',
      'Nanded',
      'Nashik',
      'Pune',
      'Solapur',
    ],
  },
  { state: 'Manipur', region: 'Kolkata', cities: ['Imphal'] },
  { state: 'Meghalaya', region: 'Kolkata', cities: ['Shillong'] },
  { state: 'Mizoram', region: 'Kolkata', cities: ['Aizawl'] },
  { state: 'Nagaland', region: 'Kolkata', cities: ['Dimapur'] },
  {
    state: 'Odisha',
    region: 'Kolkata',
    cities: ['Bhubaneswar', 'Rourkela', 'Sambalpur'],
  },
  { state: 'Puducherry', region: 'Chennai', cities: ['Puducherry'] },
  {
    state: 'Punjab',
    region: 'Chandigarh',
    cities: ['Chandigarh', 'Jalandhar', 'Ludhiana', 'Amritsar'],
  },
  {
    state: 'Rajasthan',
    region: 'Chandigarh',
    cities: ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur'],
  },
  { state: 'Sikkim', region: 'Kolkata', cities: ['Bardang'] },
  {
    state: 'Tamil Nadu',
    region: 'Chennai',
    cities: [
      'Chennai-Avadi',
      'Chennai-South',
      'Coimbatore',
      'Erode',
      'Kanchipuram',
      'Madurai',
      'Salem',
      'Thanjavur',
      'Tiruchirappalli',
      'Tirunelveli',
      'Vellore',
    ],
  },
  {
    state: 'Telangana',
    region: 'Hyderabad',
    cities: ['Hyderabad', 'Warangal'],
  },
  { state: 'Tripura', region: 'Kolkata', cities: ['Agartala'] },
  {
    state: 'Uttar Pradesh',
    region: 'Lucknow',
    cities: [
      'Agra',
      'Allahabad',
      'Ghaziabad',
      'Gorakhpur',
      'Greater Noida',
      'Kanpur',
      'Lucknow',
      'Meerut',
      'Varanasi',
    ],
  },
  {
    state: 'Uttarakhand',
    region: 'Chandigarh',
    cities: ['Dehradun', 'Haldwani', 'Roorkee'],
  },
  {
    state: 'West Bengal',
    region: 'Kolkata',
    cities: ['Asansol', 'Adisaptagram', 'Durgapur', 'Kolkata', 'Siliguri'],
  },
];

const examRegionKeys = [
  'Delhi',
  'Chennai',
  'Bengaluru',
  'Hyderabad',
  'Mumbai',
  'Kolkata',
  'Patna',
  'Chandigarh',
  'Lucknow',
];

const examRegionMeta = computed(() =>
  examRegionKeys.map((key) => {
    const rows = examCitiesData.filter((row) => row.region === key);
    const cityCount = rows.reduce((sum, row) => sum + row.cities.length, 0);
    return {
      key,
      emoji: '📍',
      stateCount: rows.length,
      cityCount,
    };
  })
);

function selectExamRegion(region) {
  activeRegion.value = region;
}

function resetExamRegion() {
  activeRegion.value = null;
}

const filteredExamCities = computed(() => {
  if (!activeRegion.value) return [];
  const q = citySearch.value.trim().toLowerCase();
  return examCitiesData.filter((row) => {
    if (row.region !== activeRegion.value) return false;
    if (!q) return true;
    return (
      row.state.toLowerCase().includes(q) || row.cities.some((c) => c.toLowerCase().includes(q))
    );
  });
});
</script>

<style scoped src="./study-shared.css"></style>

<style scoped>
/* ─── Exam Cities ───────────────────────────────────────────────────── */

/* Region sidebar + panel (mirrors the Study Corner level picker above) */
.ec-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.75rem;
  align-items: start;
}

.ec-sidebar {
  display: flex;
  flex-direction: column;
  height: 580px;
  gap: 0.75rem;
}

.ec-sidebar-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(212, 160, 23, 0.3) transparent;
}

.ec-sidebar-cards::-webkit-scrollbar {
  width: 5px;
}
.ec-sidebar-cards::-webkit-scrollbar-thumb {
  background: rgba(212, 160, 23, 0.3);
  border-radius: 99px;
}

.ec-sidebar-card {
  background: var(--surface);
  border: 1px solid rgba(212, 160, 23, 0.15);
  border-radius: 14px;
  padding: 1.4rem 1.3rem;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  flex-shrink: 0;
}

.ec-sidebar-card:hover {
  border-color: rgba(212, 160, 23, 0.4);
  background: rgba(212, 160, 23, 0.04);
}

.ec-sidebar-card.active {
  border-color: var(--accent);
  background: rgba(212, 160, 23, 0.07);
  box-shadow: 0 0 0 2px rgba(212, 160, 23, 0.2);
}

.ec-sidebar-card.active .ec-sidebar-arrow {
  color: var(--accent);
  transform: translateX(3px);
}

.ec-sidebar-card-top {
  display: flex;
  gap: 0.65rem;
  align-items: center;
  margin-bottom: 0.85rem;
}

.ec-sidebar-emoji {
  font-size: 1.3rem;
  flex-shrink: 0;
}

.ec-sidebar-meta {
  flex: 1;
  min-width: 0;
}

.ec-sidebar-arrow {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  color: var(--text3);
  transition: all 0.2s;
}

.ec-panel-wrap {
  display: flex;
  flex-direction: column;
  height: 580px;
}

/* Fixed-height box for the cities side: header stays put, list scrolls */
.ec-panel-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
}

.ec-strip-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 1.25rem 1.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ec-cities-scroll {
  background: var(--surface);
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(212, 160, 23, 0.3) transparent;
}

.ec-cities-scroll::-webkit-scrollbar {
  width: 5px;
}
.ec-cities-scroll::-webkit-scrollbar-thumb {
  background: rgba(212, 160, 23, 0.3);
  border-radius: 99px;
}

@media (max-width: 900px) {
  .ec-layout {
    grid-template-columns: 1fr;
  }
  .ec-sidebar-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .ec-sidebar-cards {
    grid-template-columns: 1fr;
  }
}

.ec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.ec-card {
  padding: 1.1rem 1.25rem;
}

.ec-state {
  font-family: Cinzel, serif;
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--accent);
  margin-bottom: 0.6rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid rgba(212, 160, 23, 0.15);
}

.ec-cities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.ec-city-tag {
  font-size: 0.72rem;
  background: rgba(212, 160, 23, 0.06);
  border: 1px solid rgba(212, 160, 23, 0.15);
  color: var(--text2);
  padding: 0.18rem 0.55rem;
  border-radius: 99px;
}

.ec-info-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.ec-info-card {
  padding: 1.5rem;
  text-align: center;
}

@media (max-width: 700px) {
  .ec-info-row {
    grid-template-columns: 1fr;
  }
}
</style>
