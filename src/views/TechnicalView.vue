<template>
  <div class="community-page community-tech">
    <PageHero
      bg-image="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=80&auto=format&fit=crop"
      breadcrumb-title="Community"
      title="Tech"
      accent-title="Community"
      subtitle="Build. Code. Innovate. — where engineers and thinkers come together."
    />

    <CommunitySection
      tag="Upcoming Events"
      title="What's"
      accent="Coming Up"
      desc="Events planned ahead — mark your calendar and show up."
    >
      <UpcomingEventCards
        :events="upcomingEvents"
        empty-text="🛠️ No upcoming events right now — check back soon!"
      />
    </CommunitySection>

    <CommunitySection
      alt
      tag="Past Events"
      title="What We've"
      accent="Done"
      desc="A record of everything we've built, shipped, and learned from."
    >
      <PastEventCards :events="allPastEvents" />
    </CommunitySection>

    <CommunitySection
      tag="Hall of Fame"
      title="Event"
      accent="Winners"
      desc="The members who competed, solved, and shipped their way to the top."
    >
      <WinnerCards :events="eventWinners" no-winner-text="No winner — no one qualified" />
    </CommunitySection>

    <CommunitySection
      alt
      tag="The Team"
      title="People Behind the"
      accent="Community"
      desc="The leads and members who keep things running."
    >
      <TeamCards :members="team" />
    </CommunitySection>
  </div>
</template>

<script setup>
import PageHero from '../components/PageHero.vue';
import CommunitySection from '../components/community/CommunitySection.vue';
import UpcomingEventCards from '../components/community/UpcomingEventCards.vue';
import PastEventCards from '../components/community/PastEventCards.vue';
import WinnerCards from '../components/community/WinnerCards.vue';
import TeamCards from '../components/community/TeamCards.vue';
import { useScrollReveal } from '../composables/useAnimations.js';
import { useEventDateFilter } from '../composables/useEventDateFilter.js';
import '../assets/community.css';

const imgVibeCoding =
  'https://res.cloudinary.com/l59gy0g2/image/upload/f_auto,q_auto:good,w_1000,c_limit/v1785911352/sundarbans/src/assets/Community_Events/Technical/Vibe_Coding_a_SAAS_application.jpg';
const imgCodingApt =
  'https://res.cloudinary.com/l59gy0g2/image/upload/f_auto,q_auto:good,w_1000,c_limit/v1785911347/sundarbans/src/assets/Community_Events/Technical/Coding_Aptitude_Challenge.jpg';
const imgOpenMicTech =
  'https://res.cloudinary.com/l59gy0g2/image/upload/f_auto,q_auto:good,w_1000,c_limit/v1785911349/sundarbans/src/assets/Community_Events/Technical/Open_Mic.jpg';
const imgStatAnalysis =
  'https://res.cloudinary.com/l59gy0g2/image/upload/f_auto,q_auto:good,w_1000,c_limit/v1785911350/sundarbans/src/assets/Community_Events/Technical/Statistical_Analysis_Challenge.jpg';
const imgDarkWeb =
  'https://res.cloudinary.com/l59gy0g2/image/upload/f_auto,q_auto:good,w_1000,c_limit/v1785911348/sundarbans/src/assets/Community_Events/Technical/Dark_Web_Challenge.jpg';
const imgUbuntuQuiz =
  'https://res.cloudinary.com/l59gy0g2/image/upload/f_auto,q_auto:good,w_1000,c_limit/v1785911351/sundarbans/src/assets/Community_Events/Technical/Ubuntu_Mastery_Quiz.jpg';

useScrollReveal();

// ─── All upcoming events ───────────────────────────────────────────────────
// Add `dateISO: 'YYYY-MM-DD'` OR use `day`/`month` for auto-migration.
// Once the date passes the event moves to Past Events automatically.
const _upcomingRaw = [
  {
    id: 1,
    title: 'Hackathon: Build in 24hrs',
    type: 'Hackathon',
    description:
      'A 24-hour build sprint where teams solve real-world problems using any stack they choose.',
    day: '22',
    month: 'APR',
    time: '9:00 AM',
    venue: 'Main Hall, Block A',
    image: imgVibeCoding,
    registerLink: '#',
  },
  {
    id: 2,
    title: 'AI/ML Paper Reading Club',
    type: 'Workshop',
    description: 'We break down a recent ML research paper together — no PhD required.',
    day: '28',
    month: 'APR',
    time: '6:00 PM',
    venue: 'Room 204, Tech Block',
    image: imgStatAnalysis,
    registerLink: '#',
  },
  {
    id: 3,
    title: 'Open Source Contribution Drive',
    type: 'Sprint',
    description: 'Pick an issue, raise a PR, ship it. Mentors available for first-timers.',
    day: '05',
    month: 'MAY',
    time: '3:00 PM',
    venue: 'Computer Lab 3, Block B',
    image: imgCodingApt,
    registerLink: '#',
  },
];

