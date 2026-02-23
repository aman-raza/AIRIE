"use client";

import Link from "next/link";

const APP_OPTIONS = [
  "Check Resume Match",
  "Create Resume Summary",
  "Make Interview Questions",
  "Write Outreach Email",
  "Find Missing Skills",
  "Check Duplicate Candidate",
  "Rank Candidates",
];

export default function HomePage() {
  return (
    <main className="app-shell">
      <header className="hero">
        <h1>AIRIE Hiring Helper</h1>
        <p>Choose how you want to start: upload a resume file or paste resume text.</p>
      </header>

      <section className="panel intake-panel">
        <h2 className="mode-title">Start with resume input mode</h2>
        <div className="mode-grid">
          <Link className="mode-card" href="/resume?mode=upload">
            <h3>Upload Resume</h3>
            <p>Upload .pdf, .doc, or .docx and let AIRIE extract text automatically.</p>
          </Link>

          <Link className="mode-card" href="/resume?mode=text">
            <h3>Text Mode</h3>
            <p>Paste resume text directly and run analysis without uploading a file.</p>
          </Link>
        </div>

        <div className="options-block">
          <h3>Available options in AIRIE</h3>
          <ul>
            {APP_OPTIONS.map((option) => (
              <li key={option}>{option}</li>
            ))}
          </ul>
          <Link className="secondary-link" href="/tools">
            Open all options
          </Link>
        </div>
      </section>
    </main>
  );
}
