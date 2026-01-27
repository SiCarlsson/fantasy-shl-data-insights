# Fantasy SHL Data Insights

Next.js web application for Swedish Hockey League (SHL) data insights and analytics.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
app/
  api/
    teams/
      [uuid]/
        route.ts     # POST endpoint to ingest team player data from SHL API
  layout.tsx         # Root layout with metadata
  page.tsx           # Home page
  globals.css        # Global styles
```

## External API

Data is fetched from the official SHL API:

- Players by team: `https://www.shl.se/api/sports-v2/athletes/by-team-uuid/{uuid}`

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Package Manager:** pnpm