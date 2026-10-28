# Roadmap

- [x] Audit professional access, authentication, permissions and privacy against the uploaded security brief
- [x] Harden professional access, approval/revocation, logout/recovery and administrative auditing without collecting adolescent health data
- [x] Verify professional access with synthetic accounts and produce an evidence-based security report
- [ ] Designate first real administrator after the owner supplies a confirmed account and explicit authorization; no real accounts exist yet
- [x] Add real Brazilian UBS (basic health units) to the Services screen, keeping the app in English — four sourced São Paulo units plus official nationwide CNES search
- [x] Complete and verify voice input in the Health Assistant: microphone recording transcribes into the question box for review; verified with spoken Portuguese audio
- [x] Body game: show dashed outlines on still-missing body parts so players can complete the progress bar
- [x] Body game: each character must be fully covered (31 placements) — fixes circles not filling on Alex
- [x] Body game: face yellow; add back-view character on the right (upper back green, lower back yellow, buttocks red, thighs yellow); 13 regions total
- [x] Rebuild consent game per new Body Traffic Light brief: free placement of colored circles (bottom bar) on all 11 regions, per-color educational feedback, restart button, trophy final screen with trusted-adult guidance
- [x] Body game: buttocks red (private area), shoulders green; verified drag works on all 11 regions
- [x] Show a "Click here" hint above the mood emojis and drop the topic list below them
- [x] Replace CAPS/CAPSi with "Psychological care center" and UBS with "Basic health unit"
- [ ] Replace the remaining local names (Disque 100, SaferNet Brazil, CREAS, CTA, Child Protection Council, Ministry of Health, LGPD/ANPD) with international equivalents
- [x] Remove the Demo notice below "How are you doing?" on the well-being screen
- [x] Move the STI game shortcut below the other games in the library list
- [x] Add hormone therapy and primary care outpatient follow-up for trans people to sexual rights
- [x] Add a PLAY NOW shortcut to all three games
- [x] Remove SUS and ECA references so the material can be adapted internationally by UNICEF
- [x] Summarize the places with too much text

- [x] Shorten Library summaries and articles while preserving essential health guidance; verify displayed text and shared Listen content

- [x] Add STI Path of Wisdom game with 10 true/false rounds, feedback, retry without penalty, trophy and results
- [x] Link the STI game from the library and STI article; verify completion and restart

- [x] Recolor body game: red = genitals and chest only, yellow = abdomen and thighs, green = the rest; verified with touch and mouse drags plus tests

- [x] Add isolation, avoiding friends and withdrawal as possible emotional distress signs in the library

- [x] Expand STI guidance: oral/anal transmission, lesions, asymptomatic infections, testing, condoms and urinary infection prevention
- [x] Add morning-after pill guidance to Contraceptive methods
- [x] Reproduce and repair the Body Safety game's current interaction problems

- [x] Add the uploaded condom and HPV images to Sexually transmitted infections
- [x] Diagnose and adjust both games; verify dragging and completion
- [x] Add clickable mood emojis that lead into emotional health questions

- [x] Fix Listen button: no sound comes out when tapped (iPhone silent-switch routing, native-rate audio, unlock in tap)
- [x] Touch game: chest / private parts must accept the red circle
- [x] Build "Where does it go?" contraception drag-and-drop game (uploaded brief): card, 12 methods, special targets, method fact sheets, final 5-question challenge, safety messages, tests


- [x] Repair colored-circle dragging on body regions; verify touch and mouse placement

- [x] Diagnose and repair inclusive audio playback; verify all generated segments finish in the browser
- [x] Remove the two library topics shown in the uploaded screenshot

- [x] Translate the whole app to English (screens, texts, buttons, data)
- [x] Add the two uploaded infographics (condom, HPV vaccine) to the "ask your questions" assistant area
  - [x] Upload both images as app media
  - [x] Show them as tappable visual guides in the assistant screen
  - [x] Suggest the right guide inside assistant replies (condom / HPV)
  - [x] Verify in the browser

## Touch Traffic Light game (Body Safety & Consent)

- [x] Build the interactive game: drag-and-drop + tap-to-select + keyboard-friendly body-part buttons
- [x] Three levels (My Body / My Boundaries / Staying Safe) with scoring, stars, progress bar
- [x] Scenario challenges, trusted-adults activity, final "You are the boss of your body" screen
- [x] Add route /consentimento and link it from the consent article and the library list
- [x] Verify build
- [x] Verify end-to-end in the browser (all levels, drag-and-drop, retry path, final screen)
- [x] AI assistant grounded in library content (Portuguese/English, no diagnoses, safety escalation, rate limit, PII redaction, setup/error messages)
- [x] Smart referral: "What do you need?" on Services
- [x] Anonymous impact indicators in the managers' panel
- [x] Real sign-in + roles for the professionals' panel; indicators restricted to managers
- [x] Privacy page in Portuguese describing AI data flow and unknowns
- [x] Server-enforced, concurrency-safe question limit (hashed IP, daily rotation)
- [ ] Grant the first professional/manager role (waits on the user creating an account)
