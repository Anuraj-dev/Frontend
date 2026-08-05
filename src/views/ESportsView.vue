<template>
  <div class="community-page community-esports">
    <PageHero
      bg-image="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80&auto=format&fit=crop"
      breadcrumb-title="Community"
      title="E-Sports"
      accent-title="Community"
      subtitle="Play. Compete. Win. — where Sundarbans players grind together."
    />

    <CommunitySection
      tag="Upcoming Events"
      title="What's"
      accent="Coming Up"
      desc="Tournaments and sessions dropping soon — register before slots fill."
    >
      <!-- Local card layout: date badge instead of artwork, so it is not shared -->
      <div
        v-if="upcomingEvents.length === 0"
        style="text-align: center; padding: 3rem 0; color: var(--text2)"
      >
        <p style="font-size: 1.1rem">🎮 No upcoming events right now — check back soon!</p>
      </div>
      <div v-else class="events-grid">
        <div v-for="event in upcomingEvents" :key="event.id" class="event-card">
          <div class="event-date-badge">
            <span class="event-day">{{ event.day }}</span>
            <span class="event-month">{{ event.month }}</span>
          </div>
          <div class="event-info">
            <span class="event-type-tag">{{ event.type }}</span>
            <h3 class="event-title">{{ event.title }}</h3>
            <p class="event-desc">{{ event.description }}</p>
            <div class="event-meta">
              <span>🕐 {{ event.time }}</span>
              <span>📍 {{ event.venue }}</span>
            </div>
          </div>
        </div>
      </div>
    </CommunitySection>

    <CommunitySection
      alt
      tag="Past Events"
      title="What We've"
      accent="Done"
      desc="Tournaments played, champions crowned, and clips worth rewatching."
    >
      <PastEventCards :events="allPastEvents" />
    </CommunitySection>

    <CommunitySection
      alt
      tag="Hall of Fame"
      title="Event"
      accent="Winners"
      desc="Champions who rose to the top across every tournament and challenge."
    >
      <WinnerCards :events="eventWinners" no-winner-text="No winner recorded" />
    </CommunitySection>

    <CommunitySection
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
import PastEventCards from '../components/community/PastEventCards.vue';
import WinnerCards from '../components/community/WinnerCards.vue';
import TeamCards from '../components/community/TeamCards.vue';
import { useScrollReveal } from '../composables/useAnimations.js';
import { useEventDateFilter } from '../composables/useEventDateFilter.js';
import '../assets/community.css';

const imgBgmiShowdown =
  'https://res.cloudinary.com/l59gy0g2/image/upload/f_auto,q_auto:good,w_1000,c_limit/v1785911339/sundarbans/src/assets/Community_Events/E-Sports/BGMI_Showdown_2025.jpg';
const imgBtb =
  'https://res.cloudinary.com/l59gy0g2/image/upload/f_auto,q_auto:good,w_1000,c_limit/v1785911337/sundarbans/src/assets/Community_Events/E-Sports/Back_to_Bachpan.jpg';
const imgIpl =
  'https://res.cloudinary.com/l59gy0g2/image/upload/f_auto,q_auto:good,w_1000,c_limit/v1785911343/sundarbans/src/assets/Community_Events/E-Sports/IPL_Auction.jpg';
const imgChessComp =
  'https://res.cloudinary.com/l59gy0g2/image/upload/f_auto,q_auto:good,w_1000,c_limit/v1785911342/sundarbans/src/assets/Community_Events/E-Sports/Great_Chess_Competetion.jpg';
const imgBgmiTourn =
  'https://res.cloudinary.com/l59gy0g2/image/upload/f_auto,q_auto:good,w_1000,c_limit/v1785911340/sundarbans/src/assets/Community_Events/E-Sports/BGMI_Tournament.jpg';
const imgSportsQuiz =
  'https://res.cloudinary.com/l59gy0g2/image/upload/f_auto,q_auto:good,w_1000,c_limit/v1785911346/sundarbans/src/assets/Community_Events/E-Sports/Sports_Quiz.jpg';
const imgBol =
  'https://res.cloudinary.com/l59gy0g2/image/upload/f_auto,q_auto:good,w_1000,c_limit/v1785911338/sundarbans/src/assets/Community_Events/E-Sports/Battle_Of_Legends.jpg';
