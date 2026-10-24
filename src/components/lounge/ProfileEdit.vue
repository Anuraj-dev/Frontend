<!--
  The name card. A member edits the preferred name and optional phone (spec 002 §2); roll and
  region come from the roster and the coordinator fixes them. Full name and gender are asked
  here only while empty, and set once (complete_my_profile); after that an admin corrects them.
  - variant 'profile': "Edit profile" from the profile menu.
  - variant 'ghat': the ghat name card reopened over the Lounge (openNameCard() in state.js:
    the lantern's "Name your lantern" chip, the crest face). The same band card and fields
    as the tour's ghat, without the tour, with a live preview of the lantern / kite.
  On save it sets state.nameFlight ({ name, from: the input's rect }) so Home can fly the
  name onto the face. An empty name is allowed: it means "no name" (never the roll).
-->
<template>
  <LoungeDialog
    ref="dlg"
    class="pe-dlg"
    :class="{ 'pe-ghat': ghat }"
    labelledby="pe-h"
    @close="emit('close')"
  >
    <form class="pe" @submit.prevent="save">
      <div class="pe-top">
        <div>
          <p class="gp-kicker">{{ ghat ? 'The ghat' : 'Your profile' }}</p>
          <h2 id="pe-h" class="ed-h">{{ heading }}</h2>
        </div>
        <div v-if="ghat && Beacon" class="pe-preview" aria-hidden="true" inert>
          <component :is="Beacon" :name="draftClean" :cta="false" :halo="false" :tappable="false" />
        </div>
      </div>

      <label v-if="need.name" class="pe-field">
        <span>Full name</span>
        <input
          ref="fullEl"
          v-model="fullDraft"
          aria-required="true"
          maxlength="200"
          autocomplete="name"
          placeholder="As on your IITM records"
          aria-describedby="pe-full-help"
        />
        <small id="pe-full-help">Set once. Your Regional Coordinator corrects mistakes.</small>
      </label>

      <label v-if="need.gender" class="pe-field">
        <span>Gender</span>
        <select
          v-model="genderDraft"
          :aria-describedby="need.name ? 'pe-full-help' : 'pe-gender-help'"
        >
          <option value="">Choose</option>
          <option>Female</option>
          <option>Male</option>
        </select>
        <!-- The full name's note above covers both when both are asked. -->
        <small v-if="!need.name" id="pe-gender-help"
          >Set once. Your Regional Coordinator corrects mistakes.</small
        >
      </label>

      <label class="pe-field">
        <span>{{ ghat ? 'Your name' : 'Name in the Lounge' }}</span>
        <input
          ref="nameEl"
          v-model="draft"
          maxlength="60"
          autocomplete="name"
          placeholder="The name you go by"
          aria-describedby="pe-name-help"
        />
        <small id="pe-name-help">{{ help }}</small>
      </label>

      <label class="pe-field">
        <span>Phone <small>optional</small></span>
        <input
          v-model="phoneDraft"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          maxlength="20"
          placeholder="For later forms"
        />
      </label>

      <div class="pe-ro gp-inset">
        <div v-if="!need.name && member.full_name">
          <span class="pe-k">Full name</span>
          <span class="pe-v">{{ member.full_name }}</span>
        </div>
        <div v-if="!need.gender && member.gender">
          <span class="pe-k">Gender</span>
          <span class="pe-v">{{ member.gender }}</span>
        </div>
        <div>
          <span class="pe-k">Roll</span>
          <span class="pe-v tnum">{{ member.roll }}</span>
        </div>
        <div>
          <span class="pe-k">Region</span>
          <span class="pe-v">{{ member.region.name || 'Not set' }}</span>
        </div>
        <p class="pe-wrong">
          <template v-if="!member.region_id">
            Pick your region once. It is saved immediately.
            <button type="button" class="gp-link" @click="regionOpen = true">
              Choose your region
            </button>
          </template>
          <template v-else>
            Region changes need approval from {{ member.coordinator.name }}.
            <button type="button" class="gp-link" @click="regionOpen = true">
              Request a change
            </button>
          </template>
        </p>
      </div>

      <div
        v-if="latestRegionRequest || latestReviewedRegionRequest"
        class="pe-region-result gp-inset"
        role="status"
      >
        <b v-if="latestRegionRequest">{{ regionRequestStatus }}</b>
        <p v-if="latestReviewedRegionRequest?.review_note">
          <span>Review note:</span> {{ latestReviewedRegionRequest.review_note }}
        </p>
      </div>

      <p v-if="certName" class="pe-cert">
        Your certificates print <b>{{ certName }}</b
        >. Changing your Lounge name does not change them.
      </p>
      <p v-else class="pe-cert">
        A certificate name is asked only when an event releases one for you.
      </p>

      <p v-if="error" class="ff-err" role="alert">{{ error }}</p>
      <p v-if="saved" class="pe-saved" role="status">Saved.</p>
      <div class="reg-acts">
        <button type="submit" class="gp-btn is-big" :disabled="busy">
          {{ busy ? 'Saving…' : 'Save' }}
        </button>
        <button type="button" class="gp-btn is-ghost is-big" @click="dlg?.close()">
          {{ ghat ? 'Not now' : 'Cancel' }}
        </button>
      </div>
    </form>
    <RegionSelect v-if="regionOpen" @close="regionOpen = false" />
  </LoungeDialog>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, shallowRef } from 'vue';
import { errorText } from '../../lib/auth.js';
import LoungeDialog from './LoungeDialog.vue';
import RegionSelect from './RegionSelect.vue';
import { member } from './fixtures.js';
import { lounge, missingDetails, refreshLounge, saveMyDetails } from './session.js';
import {
  certName,
  cleanName,
  mode,
  nameFlight,
  nameOn,
  preferredName,
  savePreferredName,
} from './state.js';

const props = defineProps({ variant: { type: String, default: 'profile' } });
const emit = defineEmits(['close']);
const ghat = computed(() => props.variant === 'ghat');
const dlg = ref(null);
const nameEl = ref(null);
const fullEl = ref(null);
// Asked once per opening: the fields stay put while this card is open, even after they save.
const need = ghat.value ? { name: false, gender: false } : { ...missingDetails.value };
const fullDraft = ref('');
const genderDraft = ref('');
const draft = ref(preferredName.value);
const phoneDraft = ref(member.phone || '');
const draftClean = computed(() => cleanName(draft.value));
const saved = ref(false);
const busy = ref(false);
const error = ref('');
const regionOpen = ref(false);
const memberRegionRequests = computed(() =>
  lounge.regionRequests
    .filter((request) => request.member_id === member.id)
    .sort((a, b) => Date.parse(b.requested_at || '') - Date.parse(a.requested_at || ''))
);
const latestRegionRequest = computed(() => memberRegionRequests.value[0] ?? null);
const latestReviewedRegionRequest = computed(() =>
  memberRegionRequests.value.find((request) => request.status !== 'pending' && request.review_note)
);
const regionRequestStatus = computed(() =>
  latestRegionRequest.value?.status === 'pending'
    ? 'Your region change request is awaiting review.'
    : `Your region change request was ${latestRegionRequest.value?.status}.`
);

const object = computed(() => (mode.value === 'night' ? 'lantern' : 'kite'));
const heading = computed(() =>
  ghat.value ? `Name your ${object.value}` : 'What should we call you?'
);
const help = computed(() =>
  ghat.value
    ? `It goes on your ${object.value}, and it's what the house calls you.`
    : `The name on your lantern and kite, and what the house calls you.`
);

/* The live preview is the motion designer's NameBeacon (home/NameBeacon.vue). Loaded only
   if it exists, so this card works before it lands. */
const beacons = import.meta.glob('./home/NameBeacon.vue');
const Beacon = shallowRef(null);
if (beacons['./home/NameBeacon.vue']) {
  beacons['./home/NameBeacon.vue']()
    .then((m) => (Beacon.value = m.default))
    .catch(() => {});
}

onMounted(() => {
  if (!ghat.value) void refreshLounge();
  nextTick(() => (fullEl.value ?? nameEl.value)?.focus());
});

async function save() {
  if (busy.value) return;
  error.value = '';
  const fullName = need.name ? cleanName(fullDraft.value) : null;
  const gender = (need.gender && genderDraft.value) || null;
  if (need.name && fullName.length < 2) {
    error.value = 'Add your full name as on your IITM records.';
    fullEl.value?.focus();
    return;
  }
  busy.value = true;
  const from = nameEl.value?.getBoundingClientRect();
  try {
    // Details first: if they are refused, nothing else is saved. Resending them after a later
    // failure is harmless.
    if (fullName || gender) await saveMyDetails({ full_name: fullName, gender });
    await savePreferredName(draft.value, phoneDraft.value.trim() || null);
    nameOn.value = true;
    if (preferredName.value) {
      nameFlight.value = {
        name: preferredName.value,
        from: from && { left: from.left, top: from.top, width: from.width, height: from.height },
        at: Date.now(),
      };
    }
    if (!ghat.value) {
      saved.value = true;
      await new Promise((r) => setTimeout(r, 450));
    }
    dlg.value?.close();
  } catch (err) {
    error.value = errorText(err);
  } finally {
    busy.value = false;
  }
}
</script>
