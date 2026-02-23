"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

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

export default function ResumeInputPage() {
  const params = useSearchParams();
  const goal = params.get("goal")?.trim() ?? "";
  const mode = params.get("mode") === "upload" ? "upload" : "text";

  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('Click "Analyze Resume" to view results here.');
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resumeText.trim()) {
      setError("Please paste resume text.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const hasJob = Boolean(jobDescription.trim());
      const endpoint = hasJob ? "/api/ai/score" : "/api/ai/summary";
      const payload = hasJob
        ? {
            resume: `${resumeText.trim()}\n\nCandidate goal: ${goal || "Not provided"}`,
            job: jobDescription.trim(),
          }
        : {
            resume: {
              goal: goal || "Not provided",
              text: resumeText.trim(),
            },
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error ?? `Something went wrong (${response.status}).`);
      }
      setResult(formatResult(data));
    } catch {
      setError("Could not connect. Please make sure the app is running.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resumeFile) {
      setError("Please upload a resume file.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      if (jobDescription.trim()) {
        formData.append("jobDescription", jobDescription.trim());
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
      setError("Could not connect. Please make sure the app is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <h1>{mode === "upload" ? "Resume Upload" : "Resume Text Input"}</h1>
        <p>
          {mode === "upload"
            ? "Upload a resume file, then optionally include a job description for a match score."
            : "Paste the resume text and optionally include a job description for a match score."}
        </p>
      </header>

      <section className="panel intake-panel">
        {mode === "text" && <p className="helper-text"><strong>Your goal:</strong> {goal || "Not provided"}</p>}

        {mode === "upload" ? (
          <form onSubmit={handleUploadAnalyze}>
            <div className="upload-box">
              <p className="upload-heading">Resume file</p>
              <p className="upload-copy">Upload PDF, DOC, or DOCX to extract and analyze resume text.</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
              />
            </div>

            <label htmlFor="jobDescription" className="label">
              Job description (optional)
            </label>
            <textarea
              id="jobDescription"
              className="editor intake-editor short-editor"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste a job description to get a resume match score"
            />

            <div className="actions-row">
              <button type="submit" className="run-btn" disabled={loading}>
                {loading ? "Analyzing..." : "Analyze Resume"}
              </button>
              <Link className="secondary-link" href="/resume?mode=text">
                Switch to text mode
              </Link>
              <Link className="secondary-link" href="/">
                Back to home
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAnalyze}>
            <label htmlFor="resumeText" className="label">
              Resume text
            </label>
            <textarea
              id="resumeText"
              className="editor intake-editor"
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              placeholder="Paste the full resume text here"
            />

            <label htmlFor="jobDescription" className="label">
              Job description (optional)
            </label>
            <textarea
              id="jobDescription"
              className="editor intake-editor short-editor"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste a job description to get a resume match score"
            />

            <div className="actions-row">
              <button type="submit" className="run-btn" disabled={loading}>
                {loading ? "Analyzing..." : "Analyze Resume"}
              </button>
              <Link className="secondary-link" href="/resume?mode=upload">
                Switch to upload mode
              </Link>
              <Link className="secondary-link" href="/">
                Back to home
              </Link>
            </div>
          </form>
        )}

        {error && <p className="error">{error}</p>}

        <label htmlFor="result" className="label">
          Result
        </label>
        <pre id="result" className="result" aria-live="polite">
          {result}
        </pre>
      </section>
    </main>
  );
}
