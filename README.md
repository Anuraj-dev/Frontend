Sundarbans-House
A centralized platform for managing events, resources, team collaboration, and digital initiatives of Sundarbans House.

<img width="1432" height="783" alt="Screenshot 2026-04-02 at 10 53 46" src="https://github.com/user-attachments/assets/04fef05d-a7f3-4fe1-8ef9-20a104ec3600" />


<img width="1470" height="803" alt="Screenshot 2026-04-15 at 11 50 18" src="https://github.com/user-attachments/assets/65d285ed-e47b-4ba9-ac84-96444b8f1f2d" />


<img width="1470" height="728" alt="Screenshot 2026-04-02 at 10 57 30" src="https://github.com/user-attachments/assets/890ea9bb-9ed4-4cb8-b451-e50d6f2c563f" />

<img width="1111" height="677" alt="Screenshot 2026-04-15 at 11 51 30" src="https://github.com/user-attachments/assets/bfa0416c-d0cc-4473-ba4e-94eee8d91757" />

<img width="1470" height="434" alt="Screenshot 2026-04-15 at 11 52 05" src="https://github.com/user-attachments/assets/713db9a5-2d45-4e5b-b52f-4f247284ec49" />


Structure

```
Sundarbans-House_Vue-main/
├── index.html                        # App entry HTML
├── vite.config.js                    # Vite build config
├── package.json                      # Dependencies and scripts
│
├── public/                           # Static assets (served as-is)
│   ├── assets/
│   │   ├── logo.png
│   │   └── frames/                   # Animation frames (001–240 JPEGs)
│   │                                 # Used for scroll-based video animation
│   └── data/
│       └── doubts.json               # Static FAQ/doubts data
│
├── sundarbans/                       # Legacy standalone HTML version
│   ├── login.html / login.css / login.js
│   ├── dashboard.html / dashboard.css / dashboard.js / dashboard.json
│   ├── members.html / members.css / members.js / members.json
│   └── whatsapp.html
│
└── src/                              # Vue app source
    ├── main.js                       # App bootstrap
    ├── App.vue                       # Root component
    │
    ├── router/
    │   └── index.js                  # All route definitions
    │
    ├── composables/
    │   └── useAnimations.js          # Reusable animation logic
    │
    ├── components/                   # Shared/reusable components
    │   ├── AppFooter.vue
    │   ├── MembersNavbar.vue
    │   ├── PageHero.vue
    │   └── RegionMeetups.vue
    │
    ├── data/                         # Static data files
    │   ├── members.json              # Member records
    │   └── scData_generated.js       # Generated student council data
    │
    ├── assets/                       # Bundled assets (processed by Vite)
    │   ├── style.css                 # Global styles
    │   ├── IITM-Logo.png
    │   ├── LOGO.JPEG
    │   ├── login-illustration.png
    │   ├── Sundarbans-House_Vue.jpg
    │   ├── regions/                  # City images (bangalore, chennai, delhi…)
    │   ├── teams/                    # Team member photos
    │   └── Community Events/
    │       ├── Cultural/             # Cultural event posters
    │       ├── E-Sports/             # E-Sports event posters
    │       └── Technical/            # Technical event posters
    │
    └── views/                        # Page-level Vue components
        ├── HomeView.vue
        ├── AboutView.vue
        ├── EventsView.vue
        ├── StudyView.vue
        ├── TeamsView.vue
        ├── CommunityView.vue
        ├── ContactView.vue
        ├── LoginView.vue
        ├── MembersLoungeView.vue
        ├── DashboardView.vue
        ├── TechnicalView.vue         # /community/technical
        ├── CulturalView.vue          # /community/cultural
        ├── ESportsView.vue           # /community/esports
        ├── MeetupsView.vue           # /meetups (landing)
        └── meetups/                  # Region-specific meetup pages
            ├── regionConfigs.js      # Shared config for all regions
            ├── DelhiMeetups.vue
            ├── MumbaiMeetups.vue
            ├── BangaloreMeetups.vue
            ├── KolkataMeetups.vue
            ├── HyderabadMeetups.vue
            ├── PatnaMeetups.vue
            ├── ChandigarhMeetups.vue
            ├── manifest.json / manifest.csv
            └── region_exports_json_and_csv/
                ├── json/             # Per-region meetup data (JSON)
                └── csv/              # Per-region meetup data (CSV)
```

