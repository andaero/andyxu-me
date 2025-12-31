"use client";

import dynamic from "next/dynamic";

// This ensures the 3D scene only renders in the browser
const RotatingGraph = dynamic(() => import("./components/RotatingGraph"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-background" />
});

export default function Home() {
  return (
    <div className="split-container">
      <div className="content-side">
        <div className="container" style={{ margin: "120px auto 80px", maxWidth: "540px" }}>
          <h1>hi! i&apos;m andy</h1>
          
          <p>
            i am currently on leave from <a href="https://www.hmc.edu">harvey mudd</a>, where i studied cs + math, to work on something new.
          </p>

          <p>
            i&apos;ve been thinking a lot about ai4science, continual learning, and long-horizon planning + orchestration.
          </p>

          <p>
            previously, i post trained models for scientific discovery at <a href="https://www.lila.ai/">lila sciences</a> and build applied ai for software at <a href="https://cerebralvalley.ai/blog/iudex-is-ai-observability-that-puts-developers-first-bMLhYFxwVsUSKVbnpO2Eb">iudex</a> (acq xAI). i also worked on llm design and evals in collaboration with <a href="https://instructlab.ai/">ibm instructlabs</a> and <a href="https://www.vals.ai/home">vals ai</a>.
          </p>
       
          <p>
            when i&apos;m not working, you can catch me playing tennis, taking photos, or cheffing up something tasty.
          </p>

          <p>
            i&apos;m always excited to yap with cool people, so please reach out at andxu [at] g [dot] hmc [dot] edu.
          </p>
          <div className="social-links">
          <a href="https://x.com/4ndyXu" target="_blank" rel="noopener noreferrer">twitter</a>
            <span className="separator">/</span>
            <a href="https://scholar.google.com/citations?user=SgQPy6UAAAAJ" target="_blank" rel="noopener noreferrer">google scholar</a>
            <span className="separator">/</span>
            <a href="https://linkedin.com/in/andyxuai" target="_blank" rel="noopener noreferrer">linkedin</a>
          </div>
        </div>
      </div>
      
      <div className="visual-side">
        <RotatingGraph />
      </div>
    </div>
  );
}

