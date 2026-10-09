// Live Lounge payload: one hydrate from loadLounge(), then member UI reads these arrays.
// Visual art stays in events.js / home; this file holds no sample notices, groups or certificates.
import { computed, reactive } from 'vue';
import { auth, errorText } from '../../lib/auth.js';
import { lower } from '../../lib/house.js';
import {
  confirmCertificateName as persistCertName,
  getAvailableCohorts,
  getFormInvite,
  groupFormsForMember,
  listGroups,
  loadLounge,
  markTourSeen as persistTour,
  requestCertificateNameChange,
  requestRegionChange,
  selectInitialRegion,
  setNoticeState,
  submitForm,
  updateProfile,
} from '../../lib/lounge.js';
import { member } from './fixtures.js';
import { applyProfile, certName, preferredName, tourSeen } from './state.js';

export const lounge = reactive({
  ready: false,
  error: '',
  events: [],
  forms: [],
  notices: [],
  certificates: [],
  regionRequests: [],
  groups: [],
  regions: [],
  cohorts: { current: '', next: '', options: [] },
  inviteByForm: {},
});

const asList = (value) => (Array.isArray(value) ? value : []);

function coordinatorFor(regionName) {
  if (!regionName || /international/i.test(regionName)) {
    return { name: 'Upper House Council', role: 'Upper House Council' };
  }
  const rc = lower.find(
    (p) => p.region === regionName || (regionName === 'Delhi NCR' && p.region === 'Delhi')
  );
  return { name: rc?.name ?? 'Your Regional Coordinator', role: 'Regional Coordinator' };
}

export function fillMember(profile) {
  if (!profile) return;
  const regionName = profile.region?.name ?? '';
  Object.assign(member, {
    id: profile.id,
    full_name: profile.full_name ?? '',
    preferred_name: profile.preferred_name ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? '',
    roll: (profile.member_code || '').toUpperCase(),
    cohort: profile.cohort ?? '',
    region_id: profile.region_id ?? null,
    region: { code: profile.region?.code ?? '', name: regionName },
    coordinator: coordinatorFor(regionName),
    certificate_name: profile.certificate_name ?? '',
    tour_seen_at: profile.tour_seen_at ?? null,
  });
  applyProfile(profile);
}

async function loadRegions() {
  const { supabase } = await import('../../lib/supabase.js');
  const { data, error } = await supabase.from('regions').select('id, code, name').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function hydrateLounge() {
  lounge.error = '';
  const data = await loadLounge();
  if (data.profile) {
    auth.profile = { ...auth.profile, ...data.profile };
    fillMember(data.profile);
  }
  lounge.events = asList(data.events);
  lounge.forms = asList(data.forms);
  lounge.notices = asList(data.notices);
  lounge.certificates = asList(data.certificates);
  lounge.regionRequests = asList(data.regionRequests);
  const [groups, regions, cohorts] = await Promise.all([
    listGroups(lounge.forms, member.region_id).catch(() => []),
    loadRegions().catch(() => []),
    getAvailableCohorts().catch(() => lounge.cohorts),
  ]);
  lounge.groups = asList(groups);
  lounge.regions = asList(regions);
  if (cohorts) lounge.cohorts = cohorts;
  lounge.ready = true;
  return data;
}

export async function refreshLounge() {
  try {
    await hydrateLounge();
  } catch (err) {
    lounge.error = errorText(err);
    lounge.ready = true;
  }
}

export async function saveMemberProfile({ preferred_name, phone }) {
  const row = await updateProfile({
    preferred_name: preferred_name ?? preferredName.value ?? '',
    phone: phone === undefined ? (member.phone ?? null) : phone,
  });
  auth.profile = { ...auth.profile, ...row };
  fillMember({ ...auth.profile, ...row });
  return row;
}

export async function completeTour() {
  const seen = await persistTour(true);
  tourSeen.value = true;
  if (auth.profile) auth.profile.tour_seen_at = seen;
  member.tour_seen_at = seen;
  return seen;
}

export async function retakeTourOnServer() {
  await persistTour(false);
  tourSeen.value = false;
  if (auth.profile) auth.profile.tour_seen_at = null;
  member.tour_seen_at = null;
}

export async function chooseInitialRegion(regionId) {
  const row = await selectInitialRegion(regionId);
  auth.profile = { ...auth.profile, ...row };
  fillMember({ ...auth.profile, region: row.region ?? auth.profile.region, ...row });
  return row;
}

export async function submitRegionRequest(regionId, reason) {
  const id = await requestRegionChange(regionId, reason);
  await refreshLounge();
  return id;
}

export async function submitLoungeForm(formId, answers, savePhone = false) {
  const result = await submitForm(formId, answers, savePhone);
  if (result?.invite_url) lounge.inviteByForm[formId] = result.invite_url;
  await refreshLounge();
  return result;
}

export async function fetchInvite(formId) {
  const url = await getFormInvite(formId);
  if (url) lounge.inviteByForm[formId] = url;
  return url;
}

export async function readNotice(id) {
  await setNoticeState(id, { read: true, dismiss: false });
  const n = lounge.notices.find((row) => row.id === id);
  if (n) n.read_at = n.read_at || new Date().toISOString();
}

export async function dismissNotice(id) {
  await setNoticeState(id, { read: true, dismiss: true });
  const n = lounge.notices.find((row) => row.id === id);
  if (n) {
    n.read_at = n.read_at || new Date().toISOString();
    n.dismissed_at = n.dismissed_at || new Date().toISOString();
    n.show_banner = false;
  }
}

export async function readAllNotices() {
  await Promise.all(
    lounge.notices.filter((n) => !n.read_at).map((n) => setNoticeState(n.id, { read: true }))
  );
  for (const n of lounge.notices) n.read_at = n.read_at || new Date().toISOString();
}

export async function confirmPrintedName(name) {
  const saved = await persistCertName(name);
  certName.value = saved || name;
  if (auth.profile) {
    auth.profile.certificate_name = certName.value;
    auth.profile.certificate_name_confirmed_at =
      auth.profile.certificate_name_confirmed_at || new Date().toISOString();
  }
  await refreshLounge();
  return saved;
}

export async function askCertNameChange(name, reason) {
  return requestCertificateNameChange(name, reason);
}

export const pendingRegionRequest = computed(() =>
  lounge.regionRequests.find((r) => r.status === 'pending' && r.member_id === member.id)
);

export const openGroupForms = computed(() =>
  groupFormsForMember(lounge.forms, member.region_id).filter(
    (f) => (f.accepting_responses ?? f.is_open) && !f.submitted
  )
);

export const formByEvent = (eventId) => lounge.forms.find((f) => f.event_id === eventId) ?? null;
export const formById = (id) => lounge.forms.find((f) => f.id === id) ?? null;
