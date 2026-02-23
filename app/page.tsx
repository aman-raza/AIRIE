"use client";

import { useMemo, useState } from "react";

type ToolId =
  | "score"
  | "summary"
  | "questions"
  | "email"
  | "skill-gap"
  | "duplicate-check"
  | "rank";

type ToolConfig = {
  id: ToolId;
  title: string;
  description: string;
  endpoint: string;
  placeholder: string;
  initialPayload: string;
};

const TOOLS: ToolConfig[] = [
  {
    id: "score",
    title: "Resume Score",
    description: "Scores resume fit against a job description.",
    endpoint: "/api/ai/score",
    placeholder: "{\n  \"resume\": \"...\",\n  \"job\": \"...\"\n}",
    initialPayload:
      '{\n  "resume": "5 years React, Node, SQL, system design",\n  "job": "Senior frontend engineer with React, TypeScript, testing, architecture"\n}',
  },
  {
    id: "summary",
    title: "Resume Summary",
    description: "Generates concise candidate summaries.",
    endpoint: "/api/ai/summary",
    placeholder: '{\n  "resume": "..."\n}',
    initialPayload:
      '{\n  "resume": "Full-stack engineer with product mindset and strong communication."\n}',
  },
  {
    id: "questions",
    title: "Interview Questions",
    description: "Creates technical, behavioral, and scenario questions.",
    endpoint: "/api/ai/questions",
    placeholder:
      '{\n  "role": "Frontend Engineer",\n  "level": "Senior",\n  "skills": ["React", "TypeScript"]\n}',
    initialPayload:
      '{\n  "role": "Frontend Engineer",\n  "level": "Senior",\n  "skills": ["React", "TypeScript", "Testing"]\n}',
  },
  {
    id: "email",
    title: "Recruiter Email",
    description: "Drafts tailored outreach emails.",
    endpoint: "/api/ai/email",
    placeholder:
      '{\n  "purpose": "Initial outreach",\n  "tone": "Friendly",\n  "name": "Alex",\n  "role": "Product Engineer",\n  "extra": "Remote-first"\n}',
    initialPayload:
      '{\n  "purpose": "Initial outreach",\n  "tone": "Professional",\n  "name": "Alex",\n  "role": "Product Engineer",\n  "extra": "React + AI stack"\n}',
  },
  {
    id: "skill-gap",
    title: "Skill Gap",
    description: "Identifies missing skills and learning plan.",
    endpoint: "/api/ai/skill-gap",
    placeholder:
      '{\n  "candidateSkills": ["React", "CSS"],\n  "jobRequirements": ["React", "TypeScript", "Testing"]\n}',
    initialPayload:
      '{\n  "candidateSkills": ["React", "CSS", "Accessibility"],\n  "jobRequirements": ["React", "TypeScript", "Testing", "Next.js"]\n}',
  },
  {
    id: "duplicate-check",
    title: "Duplicate Check",
    description: "Compares embeddings to flag duplicate candidates.",
    endpoint: "/api/ai/duplicate-check",
    placeholder:
      '{\n  "resumeText": "...",\n  "existingEmbeddings": [],\n  "threshold": 0.92\n}',
    initialPayload:
      '{\n  "resumeText": "Frontend engineer with 6 years building SaaS dashboards.",\n  "existingEmbeddings": [],\n  "threshold": 0.92\n}',
  },
  {
    id: "rank",
    title: "Candidate Rank",
    description: "Ranks candidates via weighted hybrid score.",
    endpoint: "/api/ai/rank",
    placeholder:
      '{\n  "candidates": [],\n  "jobSkills": ["React"],\n  "preferredYears": 4\n}',
    initialPayload:
      '{\n  "candidates": [\n    {\n      "candidateId": "c1",\n      "aiScore": 84,\n      "yearsExperience": 5,\n      "resumeSkills": ["React", "TypeScript", "Node"]\n    },\n    {\n      "candidateId": "c2",\n      "aiScore": 79,\n      "yearsExperience": 3,\n      "resumeSkills": ["React", "CSS"]\n    }\n  ],\n  "jobSkills": ["React", "TypeScript"],\n  "preferredYears": 4\n}',
  },
];

export default function Page() {
  const [activeToolId, setActiveToolId] = useState<ToolId>("score");
  const activeTool = useMemo(() => TOOLS.find((tool) => tool.id === activeToolId)!, [activeToolId]);

  const [payload, setPayload] = useState<string>(activeTool.initialPayload);
  const [result, setResult] = useState<string>("Run a request to see the formatted JSON output.");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");

  function switchTool(nextId: ToolId) {
    const nextTool = TOOLS.find((t) => t.id === nextId);
    if (!nextTool) return;
    setActiveToolId(nextId);
    setPayload(nextTool.initialPayload);
    setResult("Run a request to see the formatted JSON output.");
    setError(null);
  }

  async function run() {
    setError(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      setError("Payload must be valid JSON.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(activeTool.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(`Request failed (${response.status}).`);
      }

      setResult(JSON.stringify(data, null, 2));
    } catch {
      setError("Could not reach the API route. Ensure the server is running.");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeUploadedResume() {
    if (!resumeFile) {
      setError("Choose a resume file first.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.set("resume", resumeFile);
      if (jobDescription.trim()) {
        formData.set("jobDescription", jobDescription.trim());
      }

      const response = await fetch("/api/ai/resume-analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? `Request failed (${response.status}).`);
      }

      setResult(JSON.stringify(data, null, 2));
    } catch {
      setError("Could not upload or analyze the resume file.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <h1>AIRIE AI Console</h1>
        <p>Modern minimal interface for testing and operating AI hiring workflows.</p>
      </header>

      <section className="workspace">
        <nav className="tool-list" aria-label="AI tools">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => switchTool(tool.id)}
              className={tool.id === activeToolId ? "tool-chip active" : "tool-chip"}
            >
              <span>{tool.title}</span>
              <small>{tool.endpoint}</small>
            </button>
          ))}
        </nav>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>{activeTool.title}</h2>
              <p>{activeTool.description}</p>
            </div>
            <button type="button" className="run-btn" onClick={run} disabled={loading}>
              {loading ? "Running..." : "Run request"}
            </button>
          </div>

          <label htmlFor="payload" className="label">
            Request JSON
          </label>

          <div className="upload-box">
            <p className="upload-heading">Resume upload analysis</p>
            <p className="upload-copy">
              Upload a resume (.pdf, .doc, .docx) to auto extract text and run AI analysis.
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
            />
            <textarea
              className="editor upload-job"
              placeholder="Optional: paste job description for fit scoring"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
            />
            <button
              type="button"
              className="run-btn"
              onClick={analyzeUploadedResume}
              disabled={uploading}
            >
              {uploading ? "Analyzing..." : "Analyze uploaded resume"}
            </button>
          </div>

          <textarea
            id="payload"
            className="editor"
            value={payload}
            placeholder={activeTool.placeholder}
            onChange={(event) => setPayload(event.target.value)}
          />

          {error && <p className="error">{error}</p>}

          <label htmlFor="result" className="label">
            Response
          </label>
          <pre id="result" className="result" aria-live="polite">
            {result}
          </pre>
        </article>
      </section>
    </main>
  );
}
