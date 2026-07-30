export type SystemKey = "analyzer" | "middleware" | "lis" | "interface" | "ehr";

export type LessonSystem = {
  key: SystemKey;
  label: string;
  eyebrow: string;
  title: string;
  observation: string;
  artifact: Array<[string, string]>;
  flag: string;
  status: "expected" | "changed" | "warning";
};

export const systems: LessonSystem[] = [
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

export const hl7Segments: Array<[string, string]> = [
  ["MSH", "Sending and receiving applications"],
  ["PID", "Patient identification"],
  ["OBR", "The potassium order"],
  ["OBX", "The potassium observation"],
];

export const messageFields = [
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
];

export const answerChoices: Array<[string, string, string]> = [
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
];

export const baseRegressionCases = [
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
    name: "Abnormal text",
    source: "A",
    expected: "A",
    received: "A",
    note: "Qualitative abnormal result",
  },
];