// ─── Static past events ────────────────────────────────────────────────────
const _pastRaw = [
  {
    id: 1,
    title: 'Vibe Coding a SaaS Application Workshop',
    type: 'Workshop',
    description:
      'Introduced members to modern software development by building a SaaS product from scratch with AI-assisted development.',
    date: '11 Nov 2025 | 9:30 PM',
    attendees: '50+',
    image: imgVibeCoding,
  },
  {
    id: 2,
    title: 'Coding Aptitude Challenge',
    type: 'Competition',
    description:
      'A logic-based challenge testing analytical thinking, debugging, and problem-solving through code snippets and output prediction.',
    date: '16 Nov 2025 | 8:30 PM',
    attendees: '50+',
    image: imgCodingApt,
  },
  {
    id: 3,
    title: 'Open Mic – Journey Into Tech',
    type: 'Open Mic',
    description:
      'An inspiring session where members shared their personal experiences, challenges, and tech learning journeys in a supportive space.',
    date: '2 Dec 2025 | 8:00 PM',
    attendees: '50+',
    image: imgOpenMicTech,
  },
  {
    id: 4,
    title: 'Statistical Analysis Challenge',
    type: 'Challenge',
    description:
      'Participants worked with real-world survey data, using analytical tools to study trends, create charts, and draw logical conclusions.',
    date: '5-7 Dec 2025 | Online',
    attendees: '50+',
    image: imgStatAnalysis,
  },
  {
    id: 5,
    title: 'Dark Web Fundamentals Session',
    type: 'Session',
    description:
      'An informative workshop introducing the basics of the dark web, the Tor network, cybersecurity risks, and ethical concerns.',
    date: '24 Mar 2025 | 7:00 PM',
    attendees: '50+',
    image: imgDarkWeb,
  },
  {
    id: 6,
    title: 'Ubuntu Mastery Quiz',
    type: 'Quiz',
    description:
      "A competitive technical assessment conducted after the learning series to evaluate participants' understanding of Linux fundamentals.",
    date: '5 Mar 2026 | 8:30 PM',
    attendees: '50+',
    image: imgUbuntuQuiz,
  },
];

// Apply dynamic date-checking: upcoming → past when date passes
const { upcomingEvents, allPastEvents } = useEventDateFilter(_upcomingRaw, _pastRaw);

const eventWinners = [
  {
    id: 1,
    title: 'Website Design Challenge',
    type: 'Competition',
    noWinner: false,
    winners: [
      { name: 'Arshpreet Singh', email: 'winner@sundarbans.in' },
      { name: 'Varsha Jangid', email: 'winner@sundarbans.in' },
      { name: 'Shivani Mishra', email: 'winner@sundarbans.in' },
    ],
  },
  {
    id: 2,
    title: 'Coding Aptitude Challenge',
    type: 'Competition',
    noWinner: false,
    winners: [
      { name: 'Arnab Saikia', email: 'winner@sundarbans.in' },
      { name: 'Sri Sowndharya B G', email: 'winner@sundarbans.in' },
      { name: 'Akrish Chaurasia', email: 'winner@sundarbans.in' },
    ],
  },
  {
    id: 3,
    title: 'Statistical Analysis Challenge',
    type: 'Challenge',
    noWinner: false,
    winners: [
      { name: 'Shivani Mishra', email: 'winner@sundarbans.in' },
      { name: 'Riddhi Shete', email: 'winner@sundarbans.in' },
      { name: 'Swati Pandey', email: 'winner@sundarbans.in' },
    ],
  },
  {
    id: 4,
    title: 'Ubuntu Mastery Quiz',
    type: 'Quiz',
    noWinner: false,
    winners: [
      { name: 'Arshan Ali Khan', email: 'winner@sundarbans.in' },
      { name: 'Saptajit Saha', email: 'winner@sundarbans.in' },
      { name: 'Hira Irshad', email: 'winner@sundarbans.in' },
    ],
  },
  {
    id: 5,
    title: 'Cyber Security Quiz',
    type: 'Quiz',
    noWinner: false,
    winners: [
      { name: 'Bhavana S', email: 'winner@sundarbans.in' },
      { name: 'Ishan Dipta Garai', email: 'winner@sundarbans.in' },
      { name: 'Sabal Sneh', email: 'winner@sundarbans.in' },
    ],
  },
  {
    id: 6,
    title: 'Operation NEXUS',
    type: 'Challenge',
    noWinner: true,
    winners: [],
  },
];

const team = [
  {
    name: 'Abhishek Mourya',
    role: 'Co-Head',
    level: 'Diploma - Data Science',
    photo: '#',
    email: 'mailto:25f2005876@ds.study.iitm.ac.in',
    linkedin: 'https://www.linkedin.com/in/abhishekmauryaofficialin/',
    instagram: 'https://www.instagram.com/abhishekmauryaofficialig',
  },
  {
    name: 'Soumya Asati',
    role: 'Coordinator',
    level: 'Diploma - Data Science',
    photo: '#',
    email: 'mailto:25f3005469@ds.study.iitm.ac.in',
    linkedin: 'https://www.linkedin.com/in/soumya-asati-3503b6371/',
    instagram: 'https://www.instagram.com/soumyaasati.27',
  },
  {
    name: 'Aditya Kumar',
    role: 'Coordinator',
    level: 'Diploma - Data Science',
    photo: '#',
    email: 'mailto:25f1002549@ds.study.iitm.ac.in',
    linkedin: 'https://www.linkedin.com/in/aditya-kumar9717-/',
    instagram: 'https://www.instagram.com/17_adi_kr',
  },
  {
    name: 'Tanu Parashar',
    role: 'Coordinator',
    level: 'Diploma - Data Science',
    photo: '#',
    email: 'mailto:25f2005999@ds.study.iitm.ac.in',
    linkedin: 'https://www.linkedin.com/in/tanu-parashar-45759327a',
    instagram: 'https://www.instagram.com/tapsi_202',
  },
  {
    name: 'Vivekanand kumawat',
    role: 'Coordinator',
    level: 'Diploma - Data Science',
    photo: '#',
    email: 'mailto:23f2004577@ds.study.iitm.ac.in',
    linkedin: 'www.linkedin.com/in/vivekanand-kumawat-b042802aa',
    instagram: 'vivekanandkumawat261',
  },
];
</script>
