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
  inputHint: string;
  placeholder: string;
  initialPayload: string;
};

const TOOLS: ToolConfig[] = [
  {
    id: "score",
    title: "Check Resume Match",
    description: "See how well a resume matches a job post.",
    endpoint: "/api/ai/score",
    inputHint: "resume: Your resume text\njob: Job description",
    placeholder: "resume: ...\njob: ...",
    initialPayload:
      "resume: 5 years React, Node, SQL, system design\njob: Senior frontend engineer with React, TypeScript, testing, architecture",
  },
  {
    id: "summary",
    title: "Create Resume Summary",
    description: "Turn resume text into a short summary.",
    endpoint: "/api/ai/summary",
    inputHint: "resume: Your resume text",
    placeholder: "resume: ...",
    initialPayload:
      "resume: Full-stack engineer with product mindset and strong communication.",
  },
  {
    id: "questions",
    title: "Make Interview Questions",
    description: "Generate interview questions for a role.",
    endpoint: "/api/ai/questions",
    inputHint: "role: Frontend Engineer\nlevel: Senior\nskills: React, TypeScript",
    placeholder: "role: Frontend Engineer\nlevel: Senior\nskills: React, TypeScript",
    initialPayload:
      "role: Frontend Engineer\nlevel: Senior\nskills: React, TypeScript, Testing",
  },
  {
    id: "email",
    title: "Write Outreach Email",
    description: "Create a ready-to-send recruiter email.",
    endpoint: "/api/ai/email",
    inputHint: "purpose: Initial outreach\ntone: Friendly\nname: Alex\nrole: Product Engineer\nextra: Remote-first",
    placeholder:
      "purpose: Initial outreach\ntone: Friendly\nname: Alex\nrole: Product Engineer\nextra: Remote-first",
    initialPayload:
      "purpose: Initial outreach\ntone: Professional\nname: Alex\nrole: Product Engineer\nextra: React + AI stack",
  },
  {
    id: "skill-gap",
    title: "Find Missing Skills",
    description: "Compare current skills with job needs.",
    endpoint: "/api/ai/skill-gap",
    inputHint: "candidateSkills: React, CSS\njobRequirements: React, TypeScript, Testing",
    placeholder:
      "candidateSkills: React, CSS\njobRequirements: React, TypeScript, Testing",
    initialPayload:
      "candidateSkills: React, CSS, Accessibility\njobRequirements: React, TypeScript, Testing, Next.js",
  },
  {
    id: "duplicate-check",
    title: "Check Duplicate Candidate",
    description: "Flag resumes that may be duplicates.",
    endpoint: "/api/ai/duplicate-check",
    inputHint: "resumeText: Resume content\nthreshold: 0.92",
    placeholder:
      "resumeText: ...\nthreshold: 0.92",
    initialPayload:
      "resumeText: Frontend engineer with 6 years building SaaS dashboards.\nthreshold: 0.92",
  },
  {
    id: "rank",
    title: "Rank Candidates",
    description: "Sort candidates by fit for a role.",
    endpoint: "/api/ai/rank",
    inputHint:
      "preferredYears: 4\njobSkills: React, TypeScript\ncandidate: c1 | score=84 | years=5 | skills=React, TypeScript, Node\ncandidate: c2 | score=79 | years=3 | skills=React, CSS",
    placeholder:
      "preferredYears: 4\njobSkills: React\ncandidate: c1 | score=84 | years=5 | skills=React, TypeScript",
    initialPayload:
      "preferredYears: 4\njobSkills: React, TypeScript\ncandidate: c1 | score=84 | years=5 | skills=React, TypeScript, Node\ncandidate: c2 | score=79 | years=3 | skills=React, CSS",
  },
];

const defaultResult = "Click \"Run Tool\" to view results here.";

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseFriendlyInput(toolId: ToolId, raw: string) {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const fields = new Map<string, string[]>();
  for (const line of lines) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (!key || !value) continue;
    const existing = fields.get(key) ?? [];
    fields.set(key, [...existing, value]);
  }

  if (toolId === "score") {
    return { resume: fields.get("resume")?.[0] ?? "", job: fields.get("job")?.[0] ?? "" };
  }

  if (toolId === "summary") {
    return { resume: fields.get("resume")?.[0] ?? "" };
  }

  if (toolId === "questions") {
    return {
      role: fields.get("role")?.[0] ?? "",
      level: fields.get("level")?.[0] ?? "",
      skills: parseList(fields.get("skills")?.[0] ?? ""),
    };
  }

  if (toolId === "email") {
    return {
      purpose: fields.get("purpose")?.[0] ?? "",
      tone: fields.get("tone")?.[0] ?? "",
      name: fields.get("name")?.[0] ?? "",
      role: fields.get("role")?.[0] ?? "",
      extra: fields.get("extra")?.[0] ?? "",
    };
  }

  if (toolId === "skill-gap") {
    return {
      candidateSkills: parseList(fields.get("candidateSkills")?.[0] ?? ""),
      jobRequirements: parseList(fields.get("jobRequirements")?.[0] ?? ""),
    };
  }

  if (toolId === "duplicate-check") {
    return {
      resumeText: fields.get("resumeText")?.[0] ?? "",
      existingEmbeddings: [],
      threshold: Number(fields.get("threshold")?.[0] ?? "0.92"),
    };
  }

  const candidates = (fields.get("candidate") ?? []).map((candidateLine) => {
    const chunks = candidateLine.split("|").map((chunk) => chunk.trim());
    const candidateId = chunks[0] ?? "candidate";
    const details = new Map<string, string>();

    for (const chunk of chunks.slice(1)) {
      const [rawKey, rawValue] = chunk.split("=").map((item) => item.trim());
      if (rawKey && rawValue) {
        details.set(rawKey, rawValue);
      }
    }

    return {
      candidateId,
      aiScore: Number(details.get("score") ?? "0"),
      yearsExperience: Number(details.get("years") ?? "0"),
      resumeSkills: parseList(details.get("skills") ?? ""),
    };
  });

  return {
    candidates,
    jobSkills: parseList(fields.get("jobSkills")?.[0] ?? ""),
    preferredYears: Number(fields.get("preferredYears")?.[0] ?? "0"),
  };
}

function formatResult(data: unknown, indent = "") {
  if (Array.isArray(data)) {
    return data.map((item, index) => `${indent}${index + 1}. ${formatResult(item)}`).join("\n");
  }

  if (data && typeof data === "object") {
    const entries = Object.entries(data as Record<string, unknown>);
    return entries
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          if (!value.length) return `${indent}${key}: none`;
          const list = value.map((item) => `${indent}  - ${formatResult(item)}`).join("\n");
          return `${indent}${key}:\n${list}`;
        }

        if (value && typeof value === "object") {
          return `${indent}${key}:\n${formatResult(value, `${indent}  `)}`;
        }

        return `${indent}${key}: ${String(value)}`;
      })
      .join("\n");
  }

  return String(data ?? "");
}

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

    const parsed = parseFriendlyInput(activeTool.id, payload);

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

      setResult(formatResult(data));
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

      setResult(formatResult(data));
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
            Tool Input (friendly text)
          </label>
          <p className="helper-text">Use one field per line. Format: key: value</p>
          <pre className="input-hint">{activeTool.inputHint}</pre>

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
