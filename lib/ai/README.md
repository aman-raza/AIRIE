# AI Engine Module

Production-oriented AI layer for ATS workflows.

## Features
- Resume scoring against job description
- Candidate ranking (hybrid score)
- Interview question generation
- Resume summarization
- Recruiter email drafting
- Skill gap analysis
- Duplicate candidate detection with embeddings + cosine similarity

## Route map
- `POST /api/ai/score`
- `POST /api/ai/summary`
- `POST /api/ai/questions`
- `POST /api/ai/email`
- `POST /api/ai/skill-gap`
- `POST /api/ai/duplicate-check`
- `POST /api/ai/rank`

## Environment
Set `OPENAI_API_KEY`.
Optional:
- `AI_MODEL` (default `gpt-4o-mini`)
- `AI_EMBEDDING_MODEL` (default `text-embedding-3-small`)

## Suggested DB fields
Candidates:
- `ai_summary TEXT`
- `embedding VECTOR`

Applications:
- `ai_score FLOAT`
- `ai_report JSON`
