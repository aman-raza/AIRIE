# AIRIE

Minimal Next.js frontend + API routes for AIRIE AI workflows.

## Run in development mode

### 1) Install dependencies

```bash
npm install
```

### 2) Set environment variables

Create `.env.local` in the project root (or use `.en.local` for backward compatibility):

```bash
OPENAI_API_KEY=your_key_here
# optional
AI_MODEL=gpt-4o-mini
AI_EMBEDDING_MODEL=text-embedding-3-small
```

### 3) Start dev server

```bash
npm run dev
```

Then open:

- http://localhost:3000 for the frontend
- API routes under `http://localhost:3000/api/ai/*`

## Useful scripts

```bash
npm run build
npm run start
npm run lint
```
