# Care+

**Care+** is a responsive web application that offers adolescents trusted health
information, emotional support and guidance on where to find care. It is a
demonstrative prototype: all content is educational, the data is synthetic and
the listed services are fictional. It does not replace professional care.

The interface is designed to be usable by people who cannot read fluently or who
have low vision: every screen can be listened to with a "Listen" button, text is
short and scannable, and the layout works on phones, tablets and desktops.

## What's inside

| Area | Path | What it does |
| --- | --- | --- |
| Home | `/` | Chooses a path based on what the person needs right now |
| Health library | `/biblioteca` | Short articles on body, emotions, rights, contraception and STIs |
| Articles | `/biblioteca/:slug` | Individual articles with audio, illustrations and links to the games |
| Health assistant | `/assistente` | Rule-based Q&A with reviewed replies and illustrated guides |
| Emotional well-being | `/bem-estar` | Mood emojis that open matching reflection questionnaires |
| Help | `/ajuda` | Emergency numbers and how to ask for help now |
| Services | `/servicos` | Directory of health and support services |
| Ask for support | `/solicitar-apoio` | Request form for a trusted adult or a service |
| Professionals | `/profissionais` | Panel used by teachers and health workers |
| Privacy | `/privacidade` | What data is collected, what is not, and how it is protected |

### Interactive games

| Game | Path | Learning goal |
| --- | --- | --- |
| Touch Traffic Light | `/consentimento` | Body-safety and consent: cover three characters with the right colour per body region |
| Where does it go? | `/anticoncepcao` | Contraceptive methods: match each method to what it protects against |
| STIs — Path of Wisdom | `/ist-jogo` | STI facts: true or false trail with feedback before each retry |

Game rules and educational content live in plain modules under `src/lib/`
(`body-game.ts`, `contraception-game.ts`, `sti-game.ts`), separate from the
interface, so they can be unit-tested and reviewed by health professionals.

## Safety and privacy choices

- **Quick exit** — a persistent button that immediately replaces the page with a
  neutral site. It does not erase browser history, and the app says so.
- **No accounts required** to read, listen or play.
- **No anonymous sign-ups**, no tracking of identity, no clinical scoring.
- **Synthetic data only** — sample rows, fictional services, no real patient data.
- Content avoids country-specific systems and laws so it can be adapted as
  international material; references are neutral (public health services, the UN
  Convention on the Rights of the Child, WHO, UNICEF).

## Built with

- TanStack Start (React 19, Vite 7) — routing, SSR and server functions
- TypeScript
- Tailwind CSS v4 with semantic design tokens
- shadcn/ui components
- Vitest for unit and component tests
- Lovable Cloud (Supabase) for auth and the speech endpoint

## Getting started

You need Node.js and npm.

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

Then open the local URL the dev server prints.

Available scripts:

```sh
npm run dev      # start the dev server
npm run build    # production build
npm run preview  # serve the built app
npm run lint     # ESLint
npm run test     # run the test suite
npm run format   # Prettier
```

## Project layout

```
src/
  routes/        one file per screen (TanStack file-based routing)
  components/    UI: layout, games, guide viewer, listen button
  lib/           content and game rules: data.ts, library.ts, assistant.ts,
                 body-game.ts, contraception-game.ts, sti-game.ts, moods.ts,
                 speech.ts, guides.ts
  styles.css     Tailwind theme tokens
  test/          Vitest tests for content filtering and game rules
```

Demo content and simulated stores live in `src/lib/`; swap those modules for
real APIs later and the screens stay unchanged.

## Disclaimer

This prototype is educational and demonstrative. It is not a medical device, does
not diagnose, and must not be used as a substitute for qualified care. In an
emergency, contact local emergency services.

## License

Released under the [MIT License](LICENSE).
