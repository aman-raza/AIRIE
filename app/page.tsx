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
    title: "Check Resume Match",
    description: "See how well a resume matches a job post.",
    endpoint: "/api/ai/score",
    placeholder: "{\n  \"resume\": \"...\",\n  \"job\": \"...\"\n}",
    initialPayload:
      '{\n  "resume": "5 years React, Node, SQL, system design",\n  "job": "Senior frontend engineer with React, TypeScript, testing, architecture"\n}',
  },
  {
    id: "summary",
    title: "Create Resume Summary",
    description: "Turn resume text into a short summary.",
    endpoint: "/api/ai/summary",
    placeholder: '{\n  "resume": "..."\n}',
    initialPayload:
      '{\n  "resume": "Full-stack engineer with product mindset and strong communication."\n}',
  },
  {
    id: "questions",
    title: "Make Interview Questions",
    description: "Generate interview questions for a role.",
    endpoint: "/api/ai/questions",
    placeholder:
      '{\n  "role": "Frontend Engineer",\n  "level": "Senior",\n  "skills": ["React", "TypeScript"]\n}',
    initialPayload:
      '{\n  "role": "Frontend Engineer",\n  "level": "Senior",\n  "skills": ["React", "TypeScript", "Testing"]\n}',
  },
  {
    id: "email",
    title: "Write Outreach Email",
    description: "Create a ready-to-send recruiter email.",
    endpoint: "/api/ai/email",
    placeholder:
      '{\n  "purpose": "Initial outreach",\n  "tone": "Friendly",\n  "name": "Alex",\n  "role": "Product Engineer",\n  "extra": "Remote-first"\n}',
    initialPayload:
      '{\n  "purpose": "Initial outreach",\n  "tone": "Professional",\n  "name": "Alex",\n  "role": "Product Engineer",\n  "extra": "React + AI stack"\n}',
  },
  {
    id: "skill-gap",
    title: "Find Missing Skills",
    description: "Compare current skills with job needs.",
    endpoint: "/api/ai/skill-gap",
    placeholder:
      '{\n  "candidateSkills": ["React", "CSS"],\n  "jobRequirements": ["React", "TypeScript", "Testing"]\n}',
    initialPayload:
      '{\n  "candidateSkills": ["React", "CSS", "Accessibility"],\n  "jobRequirements": ["React", "TypeScript", "Testing", "Next.js"]\n}',
  },
  {
    id: "duplicate-check",
    title: "Check Duplicate Candidate",
    description: "Flag resumes that may be duplicates.",
    endpoint: "/api/ai/duplicate-check",
    placeholder:
      '{\n  "resumeText": "...",\n  "existingEmbeddings": [],\n  "threshold": 0.92\n}',
    initialPayload:
      '{\n  "resumeText": "Frontend engineer with 6 years building SaaS dashboards.",\n  "existingEmbeddings": [],\n  "threshold": 0.92\n}',
  },
  {
    id: "rank",
    title: "Rank Candidates",
    description: "Sort candidates by fit for a role.",
    endpoint: "/api/ai/rank",
    placeholder:
      '{\n  "candidates": [],\n  "jobSkills": ["React"],\n  "preferredYears": 4\n}',
    initialPayload:
      '{\n  "candidates": [\n    {\n      "candidateId": "c1",\n      "aiScore": 84,\n      "yearsExperience": 5,\n      "resumeSkills": ["React", "TypeScript", "Node"]\n    },\n    {\n      "candidateId": "c2",\n      "aiScore": 79,\n      "yearsExperience": 3,\n      "resumeSkills": ["React", "CSS"]\n    }\n  ],\n  "jobSkills": ["React", "TypeScript"],\n  "preferredYears": 4\n}',
  },
];

const defaultResult = "Click \"Run Tool\" to view results here.";

export default function Page() {
  const [activeToolId, setActiveToolId] = useState<ToolId>("score");
  const activeTool = useMemo(() => TOOLS.find((tool) => tool.id === activeToolId)!, [activeToolId]);

  const [payload, setPayload] = useState<string>(activeTool.initialPayload);
  const [result, setResult] = useState<string>(defaultResult);
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
    setResult(defaultResult);
    setError(null);
  }

  async function run() {
    setError(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      setError("Please use valid JSON in the input box.");
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
        setError(`Something went wrong (${response.status}).`);
      }

      setResult(JSON.stringify(data, null, 2));
    } catch {
      setError("Could not connect. Please make sure the app is running.");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeUploadedResume() {
    if (!resumeFile) {
      setError("Please choose a resume file first.");
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
        setError(data?.error ?? `Something went wrong (${response.status}).`);
      }

      setResult(JSON.stringify(data, null, 2));
    } catch {
      setError("Could not upload the file. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <h1>AIRIE Hiring Helper</h1>
        <p>Simple tools to review resumes and support hiring decisions.</p>
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
              <small>{tool.description}</small>
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
              {loading ? "Running..." : "Run Tool"}
            </button>
          </div>

          <label htmlFor="payload" className="label">
            Tool Input (JSON)
          </label>

          <div className="upload-box">
            <p className="upload-heading">Upload Resume (Optional)</p>
            <p className="upload-copy">
              Add a resume file (.pdf, .doc, .docx) to auto-read it and get an AI review.
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
            />
            <textarea
              className="editor upload-job"
              placeholder="Optional: Paste job description"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
            />
            <button
              type="button"
              className="run-btn"
              onClick={analyzeUploadedResume}
              disabled={uploading}
            >
              {uploading ? "Analyzing..." : "Analyze Resume"}
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
            Result
          </label>
          <pre id="result" className="result" aria-live="polite">
            {result}
          </pre>
        </article>
      </section>
    </main>
  );
}
