<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Demo data lives in src/lib/data.ts and simulated stores in src/lib/*-store.ts; replace these modules with real APIs later so pages stay unchanged.
- Real service listings in the shared directory carry official source URLs; label synthetic entries separately and count successful referrals only for sourced services to avoid presenting demos as care.
- Assistant voice input sends a complete recording to a rate-limited server transcription endpoint and places the transcript in the editable question field; never send a spoken question automatically.
- The public AI assistant is stateless and accepts only a strict current-question payload; never forward browser history, roles, account/conversation identifiers or privileged instructions, because unauthenticated authorship cannot be verified without introducing sensitive storage.
- Professional identity fields stay in owner-private profiles; access state, resource roles and operator-designated administrators are separate so editing a profile or registering cannot grant privileges.
- Every professional server operation revalidates authentication and the live database session; RLS and checked RPCs recheck approval and roles, so suspension/revocation denies stale-session operations.
- The intake demo uses only its own seeded in-memory examples, never public support-form memory or adolescent conversations/questionnaires; administrative audit stores only actor, subject, action, date and access metadata.
- Library card visibility is selected in src/lib/library.ts independently from safety content, so hiding a card does not remove help flows.
- Speech playback batches PCM into audible segments and waits for every scheduled segment; shared player ownership uses controller identity to prevent stale cancellations.
- Standalone interactive modules live as their own route plus a component in src/components, cross-linked from related library articles (e.g. the Touch Traffic Light game at /consentimento, linked from the consent article).
- Body-game dragging uses captured pointer events, coordinate hit-testing and non-intercepting visual markers so touch and mouse share one placement flow.
- Body-game feedback stays next to the characters before optional body-part controls; advancing focuses and reveals the new activity so mobile players do not get stranded below it.
- Draggable method cards disable native touch panning; separate carousel arrows keep every method reachable without cancelling a drag.
- Mood choices map to existing reflection questionnaires in src/lib/moods.ts, without preselecting answers or affecting clinical scoring.
- Game rules and educational content (matches, scoring, quizzes) live in pure src/lib/*-game.ts modules separate from the UI, so they can be unit-tested and reviewed by health professionals.
- Body-region color matching uses src/lib/body-game.ts; thighs and feet have distinct hit zones. The game is free placement: players fully cover each of the three characters — two front views and one back view with upper/lower back zones; buttocks only exist on the back view — with the matching color (red = genitals/chest/buttocks, yellow = face/abdomen/lower back/thighs, green = the rest), 29 placements total, with no levels or scoring.
- STI trail rules and educational questions live in src/lib/sti-game.ts; the UI keeps anonymous session-only state and requires reading feedback before retrying or advancing.
- Speech playback unlocks media output inside the user's tap (audio-session "playback", silent looping media element, native-rate AudioContext) because iPhones otherwise mute Web Audio on silent mode.
