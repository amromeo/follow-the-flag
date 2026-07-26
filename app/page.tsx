"use client";

import { useMemo, useState } from "react";
import RepairLabContent from "../content/repair-lab.mdx";

type Theme = "clinical" | "interface";
type SystemKey = "analyzer" | "middleware" | "lis" | "interface" | "ehr";
type ResultTab = "details" | "message" | "history";

const systems: Array<{
  key: SystemKey;
  label: string;
  eyebrow: string;
  title: string;
  observation: string;
  artifact: Array<[string, string]>;
  flag: string;
  status: "expected" | "changed" | "warning";
}> = [
  {
    key: "analyzer",
    label: "Analyzer",
    eyebrow: "01 · Measurement",
    title: "The analyzer produces the result.",
    observation:
      "The potassium measurement is complete. The analyzer identifies it as above the analytical range and sends its local high flag downstream.",
    artifact: [
      ["Result", "6.8 mmol/L"],
      ["Analyzer flag", "H"],
      ["Hemolysis index", "12 · acceptable"],
      ["Result status", "Final"],
    ],
    flag: "H",
    status: "expected",
  },
  {
    key: "middleware",
    label: "Middleware",
    eyebrow: "02 · Rules",
    title: "Middleware recognizes a critical value.",
    observation:
      "The result passes quality and interference checks. A local rule identifies 6.8 mmol/L as critical high and assigns the laboratory’s internal flag.",
    artifact: [
      ["Input flag", "H"],
      ["Critical threshold", "≥ 6.5 mmol/L"],
      ["Local severity", "CH"],
      ["Disposition", "Send to LIS"],
    ],
    flag: "CH",
    status: "changed",
  },
  {
    key: "lis",
    label: "LIS",
    eyebrow: "03 · Laboratory record",
    title: "The LIS understands the local flag.",
    observation:
      "In the LIS, CH is configured as “Critical High.” The result is correctly highlighted and enters the laboratory’s critical-result workflow.",
    artifact: [
      ["Display", "6.8 mmol/L"],
      ["Stored flag", "CH"],
      ["LIS interpretation", "Critical High"],
      ["Outbound status", "Final"],
    ],
    flag: "CH",
    status: "expected",
  },
  {
    key: "interface",
    label: "Interface",
    eyebrow: "04 · Translation",
    title: "The message passes—but the meaning does not.",
    observation:
      "The interface transmits the message successfully. No rule translates the local CH value to a critical-high code understood by the receiving EHR.",
    artifact: [
      ["Message status", "ACK · accepted"],
      ["OBX-5 · value", "6.8"],
      ["OBX-6 · units", "mmol/L"],
      ["OBX-8 · abnormal flag", "CH"],
    ],
    flag: "CH",
    status: "warning",
  },
  {
    key: "ehr",
    label: "EHR",
    eyebrow: "05 · Clinical display",
    title: "The EHR displays a generic blue flag.",
    observation:
      "The numerical result is visible, but the EHR does not recognize CH. It renders a generic blue flag instead of the familiar two red arrows used for other critical-high results.",
    artifact: [
      ["Displayed value", "6.8 mmol/L"],
      ["Received flag", "CH"],
      ["Recognized values", "N · L · H · LL · HH"],
      ["Rendered flag", "Blue flag"],
    ],
    flag: "⚑",
    status: "warning",
  },
];

