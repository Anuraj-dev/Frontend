<template>
  <div class="community-page community-cultural">
    <PageHero
      bg-image="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=1920&q=80&auto=format&fit=crop"
      breadcrumb-title="Community"
      title="Cultural"
      accent-title="Community"
      subtitle="Art. Music. Culture. — celebrating what makes us human."
    />

    <CommunitySection
      tag="Upcoming Events"
      title="What's"
      accent="Coming Up"
      desc="Events planned ahead — mark your calendar and show up."
    >
      <UpcomingEventCards :events="upcomingEvents" empty-text="🎉 No upcoming events right now — check back soon!" />
    </CommunitySection>

    <CommunitySection
      alt
      tag="Past Events"
      title="What We've"
      accent="Done"
      desc="A record of everything we've celebrated, performed, and created."
    >
      <PastEventCards :events="allPastEvents" />
    </CommunitySection>

    <CommunitySection
      tag="Hall of Fame"
      title="Event"
      accent="Winners"
      desc="The voices, performers, and creators who stood out."
    >
      <WinnerCards :events="eventWinners" />
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
import PageHero from "../components/PageHero.vue";
import CommunitySection from "../components/community/CommunitySection.vue";
import UpcomingEventCards from "../components/community/UpcomingEventCards.vue";
import PastEventCards from "../components/community/PastEventCards.vue";
import WinnerCards from "../components/community/WinnerCards.vue";
import TeamCards from "../components/community/TeamCards.vue";
import { useScrollReveal } from "../composables/useAnimations.js";
import { useEventDateFilter } from "../composables/useEventDateFilter.js";
import "../assets/community.css";

import imgShivShakti from "../assets/Community Events/Cultural/Shiv Shakti.jpeg";
import imgPhotography from "../assets/Community Events/Cultural/Photography Workshop.jpeg";
import imgDance from "../assets/Community Events/Cultural/Dance Workshop.jpeg";
import img3AmThoughts from "../assets/Community Events/Cultural/3 AM thoughts.jpeg";
import imgOpenMic from "../assets/Community Events/Cultural/Open Mic.jpeg";

// Upcoming event placeholder images — replace with real ones when available
import imgUtsav from "../assets/Community Events/Cultural/Shiv Shakti.jpeg";
import imgPhotoWalk from "../assets/Community Events/Cultural/Photography Workshop.jpeg";
import imgOpenMicUpcoming from "../assets/Community Events/Cultural/Open Mic.jpeg";

// Team Photos
import imgLiza from "../assets/teams/Liza.jpg";
import imgMegha from "../assets/teams/Megha.jpg";
import imgAarusha from "../assets/teams/Aarusha.jpg";
import imgNavya from "../assets/teams/Navya.jpg";
import imgDhanya from "../assets/teams/Dhanya.jpg";
import imgKaviya from "../assets/teams/R.Kaviya Kaviarasi.jpg";

useScrollReveal();

// ─── All upcoming events ───────────────────────────────────────────────────
// Add `dateISO: 'YYYY-MM-DD'` OR use `day`/`month` for auto-migration.
// Once the date passes the event moves to Past Events automatically.
const _upcomingRaw = [
  {
    id: 1,
    title: "Sundarban Utsav — Cultural Night",
    type: "Performance",
    description: "An evening of music, dance, and spoken word from across the country.",
    day: "25", month: "APR", time: "7:00 PM", venue: "Open Amphitheatre",
    image: imgUtsav,
    registerLink: "#", // Replace with actual registration link
  },
  {
    id: 2,
    title: "Photography Walk",
    type: "Workshop",
    description: "A guided campus walk focused on composition, light, and storytelling through a lens.",
    day: "30", month: "APR", time: "6:30 AM", venue: "Main Gate, Campus",
    image: imgPhotoWalk,
    registerLink: "#", // Replace with actual registration link
  },
  {
    id: 3,
    title: "Spoken Word Open Mic",
    type: "Performance",
    description: "A stage for poetry, stories, and raw expression. All languages welcome.",
    day: "08", month: "MAY", time: "6:00 PM", venue: "Courtyard, Block D",
    image: imgOpenMicUpcoming,
    registerLink: "#",
  },
];

