<template>
  <div>
    <PageHero
      bg-image="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1920&q=80&auto=format&fit=crop"
      breadcrumb-title="Study Corner"
      title="Study"
      accent-title="Corner"
      subtitle="Comprehensive academic resources for Foundation, Diploma and BS level students"
    />

    <ResourceBrowser v-model:search="search" />

    <DoubtsBoard :search="search" />

    <StudentTools />

    <ExamCities />

    <ContributeCards />
  </div>
</template>

<script setup>
import { ref } from 'vue';

import { useScrollReveal } from '../composables/useAnimations.js';
import PageHero from '../components/PageHero.vue';
import ResourceBrowser from '../components/study/ResourceBrowser.vue';
import DoubtsBoard from '../components/study/DoubtsBoard.vue';
import StudentTools from '../components/study/StudentTools.vue';
import ExamCities from '../components/study/ExamCities.vue';
import ContributeCards from '../components/study/ContributeCards.vue';

useScrollReveal();

// The one piece of state two sections share: the resource browser owns the
// search box, the doubts board filters against the same query.
const search = ref('');
</script>
