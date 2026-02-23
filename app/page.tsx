"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [goal, setGoal] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!goal.trim()) return;
    router.push(`/resume?goal=${encodeURIComponent(goal.trim())}`);
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <h1>AIRIE Hiring Helper</h1>
        <p>Start by telling AIRIE what you want, then continue to add resume text on the next screen.</p>
      </header>

      <section className="panel intake-panel">
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
    </main>
  );
}