const imgSkribbl =
  'https://res.cloudinary.com/l59gy0g2/image/upload/f_auto,q_auto:good,w_1000,c_limit/v1785911345/sundarbans/src/assets/Community_Events/E-Sports/Skribbl_Night.jpg';
const imgAmongUs =
  'https://res.cloudinary.com/l59gy0g2/image/upload/f_auto,q_auto:good,w_1000,c_limit/v1785911336/sundarbans/src/assets/Community_Events/E-Sports/Among_Us_night.jpg';
const imgChessShowdown =
  'https://res.cloudinary.com/l59gy0g2/image/upload/f_auto,q_auto:good,w_1000,c_limit/v1785911341/sundarbans/src/assets/Community_Events/E-Sports/Chess_Tournament.jpg';
const imgOpenMic =
  'https://res.cloudinary.com/l59gy0g2/image/upload/f_auto,q_auto:good,w_1000,c_limit/v1785911344/sundarbans/src/assets/Community_Events/E-Sports/Open_Mic.jpg';

useScrollReveal();

// ─── All upcoming events ───────────────────────────────────────────────────
// Add `dateISO: 'YYYY-MM-DD'` OR use `day`/`month` for auto-migration.
// Once the date passes the event moves to Past Events automatically.
const _upcomingRaw = [
  {
    id: 1,
    title: 'Valorant 5v5 House Tournament',
    type: 'Tournament',
    description: 'Internal Valorant tournament. 8 teams, single elimination, prizes for top 3.',
    day: '20',
    month: 'APR',
    time: '4:00 PM',
    venue: 'Gaming Lab, Block C',
  },
  {
    id: 2,
    title: 'Chess Blitz Night',
    type: 'Tournament',
    description: 'Speed chess rounds — 3 minutes per side. Open to all skill levels.',
    day: '27',
    month: 'APR',
    time: '8:00 PM',
    venue: 'Common Room, Floor 2',
  },
  {
    id: 3,
    title: 'BGMI Squad Scrimmage',
    type: 'Scrimmage',
    description: 'Casual squad matches to build team chemistry before the main tournament season.',
    day: '03',
    month: 'MAY',
    time: '5:00 PM',
    venue: 'Gaming Lab, Block C',
  },
];

