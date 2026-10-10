// Fork-only testing gate. Not for upstream: the list ships in the client bundle, so it keeps
// casual visitors out but does not protect the data behind the site. Emails are lowercase.
export const TESTING_EMAILS = [
  'sundarbans-webad@ds.study.iitm.ac.in',
  'sundarbans-sec@ds.study.iitm.ac.in',
  'sundarbans-ds@ds.study.iitm.ac.in',
  '24f2008153@ds.study.iitm.ac.in',
  '23f3001340@ds.study.iitm.ac.in',
  '24f3004018@ds.study.iitm.ac.in',
  '26f2300048@ae.study.iitm.ac.in',
  'rushabhkapse32@gmail.com',
];

const KEY = 'sundarbans-testing-gate';

export function isUnlocked() {
  return sessionStorage.getItem(KEY) === '1';
}

export function tryUnlock(email) {
  if (!TESTING_EMAILS.includes(email.trim().toLowerCase())) return false;
  sessionStorage.setItem(KEY, '1');
  return true;
}
