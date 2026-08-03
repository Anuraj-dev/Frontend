import { createRouter, createWebHashHistory } from 'vue-router';

// Every route is lazy so a visitor to "/" downloads only the homepage chunk.
// Paths must stay literal strings — Vite needs them statically analysable to
// emit one chunk per view.
const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  { path: '/about', component: () => import('../views/AboutView.vue') },
  { path: '/events', component: () => import('../views/EventsView.vue') },
  { path: '/study', component: () => import('../views/StudyView.vue') },
  { path: '/teams', component: () => import('../views/TeamsView.vue') },
  { path: '/contact', component: () => import('../views/ContactView.vue') },
  { path: '/login', component: () => import('../views/LoginView.vue') },
  {
    path: '/lounge',
    component: () => import('../views/MembersLoungeView.vue'),
    meta: { requiresAuth: true },
  },
  { path: '/dashboard', component: () => import('../views/DashboardView.vue') },

  // Community + sub-pages
  { path: '/community', component: () => import('../views/CommunityView.vue') },
  {
    path: '/community/technical',
    component: () => import('../views/TechnicalView.vue'),
  },
  {
    path: '/community/cultural',
    component: () => import('../views/CulturalView.vue'),
  },
  {
    path: '/community/esports',
    component: () => import('../views/ESportsView.vue'),
  },

  // Meetups + region sub-pages
  { path: '/meetups', component: () => import('../views/MeetupsView.vue') },
  {
    path: '/meetups/delhi-ncr',
    component: () => import('../views/meetups/DelhiMeetups.vue'),
  },
  {
    path: '/meetups/mumbai',
    component: () => import('../views/meetups/MumbaiMeetups.vue'),
  },
  {
    path: '/meetups/bangalore',
    component: () => import('../views/meetups/BangaloreMeetups.vue'),
  },
  {
    path: '/meetups/kolkata',
    component: () => import('../views/meetups/KolkataMeetups.vue'),
  },
  {
    path: '/meetups/hyderabad',
    component: () => import('../views/meetups/HyderabadMeetups.vue'),
  },
  {
    path: '/meetups/patna',
    component: () => import('../views/meetups/PatnaMeetups.vue'),
  },
  {
    path: '/meetups/chandigarh',
    component: () => import('../views/meetups/ChandigarhMeetups.vue'),
  },
  {
    path: '/meetups/chennai',
    component: () => import('../views/meetups/ChennaiMeetups.vue'),
  },
  {
    path: '/meetups/lucknow',
    component: () => import('../views/meetups/LucknowMeetups.vue'),
  },

  // Certificate verification (public)
  {
    path: '/verify-certificate',
    component: () => import('../views/VerifyCertificateView.vue'),
  },

  // 404 catch-all
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
  },
];

// With lazy routes the view mounts after the navigation resolves, so an anchor
// target usually does not exist yet when scrollBehavior runs. Wait for it
// instead of silently landing at the top of the page.
const ANCHOR_TIMEOUT_MS = 1500;

// Mirrors vue-router's own lookup: ids are resolved with getElementById so a
// hash that is not a valid CSS selector (e.g. "#2024-recap") still matches.
function findAnchor(hash) {
  if (hash.startsWith('#')) {
    const byId = document.getElementById(hash.slice(1));
    if (byId) return byId;
  }
  try {
    return document.querySelector(hash);
  } catch {
    return null;
  }
}

// Bumped on every navigation so a wait left over from a superseded navigation
// resolves to null instead of scrolling whatever page the user is on now.
let scrollToken = 0;

function waitForAnchor(hash, token) {
  const existing = findAnchor(hash);
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve) => {
    let timer;
    const finish = (el) => {
      clearTimeout(timer);
      observer.disconnect();
      resolve(token === scrollToken ? el : null);
    };
    const observer = new MutationObserver(() => {
      const el = findAnchor(hash);
      if (el) finish(el);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    timer = setTimeout(() => finish(findAnchor(hash)), ANCHOR_TIMEOUT_MS);
  });
}

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to) {
    const token = ++scrollToken;
    if (to.hash) {
      // Falsy means "leave the scroll alone" — same as the old string-selector
      // form, which vue-router ignored when the element did not exist.
      return waitForAnchor(to.hash, token).then((el) =>
        el && token === scrollToken ? { el, behavior: 'smooth' } : false
      );
    }
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('sundarbans_auth_token');
    token ? next() : next('/login');
  } else {
    next();
  }
});

// A tab left open across a deploy asks for chunk files the new build no longer
// has. Reload once onto the target URL to pick up the fresh manifest; the
// sessionStorage marker stops a genuinely broken chunk from looping forever.
const CHUNK_RELOAD_KEY = 'sundarbans_chunk_reload';

function isChunkLoadError(error) {
  const message = String(error?.message ?? error ?? '');
  // Chrome and Firefox both say "dynamically imported module"; Safari says
  // "Importing a module script failed". Matching bare "Failed to fetch" would
  // add no coverage but would hard-reload the tab on any future async guard
  // whose fetch blips.
  return (
    /dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message)
  );
}

function readReloadMarker() {
  try {
    return sessionStorage.getItem(CHUNK_RELOAD_KEY);
  } catch {
    return null;
  }
}

function writeReloadMarker(value) {
  try {
    if (value === null) sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    else sessionStorage.setItem(CHUNK_RELOAD_KEY, value);
    return true;
  } catch {
    return false;
  }
}

router.onError((error, to) => {
  if (!isChunkLoadError(error)) return;
  if (readReloadMarker() === to.fullPath) return;
  // Storage disabled (private mode / embedded webview) means the loop guard
  // cannot be armed. One broken page beats an unbreakable reload loop.
  if (!writeReloadMarker(to.fullPath)) return;
  window.location.hash = to.fullPath;
  window.location.reload();
});

router.afterEach(() => {
  if (readReloadMarker() !== null) writeReloadMarker(null);
});