// ─── Static past events ────────────────────────────────────────────────────
const _pastRaw = [
  {
    id: 1,
    title: 'Sundarbans House BGMI Showdown 2025',
    type: 'Tournament',
    description:
      'Sundarbans House BGMI Showdown 2025 brought together gaming enthusiasts from across the community for an action-packed battleground experience. Participants competed in custom rooms, showcased their strategies, teamwork, and reflexes, and prepared themselves for the upcoming Saavan event. The tournament created excitement, healthy competition, and gave players a platform to prove their skills while strengthening the e-sports spirit within the house.',
    date: '13 Sep 2025 | 5:00 PM',
    attendees: '50+',
    image: imgBgmiShowdown,
  },
  {
    id: 2,
    title: 'Back to Bachpan',
    type: 'Casual Event',
    description:
      'Back to Bachpan was a nostalgic and heartwarming event that gave members a chance to relive the joy of childhood games and memories. From classic fun activities to light-hearted challenges, the evening created an atmosphere full of laughter, bonding, and team spirit. More than just an event, it reminded everyone of the importance of simple joys and brought the Sundarbans community closer together.',
    date: '7 Nov 2025 | 8:30 PM',
    attendees: '50+',
    image: imgBtb,
  },
  {
    id: 3,
    title: 'IPL Auction – Sundarbans Edition',
    type: 'Strategy Event',
    description:
      'The IPL Auction – Sundarbans Edition gave participants the thrilling experience of becoming team owners and strategists. Members bid for players, built dream squads, and planned their tactics just like a real IPL auction. The event was filled with excitement, competitive bidding, and strategic decision-making, making it one of the most engaging sports-based events hosted by the community.',
    date: '10 Nov 2025 | 8:00 PM',
    attendees: '50+',
    image: imgIpl,
  },
  {
    id: 4,
    title: 'Chess Competition',
    type: 'Competition',
    description:
      'The Sundarbans Chess Competition brought together sharp minds and strategic thinkers for an intense battle of intellect. Participants competed in multiple rounds, testing their patience, concentration, and decision-making skills. The event encouraged sportsmanship and mental agility, while giving members an opportunity to challenge themselves in a highly competitive yet enjoyable setting.',
    date: '8 Dec 2025 | 6:00 PM',
    attendees: '50+',
    image: imgChessComp,
  },
  {
    id: 5,
    title: 'BGMI Tournament',
    type: 'Tournament',
    description:
      'The Sundarbans BGMI Tournament was an adrenaline-filled e-sports showdown where players battled in intense matches to prove their dominance on the battleground. The event saw impressive team coordination, clutch moments, and unforgettable finishes. It not only showcased gaming talent but also strengthened the growing e-sports culture within the Sundarbans community.',
    date: '10 Dec 2025 | 7:00 PM',
    attendees: '50+',
    image: imgBgmiTourn,
  },
  {
    id: 6,
    title: 'Sports Quiz Showdown',
    type: 'Quiz',
    description:
      'The Sports Quiz Showdown was a fun and energetic event that tested participants’ knowledge across various sports, players, records, and iconic moments. Members competed in a lively quiz environment filled with excitement, learning, and friendly banter. The event successfully blended entertainment with knowledge and brought out the competitive spirit of sports lovers.',
    date: '12 Dec 2025 | 7:00 PM',
    attendees: '50+',
    image: imgSportsQuiz,
  },
  {
    id: 7,
    title: 'Battle of Legends 1.0 – Free Fire Tournament',
    type: 'Tournament',
    description:
      'Battle of Legends 1.0 was a high-voltage Free Fire tournament that delivered excitement, action, and unforgettable moments. Participants showcased their gaming skills, strategy, and teamwork in a fiercely competitive environment. The event was a huge success in bringing together passionate gamers and creating an engaging platform for members to connect and compete.',
    date: '13 Dec 2025 | 6:00 PM',
    attendees: '50+',
    image: imgBol,
  },
  {
    id: 8,
    title: 'Skribbl Night',
    type: 'Interactive Event',
    description:
      'Skribbl Night was a light-hearted and interactive event that filled the evening with creativity, laughter, and fun. Members drew, guessed, and competed in a relaxed setting that encouraged participation from everyone. The event provided a refreshing break from academics and created memorable moments of joy and bonding within the community.',
    date: '6 Feb 2026 | 7:00 PM',
    attendees: '50+',
    image: imgSkribbl,
  },
  {
    id: 9,
    title: 'Among Us Night',
    type: 'Social Gaming',
    description:
      'Among Us Night brought members together for an exciting evening of mystery, teamwork, and deception. Participants worked together to complete tasks while trying to identify the impostors among them. The event was packed with suspense, laughter, and surprise twists, making it one of the most entertaining social gaming nights for the Sundarbans community.',
    date: '13 Feb 2026 | 7:00 PM',
    attendees: '50+',
    image: imgAmongUs,
  },
  {
    id: 10,
    title: 'Chess Showdown',
    type: 'Competition',
    description:
      'The Sundarbans Chess Showdown was an intense competition that challenged members to think critically and stay calm under pressure. Featuring elimination rounds and a grand finale, the event pushed participants to bring their best strategies to the board. It highlighted the growing interest in mind sports and gave players a chance to showcase their tactical excellence.',
    date: '27 Feb 2026 | 7:00 PM',
    attendees: '50+',
    image: imgChessShowdown,
  },
  {
    id: 11,
    title: 'Open Mic – Feedback Session',
    type: 'Feedback Session',
    description:
      'The Open Mic Feedback Session was a meaningful community interaction where members openly shared their experiences, suggestions, and ideas for future events. It served as a platform to understand participation challenges, gather valuable insights, and improve future planning. The session reflected Sundarbans House’s commitment to inclusivity, transparency, and continuous growth as a student community.',
    date: '8:30 PM onwards',
    attendees: '50+',
    image: imgOpenMic,
  },
];

// Apply dynamic date-checking: upcoming → past when date passes
const { upcomingEvents, allPastEvents } = useEventDateFilter(_upcomingRaw, _pastRaw);

