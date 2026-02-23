"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [goal, setGoal] = useState("");

  const options = [
    "Check Resume Match",
    "Create Resume Summary",
    "Make Interview Questions",
    "Write Outreach Email",
    "Find Missing Skills",
    "Check Duplicate Candidate",
    "Rank Candidates",
  ];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!goal.trim()) return;
    router.push(`/resume?goal=${encodeURIComponent(goal.trim())}`);
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <h1>AIRIE Hiring Helper</h1>
        <p>Choose how you want to start: upload a resume file or continue in text mode.</p>
      </header>

      <section className="entry-grid" aria-label="Start options">
        <article className="entry-card">
          <h2>Upload Resume</h2>
          <p>Use a file upload workflow and let AIRIE extract and analyze resume content for you.</p>
          <Link className="run-btn entry-btn" href="/resume?mode=upload">
            Start with Upload
          </Link>
        </article>

        <article className="entry-card">
          <h2>Text Mode</h2>
          <p>Type your goal, paste resume text, and run analysis manually.</p>
          <Link className="run-btn entry-btn" href="/resume?mode=text">
            Start in Text Mode
          </Link>
        </article>
      </section>

      <section className="panel intake-panel">
        <h2 className="subheading">Text mode quick start</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="goal" className="label">
            What would you like to do?
          </label>
          <textarea
            id="goal"
            className="editor intake-editor"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder="Example: I want to know if this candidate matches our backend role and where they are weak."
          />
          <div className="actions-row">
            <button type="submit" className="run-btn" disabled={!goal.trim()}>
              Continue
            </button>
            <Link className="secondary-link" href="/tools">
              Open advanced tools
            </Link>
          </div>
        </form>
      </section>

      <section className="panel intake-panel options-panel">
        <h2 className="subheading">Available AIRIE options</h2>
        <ul className="option-list">
          {options.map((option) => (
            <li key={option}>{option}</li>
          ))}
        </ul>
        <Link className="secondary-link" href="/tools">
          Open all options in advanced tools
        </Link>
      </section>
    </main>
  );
}