const hl7Segments = [
  ["MSH", "Sending and receiving applications"],
  ["PID", "Patient identification"],
  ["OBR", "The potassium order"],
  ["OBX", "The potassium observation"],
];

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
    {
      name: "Normal",
      source: "N",
      expected: "N",
      received: "N",
      note: "Routine result",
    },
    {
      name: "High",
      source: "H",
      expected: "H",
      received: "H",
      note: "Above reference interval",
    },
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
    {
      name: "Abnormal text",
      source: "A",
      expected: "A",
      received: "A",
      note: "Qualitative abnormal result",
    },
  ];

  const messageFields = useMemo(
    () => [
      {
        field: "OBX-1",
        name: "Set ID",
        value: "1",
        purpose:
          "Numbers the OBX segment within this group of observations. It helps distinguish repeated OBX segments that belong to the same order.",
        example:
          "The value 1 means this is the first observation segment associated with the potassium order.",
      },
      {
        field: "OBX-2",
        name: "Value type",
        value: "NM",
        purpose:
          "Declares the data type carried in OBX-5, telling the receiver how the result value should be parsed.",
        example:
          "NM means numeric. The EHR should interpret 6.8 as a number rather than free text.",
      },
      {
        field: "OBX-3",
        name: "Observation identifier",
        value: "K^Potassium",
        purpose:
          "Identifies what was measured. It commonly carries a code plus a human-readable test name and may also identify the coding system.",
        example:
          "K is the local test code and Potassium is its display text. The caret separates components inside the field.",
      },
      {
        field: "OBX-5",
        name: "Observation value",
        value: "6.8",
        purpose:
          "Carries the actual result. Its meaning depends on the observation identifier, value type, units and surrounding context.",
        example:
          "The measured potassium result is 6.8. By itself, the number does not say what was measured or which units apply.",
      },
      {
        field: "OBX-6",
        name: "Units",
        value: "mmol/L",
        purpose:
          "States the units for the observation value so that the receiving system can display and interpret the number correctly.",
        example:
          "The value 6.8 is expressed in millimoles per liter. A missing or incorrect unit could change its clinical meaning.",
      },
      {
        field: "OBX-7",
        name: "Reference range",
        value: "3.5-5.0",
        purpose:
          "Provides the reference interval supplied by the sending system. The field can also carry nonnumeric or textual ranges.",
        example:
          "The sender provides 3.5–5.0 as context for interpreting this potassium result.",
      },
      {
        field: "OBX-8",
        name: "Interpretation flag",
        value: "CH",
        purpose:
          "Carries an interpretation such as normal, high, low or critical. Sender and receiver must share—or translate—the same flag vocabulary.",
        example:
          "The LIS uses CH for critical high. The EHR does not define CH, so it renders a generic blue flag instead of its familiar critical-high arrows.",
      },
      {
        field: "OBX-11",
        name: "Result status",
        value: "F",
        purpose:
          "Indicates the result’s lifecycle state, such as preliminary, final or corrected. Receivers use it to decide whether and how to update an existing result.",
        example:
          "F means final. A later corrected result would require an appropriate status so the EHR does not treat it as an unrelated duplicate.",
      },
    ],
    [],
  );
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
          <p className="eyebrow">Clinical informatics case 01</p>
          <h1>Follow the Flag</h1>
          <p className="hero-lede">
            A critical potassium result reached the EHR—but its warning did not.
          </p>
          <p className="hero-description">
            A clinician notices that potassium carries a generic blue flag while
            neighboring critical-high results show the familiar two red arrows.
            It looks like a display quirk. Trace the result across five systems
            and decide whether the inconsistency reveals a deeper problem.
          </p>
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
          <div>
            <p className="eyebrow">The investigation</p>
            <h2>One result. Five representations.</h2>
          </div>
          <p>
            Select each system to compare what it received, understood and sent.
            The numerical result never changes—but watch the flag.
          </p>
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
        <div className="section-intro">
          <div>
            <p className="eyebrow">Message lab</p>
            <h2>Find the meaning inside the message.</h2>
          </div>
          <p>
            HL7 v2 messages are structured text used to exchange clinical events.
            Each line is a segment; pipes divide fields; carets divide components
            within a field. Select an OBX field to see what it is meant to carry.
          </p>
        </div>

        <div className="hl7-primer">
          <div className="primer-copy">
            <p className="eyebrow">HL7 v2 in 60 seconds</p>
            <h3>Meaning comes from position.</h3>
            <p>
              An HL7 message is not a visual report. It is a sequence of named
              segments arranged for a particular event. This <code>ORU^R01</code>
              message communicates an observation result.
            </p>
          </div>
          <div className="primer-model" aria-label="How an HL7 message is organized">
            <div>
              <strong>Message</strong>
              <span>One clinical event</span>
              <code>ORU^R01</code>
            </div>
            <span aria-hidden="true">›</span>
            <div>
              <strong>Segments</strong>
              <span>One line each</span>
              <code>MSH · PID · OBR · OBX</code>
            </div>
            <span aria-hidden="true">›</span>
            <div>
              <strong>Fields</strong>
              <span>Separated by pipes</span>
              <code>OBX|1|NM|…</code>
            </div>
            <span aria-hidden="true">›</span>
            <div>
              <strong>Components</strong>
              <span>Separated by carets</span>
              <code>K^Potassium</code>
            </div>
          </div>
          <p className="primer-note">
            A receiver does not infer meaning from appearance: it interprets each
            value according to the segment, field position, data type and agreed
            code set.
          </p>
        </div>

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
          <p className="eyebrow">Your conclusion</p>
          <h2>Where should the team intervene?</h2>
          <p>
            The value is accurate, the message was accepted and the LIS
            correctly recognized the result as critical. Choose the best
            explanation.
          </p>
        </div>
        <div className="answer-grid" role="radiogroup" aria-label="Choose the best explanation">
          {[
            [
              "analyzer",
              "Replace the analyzer",
              "The analyzer produced an inaccurate potassium result.",
            ],
            [
              "mapping",
              "Repair the flag mapping",
              "Translate or standardize the local critical flag across the interface boundary.",
            ],
            [
              "display",
              "Train clinicians to ignore it",
              "The unfamiliar symbol is cosmetic and does not require a system change.",
            ],
          ].map(([id, title, detail]) => (
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
          <div>
            <p className="eyebrow">Repair lab</p>
            <h2>Translate the flags—then try to break your fix.</h2>
          </div>
          <p>
            You found the mismatch. Now translate the sending system&apos;s
            vocabulary into values the receiving system understands, then test
            the change before it is approved.
          </p>
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
              <strong>{testsRun ? (repairComplete ? "5 / 5 passed" : "3 / 5 passed") : "Not run"}</strong>
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
          <div>
            <span>Why test both directions?</span>
            <p>
              Repairing the potassium 6.8 case alone could leave critical-low
              results broken. Validation should cover the full meaning set, not
              merely reproduce the reported incident.
            </p>
          </div>
          <div>
            <span>Why retest ordinary flags?</span>
            <p>
              A narrowly written transformation can unintentionally alter
              normal, high or qualitative abnormal results that previously
              worked.
            </p>
          </div>
          <div>
            <span>What comes after passing?</span>
            <p>
              Document the change, retain evidence, confirm downstream display
              and monitor the interface after release.
            </p>
          </div>
        </div>
      </section>

      <section className="concepts-section" id="concepts">
        <div className="section-intro">
          <div>
            <p className="eyebrow">Takeaways</p>
            <h2>What this case teaches</h2>
          </div>
        </div>
        <div className="concept-grid">
          <article>
            <span>01</span>
            <h3>Transmission</h3>
            <p>
              A message can arrive successfully and still fail to communicate
              the intended clinical meaning.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Representation</h3>
            <p>
              Local codes and flags require an explicit shared interpretation
              when data crosses a system boundary.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Validation</h3>
            <p>
              Interface testing should include normal, abnormal, critical and
              corrected results—not only ordinary high and low values.
            </p>
          </article>
          <article>
            <span>04</span>
            <h3>Acknowledgment</h3>
            <p>
              An ACK establishes that a message was received. It does not prove
              that every field was interpreted or displayed correctly.
            </p>
          </article>
        </div>
        <div className="closing-statement">
          <span>Key insight</span>
          <strong>
            Correct data is not enough. Its meaning must survive the journey.
          </strong>
        </div>
      </section>

      <footer>
        <strong>Follow the Flag</strong>
        <span>Interactive pathology informatics prototype</span>
        <a href="#case">Return to case ↑</a>
      </footer>
    </main>
  );
}