const eventWinners = [
  {
    id: 1,
    title: 'Free Fire – Battle of Legends',
    type: 'Tournament',
    noWinner: false,
    winners: [
      { name: 'Bhoopendra Chandel', email: '23f3000441@es.study.iitm.ac.in' },
      { name: 'Agampreet Singh', email: '24f2002079@ds.study.iitm.ac.in' },
      { name: 'Aditya Chaubey', email: '25f2008372@ds.study.iitm.ac.in' },
      { name: 'Alok Chaubey', email: '24f2006338@ds.study.iitm.ac.in' },
    ],
  },
  {
    id: 2,
    title: 'BGMI Showdown 2025',
    type: 'Tournament',
    noWinner: false,
    winners: [
      { name: 'Divyansh Chandra', email: '25f2002300@ds.study.iitm.ac.in' },
      { name: 'Sumit Singhal', email: '24f2003662@ds.study.iitm.ac.in' },
    ],
  },
  {
    id: 3,
    title: 'Valorant Tournament',
    type: 'Tournament',
    noWinner: true,
    winners: [],
  },
  {
    id: 4,
    title: 'Great Chess Competition',
    type: 'Competition',
    noWinner: false,
    winners: [
      { name: 'Syan Das', email: '25f2007719@ds.study.iitm.ac.in' },
      { name: 'Pradip Boro', email: '25f2001618@ds.study.iitm.ac.in' },
      { name: 'Daggubati Bapaiah Chowdary', email: '25f3100064@es.study.iitm.ac.in' },
    ],
  },
  {
    id: 5,
    title: 'Sports Quiz Showdown',
    type: 'Quiz',
    noWinner: false,
    winners: [
      { name: 'Naren Sampath', email: '25f3001304@ds.study.iitm.ac.in' },
      { name: 'Sai Rajith Ponnuru', email: '25f3100110@ds.study.iitm.ac.in' },
    ],
  },
  {
    id: 6,
    title: 'Back to Bachpan',
    type: 'Casual Event',
    noWinner: false,
    winners: [
      { name: 'Shaik Neeha Jasmine', email: '25f3100078@es.study.iitm.ac.in' },
      { name: 'Aditri Bordoloi', email: '25f2008346@ds.study.iitm.ac.in' },
      { name: 'Aarya', email: '25f1000637@ds.study.iitm.ac.in' },
    ],
  },
  {
    id: 7,
    title: 'IPL Auction – Sundarbans Edition',
    type: 'Strategy Event',
    noWinner: false,
    winners: [
      { name: 'Chandigarh Region', email: '' },
      { name: 'Kolkata Region', email: '' },
      { name: 'Lucknow Region', email: '' },
    ],
  },
  {
    id: 8,
    title: 'Open Mic – Feedback Session',
    type: 'Feedback Session',
    noWinner: true,
    winners: [],
  },
  {
    id: 9,
    title: 'Chess Showdown',
    type: 'Competition',
    noWinner: false,
    winners: [
      { name: 'Plavit Chandalia', email: '25f2000710@ds.study.iitm.ac.in' },
      { name: 'Ashish Kumar', email: '25f1002782@ds.study.iitm.ac.in' },
      { name: 'Divyansh Tiwari', email: '22f3001534@ds.study.iitm.ac.in' },
    ],
  },
  {
    id: 10,
    title: 'BGMI Tournament',
    type: 'Tournament',
    noWinner: false,
    winners: [{ name: 'Abdul Kadir', email: '25f2000502@ds.study.iitm.ac.in' }],
  },
  {
    id: 11,
    title: 'Sports Quiz',
    type: 'Quiz',
    noWinner: false,
    winners: [
      { name: 'Bhavana S', email: '25f3001430@ds.study.iitm.ac.in' },
      { name: 'Neeha Jasmine Shaik', email: '25f3100078@es.study.iitm.ac.in' },
    ],
  },
  {
    id: 12,
    title: 'Free Fire',
    type: 'Tournament',
    noWinner: true,
    winners: [],
  },
];

const team = [
  {
    name: 'Aviral Trivedi',
    role: 'Co-Head',
    level: 'Diploma - Data Science',
    photo:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80&auto=format&fit=crop&crop=face',
    email: 'mailto:24f3004641@ds.study.iitm.ac.in',
    linkedin: 'https://www.linkedin.com/in/aviral-trivedi0',
    instagram: 'https://www.instagram.com/_aviraltrivedi0?igsh=bjEzY2VibWtldm01',
  },
  {
    name: 'Ashutosh Singh',
    role: 'Co-Head',
    level: 'Diploma - Data Science',
    photo:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80&auto=format&fit=crop&crop=face',
    email: 'mailto:22f2000770@ds.study.iitm.ac.in ',
    linkedin: 'https://www.linkedin.com/in/yuddhraj',
    instagram: 'https://www.instagram.com/the._.ashutosh._.singh?igsh=Nm5oeGVzbXM4cm9i',
  },
];
</script>