// ─── Static past events ────────────────────────────────────────────────────
const _pastRaw = [
  {
    id: 1,
    title: "Shiv–Shakti: The Eternal Union",
    type: "Event",
    description: "Shiv–Shakti: The Eternal Union was a spiritually enriching cultural evening that beautifully celebrated devotion, art, and timeless values. The event brought members together to experience the divine essence of Shiva and Shakti through soulful shlokas, graceful dance performances, devotional expressions, and heartfelt reflections. It created a peaceful and uplifting atmosphere, allowing participants to reconnect with spirituality, culture, and inner calm while celebrating the deeper meaning of togetherness and faith.",
    date: "15 Feb 2026 | 8:00 PM", attendees: "50+", image: imgShivShakti,
  },
  {
    id: 2,
    title: "Photography Workshop with Manish Kumar",
    type: "Workshop",
    description: "The Photography Workshop was an inspiring and interactive learning session designed for members who wanted to explore the art of visual storytelling. Led by Manish Kumar, a talented creative professional skilled in photography, design, and digital art, the workshop focused on composition, lighting, framing, and creative perspective. Participants gained practical insights into how to transform ordinary moments into meaningful visuals. The session encouraged creativity, curiosity, and helped members develop a stronger artistic eye.",
    date: "19 Feb 2026 | 7:00 PM", attendees: "50+", image: imgPhotography,
  },
  {
    id: 3,
    title: "Dance Workshop with Aditri Bordoloi",
    type: "Workshop",
    description: "The Dance Workshop was a vibrant and energetic session that brought rhythm, movement, and excitement to the Sundarbans community. Led by Aditri Bordoloi, the workshop introduced participants to a mix of Bollywood, freestyle, and classical dance styles in a beginner-friendly format. Members learned new moves, explored different forms of expression, and enjoyed an engaging experience filled with fun and positivity. The event successfully encouraged confidence, creativity, and active participation.",
    date: "26 Feb 2026 | 7:30 PM", attendees: "50+", image: imgDance,
  },
  {
    id: 4,
    title: "3 AM Thoughts",
    type: "Reflection Event",
    description: "3 AM Thoughts was a unique and heartfelt community initiative that provided members with a safe and comforting space to express their late-night feelings, thoughts, dreams, and emotions. Through written reflections and anonymous submissions, participants shared personal stories, fears, hopes, and moments of vulnerability. The event fostered emotional openness, connection, and understanding within the community, making it one of the most meaningful and relatable cultural initiatives.",
    date: "Online Submission", attendees: "50+", image: img3AmThoughts,
  },
  {
    id: 5,
    title: "Open Mic Night",
    type: "Open Mic",
    description: "Open Mic Night was a lively and expressive cultural evening that gave members the chance to showcase their hidden talents and creativity. From poetry and shayari to singing, storytelling, and fun performances, the event created a warm and supportive stage for everyone to share their voice. It encouraged confidence, self-expression, and community bonding while making the evening memorable with laughter, emotions, and inspiring performances.",
    date: "26 Mar 2026 | 8:00 PM", attendees: "50+", image: imgOpenMic,
  },
];

// Apply dynamic date-checking: upcoming → past when date passes
const { upcomingEvents, allPastEvents } = useEventDateFilter(_upcomingRaw, _pastRaw);

// Winners data — replace placeholder emails when available
const eventWinners = [
  {
    id: 1,
    title: "Debate",
    type: "Competition",
    winners: [
      { name: "Srija Chawla", email: "winner@sundarbans.in" },  // Replace email
      { name: "Sabal Sneh",   email: "winner@sundarbans.in" },  // Replace email
    ],
  },
  {
    id: 2,
    title: "Sur Taal",
    type: "Music Event",
    winners: [
      { name: "S. Padmashree", email: "winner@sundarbans.in" }, // Replace email
      { name: "Yash Sharma",   email: "winner@sundarbans.in" }, // Replace email
      { name: "Megha Sharma",  email: "winner@sundarbans.in" }, // Replace email
    ],
  },
  {
    id: 3,
    title: "Poetry",
    type: "Creative Writing",
    winners: [
      { name: "Aditya Kr. Chaubey", email: "winner@sundarbans.in" }, // Replace email
      { name: "Megha Sharma",       email: "winner@sundarbans.in" }, // Replace email
    ],
  },
];

const team = [
  {
    name: "Liza Rathi",
    role: "Co-Head",
    level: "Foundation Data Science",
    photo: imgLiza,
    email: "mailto:24f3001980@ds.study.iitm.ac.in",
    linkedin: "https://www.linkedin.com/in/liza-rathi-63374034b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    instagram: "https://www.instagram.com/rathi_liza?igsh=MWZvcDN3ZDF3bzcyaw==",
  },
  {
    name: "Megha Sharma",
    role: "Event Coordinator",
    level: "Foundation Data Science",
    photo: imgMegha,
    email: "mailto:25f2000267@ds.study.iitm.ac.in",
    linkedin: "https://www.linkedin.com/in/megha-sharma-9489a3357/",
    instagram: "#",
  },
  {
    name: "Aarusha Patil",
    role: "Event Coordinator",
    level: "Diploma Data Science",
    photo: imgAarusha,
    email: "mailto:25f2006483@ds.study.iitm.ac.in",
    linkedin: "https://www.linkedin.com/in/aarusha-patil-92267b3a8/",
    instagram: "https://www.instagram.com/aaru.mp4_?igsh=MWYxNXExMHd2NmdhNg==",
  },
  {
    name: "Navya R",
    role: "Event Coordinator",
    level: "Foundation Data Science",
    photo: imgNavya,
    email: "mailto:25f2007684@ds.study.iitm.ac.in",
    linkedin: "#",
    instagram: "#",
  },
  {
    name: "Dhanya R",
    role: "Event Coordinator",
    level: "Foundation Data Science",
    photo: imgDhanya,
    email: "mailto:25f3000178@ds.study.iitm.ac.in",
    linkedin: "#",
    instagram: "#",
  },
  
  {
    name: "R Kavya Kaviarasi",
    role: "Event Coordinator",
    level: "Foundation Data Science",
    photo: imgKaviya,
    email: "mailto:24f3003690@ds.study.iitm.ac.in",
    linkedin: "https://www.linkedin.com/in/kaviya-kaviarasi-b44178328?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    instagram: "#",
  },
  
];
</script>
