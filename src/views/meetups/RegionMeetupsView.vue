<template>
  <NotFoundView v-if="!config" />
  <RegionMeetups v-else :key="slug" :config="config" />
</template>

<script>
import RegionMeetups from '@/components/RegionMeetups.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import { regionConfigs } from './regionConfigs';

// URL slug → regionConfigs key. delhi-ncr is the only mismatch.
const REGION_SLUG_TO_KEY = {
  'delhi-ncr': 'delhi',
  mumbai: 'mumbai',
  bangalore: 'bangalore',
  kolkata: 'kolkata',
  hyderabad: 'hyderabad',
  patna: 'patna',
  chandigarh: 'chandigarh',
  chennai: 'chennai',
  lucknow: 'lucknow',
};

export default {
  name: 'RegionMeetupsView',
  components: { RegionMeetups, NotFoundView },
  computed: {
    slug() {
      return this.$route.params.region;
    },
    config() {
      const key = REGION_SLUG_TO_KEY[this.slug];
      return key ? regionConfigs[key] : null;
    },
  },
};
</script>
