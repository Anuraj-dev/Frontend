// Fork-only testing gate. Not for upstream: the list ships in the client bundle, so it keeps
// casual visitors out but does not protect the data behind the site. Emails are lowercase.
export const TESTING_EMAILS = [];

const KEY = 'sundarbans-testing-gate';

export function isUnlocked() {
  return sessionStorage.getItem(KEY) === '1';
}

export function tryUnlock(email) {
  if (!TESTING_EMAILS.includes(email.trim().toLowerCase())) return false;
  sessionStorage.setItem(KEY, '1');
  return true;
}
