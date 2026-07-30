"use client";

import { useState } from "react";
import DecisionContent from "../content/decision.mdx";
import HeroContent from "../content/hero.mdx";
import InvestigationContent from "../content/investigation.mdx";
import {
  answerChoices,
  baseRegressionCases,
  hl7Segments,
  messageFields,
  systems,
  type SystemKey,
} from "../content/lesson-data";
import MessageLabContent from "../content/message-lab.mdx";
import RepairDebriefContent from "../content/repair-debrief.mdx";
import RepairIntroContent from "../content/repair-intro.mdx";
import RepairLabContent from "../content/repair-lab.mdx";
import TakeawaysContent from "../content/takeaways.mdx";

type Theme = "clinical" | "interface";
type ResultTab = "details" | "message" | "history";

export default function Home() {
  const [theme, setTheme] = useState<Theme>("clinical");
  const [started, setStarted] = useState(false);
  const [activeSystem, setActiveSystem] = useState<SystemKey>("analyzer");
  const [resultTab, setResultTab] = useState<ResultTab>("details");
  const [answer, setAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [selectedField, setSelectedField] = useState("OBX-8");
  const [criticalHighMap, setCriticalHighMap] = useState("CH");
  const [criticalLowMap, setCriticalLowMap] = useState("CL");
  const [testsRun, setTestsRun] = useState(false);

  const activeIndex = systems.findIndex((system) => system.key === activeSystem);
  const active = systems[activeIndex];
  const repairComplete = criticalHighMap === "HH" && criticalLowMap === "LL";

  const regressionCases = [
    ...baseRegressionCases.slice(0, 2),
    {
      name: "Critical high",
      source: "CH",
      expected: "HH",
      received: criticalHighMap,
      note: "Potassium 6.8 mmol/L",
    },
    {
      name: "Critical low",
      source: "CL",
      expected: "LL",
      received: criticalLowMap,
      note: "Potassium 2.1 mmol/L",
    },
    ...baseRegressionCases.slice(2),
  ];
  const passedRegressionCases = regressionCases.filter(
    (testCase) => testCase.received === testCase.expected,
  ).length;

  const selectedFieldInfo =
    messageFields.find((item) => item.field === selectedField) ?? messageFields[0];

  function beginInvestigation() {
    setStarted(true);
    window.setTimeout(() => {
      document
        .getElementById("investigation")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <main className="site-shell" data-theme={theme}>
      <header className="topbar">
        <a className="brand" href="#case" aria-label="Follow the Flag home">
          <span className="brand-mark" aria-hidden="true">
            K
          </span>
          <span>
            <strong>Follow the Flag</strong>
            <small>PIER interactive case</small>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#case">Case</a>
          <a href="#investigation">Investigation</a>
          <a href="#repair-lab">Repair lab</a>
          <a href="#concepts">Concepts</a>
        </nav>
        <div className="theme-switch" role="group" aria-label="Display mode">
          <button
            type="button"
            className={theme === "clinical" ? "selected" : ""}
            aria-pressed={theme === "clinical"}
            onClick={() => setTheme("clinical")}
          >
            <span aria-hidden="true">☼</span> Clinical
          </button>
          <button
            type="button"
            className={theme === "interface" ? "selected" : ""}
            aria-pressed={theme === "interface"}
            onClick={() => setTheme("interface")}
          >
            <span aria-hidden="true">⌘</span> Interface
          </button>
        </div>
      </header>

      <section className="hero" id="case">
        <div className="hero-copy">
          <HeroContent />
          <button className="primary-button" type="button" onClick={beginInvestigation}>
            {started ? "Continue the investigation" : "Begin the investigation"}
            <span aria-hidden="true">→</span>
          </button>
          <div className="case-meta" aria-label="Case details">
            <span>◷ 20 minutes</span>
            <span>Foundational</span>
            <span>No coding required</span>
          </div>
        </div>

        <article className="result-card flowsheet-result-card" aria-label="Synthetic EHR laboratory flowsheet">
          <div className="card-heading">
            <span className="tube-icon" aria-hidden="true">
              ◒
            </span>
            <div>
              <small>Evidence · EHR</small>
              <strong>Patient result</strong>
            </div>
            <span className="case-number">Case 01</span>
          </div>

          <div className="flowsheet-image-wrap">
            <img
              src="assets/flowsheet-flag-mismatch.webp"
              alt="Synthetic Basic Metabolic Panel flowsheet. Sodium 158 and chloride 122 each show two red upward arrows. Potassium 6.8 shows a generic blue flag instead."
              width={1563}
              height={1006}
            />
          </div>
          <div className="flowsheet-prompt">
            <div>
              <small>Notice the inconsistency</small>
              <strong>Why does potassium look different?</strong>
            </div>
            <button
              type="button"
              aria-expanded={showHint}
              onClick={() => setShowHint((value) => !value)}
            >
              <span aria-hidden="true">⚑</span>
              {showHint ? "The EHR does not define this flag" : "Inspect the blue flag"}
            </button>
          </div>

          <div className="result-tabs" role="tablist" aria-label="Result evidence">
            {(["details", "message", "history"] as ResultTab[]).map((tab) => (
              <button
                key={tab}
                role="tab"
                type="button"
                aria-selected={resultTab === tab}
                className={resultTab === tab ? "active" : ""}
                onClick={() => setResultTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="tab-panel" role="tabpanel">
            {resultTab === "details" && (
              <dl>
                <div>
                  <dt>Reference interval</dt>
                  <dd>3.5–5.0 mmol/L</dd>
                </div>
                <div>
                  <dt>EHR flag</dt>
                  <dd>Unrecognized</dd>
                </div>
                <div>
                  <dt>Resulted</dt>
                  <dd>08:22</dd>
                </div>
              </dl>
            )}
            {resultTab === "message" && (
              <div className="message-preview">
                <code>OBX|1|NM|K^Potassium||6.8|mmol/L|3.5-5.0|CH|||F</code>
                <span>Message accepted</span>
              </div>
            )}
            {resultTab === "history" && (
              <ol className="history-list">
                <li>
                  <time>08:17</time> Specimen collected
                </li>
                <li>
                  <time>08:22</time> Result verified
                </li>
                <li>
                  <time>08:22</time> Message acknowledged
                </li>
              </ol>
            )}
          </div>
        </article>

        <div className="system-rail compact" aria-label="Result journey overview">
          {systems.map((system, index) => (
            <div key={system.key} className={index === 4 ? "anomaly" : ""}>
              <span>{index + 1}</span>
              <small>{system.label}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="investigation-section" id="investigation">
        <div className="section-intro">
          <InvestigationContent />
        </div>

        <div className="system-rail investigation-rail" role="tablist" aria-label="Systems">
          {systems.map((system, index) => {
            const isActive = system.key === activeSystem;
            const isVisited = index <= activeIndex;
            return (
              <button
                key={system.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${isActive ? "active" : ""} ${isVisited ? "visited" : ""} ${
                  system.status === "warning" ? "anomaly" : ""
                }`}
                onClick={() => {
                  setStarted(true);
                  setActiveSystem(system.key);
                }}
              >
                <span>{index + 1}</span>
                <small>{system.label}</small>
              </button>
            );
          })}
        </div>

        <div className="evidence-workspace">
          <article className="system-explanation">
            <p className="eyebrow">{active.eyebrow}</p>
            <h3>{active.title}</h3>
            <p>{active.observation}</p>
            <div
              className={`flag-callout ${active.status} ${
                active.key === "ehr" ? "generic-flag" : ""
              }`}
            >
              <span>Flag at this stage</span>
              <strong>{active.flag}</strong>
            </div>
            <div className="step-controls">
              <button
                type="button"
                className="secondary-button"
                disabled={activeIndex === 0}
                onClick={() => setActiveSystem(systems[activeIndex - 1].key)}
              >
                ← Previous
              </button>
              <button
                type="button"
                className="primary-button small"
                disabled={activeIndex === systems.length - 1}
                onClick={() => setActiveSystem(systems[activeIndex + 1].key)}
              >
                Next system →
              </button>
            </div>
          </article>

          <article className="artifact-panel">
            <div className="artifact-header">
              <span>System evidence</span>
              <strong>{active.label}</strong>
            </div>
            <dl>
              {active.artifact.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd
                    className={
                      value === "Blue flag"
                        ? "generic-flag"
                        : value === "CH"
                          ? "signal"
                          : ""
                    }
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="artifact-note">
              <span aria-hidden="true">i</span>
              {active.key === "interface"
                ? "A successful acknowledgment confirms receipt—not correct interpretation."
                : active.key === "ehr"
                  ? "The EHR can display the value while failing to understand its abnormality flag."
                  : "Compare this representation with the next system in the route."}
            </div>
          </article>
        </div>
      </section>

      <section className="message-lab" id="message-lab">
        <MessageLabContent />

        <div className="message-workspace">
          <article className="hl7-panel">
            <div className="segment-key">
              {hl7Segments.map(([segment, meaning]) => (
                <span key={segment}>
                  <strong>{segment}</strong> {meaning}
                </span>
              ))}
            </div>
            <pre aria-label="Example HL7 result message">
              <code>
                <span>MSH|^~\&amp;|LAB|HOSP|EHR|HOSP|202607260822||ORU^R01|K6801|P|2.5</span>
                {"\n"}
                <span>PID|1||458217^^^HOSP^MR||SAMPLE^PATIENT||19790304|F</span>
                {"\n"}
                <span>OBR|1||CHEM6801|K^Potassium|||202607260817</span>
                {"\n"}
                <span className="selected-line">
                  OBX|1|NM|K^Potassium||6.8|mmol/L|3.5-5.0|<mark>CH</mark>|||F
                </span>
              </code>
            </pre>
            <p className="synthetic-note">Synthetic educational message · no patient data</p>
          </article>

          <article className="field-inspector">
            <div className="artifact-header">
              <span>Field inspector</span>
              <strong>OBX segment</strong>
            </div>
            <div className="field-list" role="list">
              {messageFields.map(({ field, name, value }) => (
                <button
                  key={field}
                  type="button"
                  className={selectedField === field ? "selected" : ""}
                  onClick={() => setSelectedField(field)}
                >
                  <span>{field}</span>
                  <span>{name}</span>
                  <strong>{value}</strong>
                </button>
              ))}
            </div>
            <div
              className={`field-explanation ${
                selectedField === "OBX-8" ? "field-warning" : ""
              }`}
            >
              <span className="field-purpose-label">What this field carries</span>
              <strong>
                {selectedFieldInfo.field}: {selectedFieldInfo.name}
              </strong>
              <p>{selectedFieldInfo.purpose}</p>
              <div className="field-example">
                <span>In this message</span>
                <p>{selectedFieldInfo.example}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="decision-section" id="decision">
        <div className="decision-copy">
          <DecisionContent />
        </div>
        <div className="answer-grid" role="radiogroup" aria-label="Choose the best explanation">
          {answerChoices.map(([id, title, detail]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={answer === id}
              className={answer === id ? "selected" : ""}
              onClick={() => setAnswer(id)}
            >
              <span className="radio-dot" />
              <strong>{title}</strong>
              <small>{detail}</small>
            </button>
          ))}
        </div>
        {answer && (
          <div className={`feedback ${answer === "mapping" ? "correct" : "incorrect"}`} role="status">
            <strong>{answer === "mapping" ? "Correct." : "Look one layer deeper."}</strong>
            <p>
              {answer === "mapping"
                ? "The result was transmitted, but its locally defined flag was not translated into a value the EHR understood. The team must align the sender, interface mapping and receiver—and then regression-test every flag category."
                : "The numerical result is consistent across every system. The failure occurs when one system’s local flag crosses into a receiver that does not share its meaning."}
            </p>
          </div>
        )}
      </section>

      <section className="repair-section" id="repair-lab">
        <div className="section-intro">
          <RepairIntroContent />
        </div>

        <div className="translation-brief">
          <RepairLabContent />
        </div>

        <div className="repair-workspace">
          <article className="mapping-builder">
            <div className="artifact-header">
              <span>Translation rule</span>
              <strong>LIS → EHR</strong>
            </div>
            <div className="mapping-context">
              <div>
                <small>Sending LIS</small>
                <strong>Local flags</strong>
                <code>N · L · H · CL · CH</code>
              </div>
              <span aria-hidden="true">→</span>
              <div>
                <small>Receiving EHR</small>
                <strong>Recognized flags</strong>
                <code>N · L · H · LL · HH</code>
              </div>
            </div>

            <div className="mapping-row">
              <div>
                <small>LIS source</small>
                <strong>CH</strong>
                <span>Critical high</span>
              </div>
              <span className="map-arrow" aria-hidden="true">→</span>
              <fieldset>
                <legend>EHR output</legend>
                {["H", "HH", "A"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={criticalHighMap === option}
                    className={criticalHighMap === option ? "selected" : ""}
                    onClick={() => {
                      setCriticalHighMap(option);
                      setTestsRun(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </fieldset>
            </div>

            <div className="mapping-row">
              <div>
                <small>LIS source</small>
                <strong>CL</strong>
                <span>Critical low</span>
              </div>
              <span className="map-arrow" aria-hidden="true">→</span>
              <fieldset>
                <legend>EHR output</legend>
                {["L", "LL", "A"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={criticalLowMap === option}
                    className={criticalLowMap === option ? "selected" : ""}
                    onClick={() => {
                      setCriticalLowMap(option);
                      setTestsRun(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </fieldset>
            </div>

            <div className="rule-preview">
              <span>Proposed transformation</span>
              <code>
                if OBX-8 = &quot;CH&quot;, send &quot;{criticalHighMap}&quot;
                <br />
                if OBX-8 = &quot;CL&quot;, send &quot;{criticalLowMap}&quot;
              </code>
            </div>

            <button
              className="primary-button run-tests"
              type="button"
              onClick={() => setTestsRun(true)}
            >
              Run regression tests <span aria-hidden="true">▶</span>
            </button>
          </article>

          <article className="test-console" aria-live="polite">
            <div className="artifact-header">
              <span>Validation set</span>
              <strong>
                {testsRun
                  ? `${passedRegressionCases} / ${regressionCases.length} passed`
                  : "Not run"}
              </strong>
            </div>
            <div className="test-table" role="table" aria-label="Flag mapping regression tests">
              <div className="test-row test-header" role="row">
                <span role="columnheader">Test case</span>
                <span role="columnheader">LIS</span>
                <span role="columnheader">EHR</span>
                <span role="columnheader">Status</span>
              </div>
              {regressionCases.map((testCase) => {
                const passed = testCase.received === testCase.expected;
                return (
                  <div className="test-row" role="row" key={testCase.name}>
                    <span role="cell">
                      <strong>{testCase.name}</strong>
                      <small>{testCase.note}</small>
                    </span>
                    <code role="cell">{testCase.source}</code>
                    <code role="cell">{testsRun ? testCase.received : "—"}</code>
                    <span
                      role="cell"
                      className={
                        !testsRun ? "test-pending" : passed ? "test-pass" : "test-fail"
                      }
                    >
                      {!testsRun ? "Pending" : passed ? "Pass" : `Expected ${testCase.expected}`}
                    </span>
                  </div>
                );
              })}
            </div>

            {!testsRun && (
              <div className="console-empty">
                <span aria-hidden="true">⌁</span>
                <strong>Your test set is ready.</strong>
                <p>
                  Run it after selecting both translations. A safe change must
                  preserve existing behavior as well as repair the original case.
                </p>
              </div>
            )}

            {testsRun && (
              <div className={`test-summary ${repairComplete ? "success" : "failure"}`}>
                <strong>
                  {repairComplete
                    ? "The proposed mapping passes."
                    : "Do not approve this change yet."}
                </strong>
                <p>
                  {repairComplete
                    ? "Both critical categories now render correctly, and the routine result flags remain unchanged."
                    : "The interface still collapses or misrepresents critical severity. Revise the CH and CL translations and rerun the complete test set."}
                </p>
              </div>
            )}
          </article>
        </div>

        <div className="validation-debrief">
          <RepairDebriefContent />
        </div>
      </section>

      <section className="concepts-section" id="concepts">
        <TakeawaysContent />
      </section>

      <footer>
        <strong>Follow the Flag</strong>
        <span>Interactive pathology informatics prototype</span>
        <a href="#case">Return to case ↑</a>
      </footer>
    </main>
  );
}
