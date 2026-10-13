/**
 * Natty Fitness Trainer: scores each questionnaire response into a profile
 * card, following the "Scoring → program" tab of the Claude Doc "Client
 * Questionnaire — Natty Fitness Trainer" (v2 form: one form for everyone).
 *
 * Bound to the private sheet "Questionnaire responses (private)". The copy
 * in the repo is the source; the live copy is the one pasted into the sheet.
 *
 * WHAT IT ADDS TO THE SHEET
 *   - Rubric: every number and table the scoring uses, as editable cells,
 *     plus the Questions map (short key → exact question title). The script
 *     reads it on every run and hard-codes none of it. Change a cell, then
 *     run Questionnaire → Rescore all.
 *   - Profile: one row per response (the profile card), colored by safety.
 *     Client?, Start date and Notes are yours; rescoring never touches them.
 *   - Call prep (rebuilt): pick an email to see that person's profile card
 *     and every answer.
 *
 * HOW TO INSTALL (once)
 *   1. Open the sheet "Questionnaire responses (private)", then
 *      Extensions > Apps Script. Replace Code.gs with this file and save.
 *   2. Choose setUp in the toolbar and press Run. Approve the permissions
 *      (this spreadsheet, the linked form, sending you email, triggers).
 *   3. Reload the sheet. A "Questionnaire" menu appears.
 *   After that it runs by itself: each new response is scored and you get a
 *   short email. Turn off Google Forms' own notification email if you like.
 *
 * RULES IT KEEPS
 *   - No email address is stored anywhere: emails go to the account that
 *     installed the script.
 *   - The email has a name, a safety color, a level, days × minutes and a
 *     link. No health details leave this sheet.
 *   - Nothing goes to the Leads sheet.
 *   - Clean-up: every day, answers and Profile rows of people whose Client?
 *     box isn't ticked are deleted after the Rubric's retention period
 *     (6 months), from this sheet and from the form itself.
 */

const RUBRIC_TAB = "Rubric";
const PROFILE_TAB = "Profile";
const CALL_PREP_TAB = "Call prep";

const PROFILE_COLUMNS = [
  "Submitted",
  "Name",
  "Email",
  "Safety",
  "Avoid / limit",
  "Level",
  "Goal",
  "Starting days × minutes",
  "Split",
  "Reps and effort",
  "Weekly sets per muscle",
  "Cardio",
  "Top 3 priorities",
  "Equipment",
  "Recovery flags",
  "Life stage",
  "Client?",
  "Start date",
  "Re-test",
  "Notes",
  "Response key",
  "Scored",
];
const COL = {}; // 1-based column number by name
PROFILE_COLUMNS.forEach(function (name, i) {
  COL[name] = i + 1;
});
/** Columns the script writes; Client?, Start date and Notes are yours. */
const SCORED_THROUGH = COL["Life stage"];
const SAFETY_FILL = { Red: "#f4cccc", Yellow: "#fff2cc", Green: "#d9ead3" };

// ---------------------------------------------------------------------------
// Default Rubric. Written to the Rubric tab the first time only; after that
// the tab is the source of truth. Every number comes from the questionnaire
// doc ("Scoring → program" and Section 8).
// ---------------------------------------------------------------------------

// prettier-ignore
const DEFAULT_RUBRIC = [
  {
    name: "Settings",
    note: "Single numbers and switches.",
    header: ["Key", "Value", "What it does"],
    rows: [
      ["confidenceThreshold", "7", "Confidence (2.8) under this starts one day below the days available."],
      ["minStartDays", "2", "Never start below this many days a week."],
      ["skillMax", "3", "Movement skill (C) when every counted movement is comfortable."],
      ["skillIfSkipped", "1", "Movement skill (C) when the comfortable-movements question is skipped."],
      ["scoreMin", "0", "Lowest level score."],
      ["scoreMax", "9", "Highest level score."],
      ["pushupBonus", "1", "Added for standard push-ups at or above the higher \"good\" cut-off of the two norm tables."],
      ["pushupPenalty", "1", "Taken off below the lower \"average\" cut-off, or for the knee or incline version."],
      ["recoveryHoldFlags", "2", "With this many recovery flags, hold volume flat for 4 weeks and stop one rep further from failure."],
      ["balanceFlagSeconds", "10", "One-leg balance under this (either leg) adds balance work."],
      ["restingHrFlag", "100", "Resting heart rate over this: refer before progressing."],
      ["retestDays", "28", "Re-test date = Start date + this many days."],
      ["retentionDays", "183", "Non-clients' answers and Profile rows are deleted after this many days."],
      ["retentionOn", "Yes", "Yes = run the daily clean-up."],
      ["emailOn", "Yes", "Yes = email you a short summary of each new response."],
    ],
  },
  {
    name: "Questions",
    note: "Short key → the exact question title (= the column header). Reworded a question? Change it here.",
    header: ["Key", "Question title", "Used for"],
    rows: [
      ["email", "Email", "Profile, Call prep, clean-up"],
      ["name", "Full name", "Profile, email"],
      ["callMe", "What should I call you?", "Profile"],
      ["age", "Age range", "Norms, life stage"],
      ["goal", "What's your main goal right now?", "Step 4"],
      ["goal2", "Anything else you'd like to work on?", "Goal (one accessory block)"],
      ["eventDate", "Is there a date you're working toward (event, trip, season)?", "Sport or event goal"],
      ["confidence", "How confident are you that you can stick with a plan for 3 months?", "Step 3"],
      ["active", "In the last 3 months, have you done planned exercise for 30+ minutes at a moderate effort (breathing harder but still able to talk) on 3 or more days a week?", "Step 1"],
      ["conditions", "Has a doctor ever told you that you have any of these?", "Step 1"],
      ["symptoms", "Do you ever notice any of these, at rest or during activity?", "Step 1"],
      ["medication", "Do you take any medication that affects your heart rate, blood pressure, blood sugar or blood clotting?", "Step 1"],
      ["injuries", "Any pain, injury or surgery in the last 2 years?", "Avoid / limit, priorities"],
      ["limits", "Has a doctor or physical therapist told you to avoid or limit any activity?", "Step 1"],
      ["planAround", "Do any of these apply to you right now?", "Step 1, avoid / limit, life stage"],
      ["experience", "How long have you trained consistently (2+ times a week)?", "Step 2"],
      ["strengthDays", "In a typical week, how many days do you strength train?", "Step 2"],
      ["comfortable", "Which of these can you do comfortably, with good form?", "Step 2, priorities"],
      ["painful", "Do any of these cause pain, so you avoid them?", "Step 2, priorities"],
      ["whereInPerson", "Where would you like to train with me?", "Equipment"],
      ["ownWorkouts", "Where will you do most of your own workouts?", "Equipment"],
      ["equipment", "What equipment can you use?", "Equipment"],
      ["weights", "If you have dumbbells or kettlebells, what weights?", "Equipment"],
      ["filming", "Could you film a set now and then so I can check your form?", "Equipment"],
      ["days", "How many days a week can you realistically train?", "Step 3"],
      ["minutes", "How long can a session be?", "Step 3"],
      ["workday", "What does a typical workday look like?", "Recovery flags"],
      ["sleep", "On average, how many hours do you sleep a night?", "Recovery flags"],
      ["stress", "How would you rate your stress lately?", "Recovery flags"],
      ["restingHr", "Resting heart rate (beats per minute)", "Priorities"],
      ["balance", "One-leg balance (seconds): left leg, then right leg", "Priorities"],
      ["chairStand", "30-second chair stand (number of stands)", "Priorities"],
      ["pushupVersion", "Push-ups: which version did you do?", "Step 2"],
      ["pushupReps", "Push-ups: how many in a row?", "Step 2"],
    ],
  },
  {
    name: "Answer wording",
    note: "Answer text the rules look for. \"is\" = the whole answer; \"contains\" = anywhere in it. | separates alternatives.",
    header: ["Key", "How", "Matches", "Meaning"],
    rows: [
      ["none", "is", "None of these", "Nothing ticked in 3.3 or 4.2"],
      ["knownDisease", "contains", "heart condition|Stroke|Diabetes|Kidney disease", "Known disease (3.2): Red if inactive, Yellow if active"],
      ["discuss", "contains", "Not sure|Prefer to discuss", "Yellow when in 3.2–3.4"],
      ["otherConditions", "contains", "High blood pressure|Asthma|Osteoporosis", "Plan around (3.2), not a clearance trigger"],
      ["boneHealth", "contains", "Osteoporosis", "Life stage: bone health"],
      ["yes", "is", "Yes", "Yes"],
      ["no", "is", "No", "No"],
      ["noneShort", "is", "None", "\"None\" in 3.6 and 5.5b"],
      ["pregnant", "contains", "Pregnant", "Yellow and life stage (not \"Planning a pregnancy\")"],
      ["postpartum", "contains", "Gave birth in the last 12 months", "Yellow and life stage"],
      ["pelvicFloor", "contains", "Leaking urine", "Avoid / limit, low-impact cardio"],
      ["reds", "contains", "Periods stopped|Unusual fatigue", "Avoid / limit (REDs signs)"],
      ["hernia", "contains", "A hernia", "Avoid / limit"],
      ["hormones", "contains", "testosterone", "Avoid / limit"],
      ["menopause", "contains", "Perimenopause or menopause", "Life stage: bone health"],
      ["noMovement", "is", "None of these yet", "5.5a: nothing comfortable yet"],
      ["noFilming", "is", "I'd rather not", "6.8: pick lower-skill versions for online work"],
      ["standardPushup", "is", "Standard on toes", "Push-up adjustment applies"],
      ["olderAdult", "is", "70+", "Life stage: 65+ rule"],
      ["maybeOlderAdult", "is", "60–69", "Life stage: 65+ rule if 65 or older"],
    ],
  },
  {
    name: "Safety",
    note: "Step 1. What each color means for week one.",
    header: ["Color", "Means for week one"],
    rows: [
      ["Red", "Hold until cleared: no training until a doctor clears them. Book the call, explain why, and send them the PAR-Q+."],
      ["Yellow", "Moderate effort only (RPE 12–13 on the 6–20 scale; in the gym, stop with 3+ reps left) until it's discussed or cleared."],
      ["Green", "Normal progression from Steps 2–5."],
    ],
  },
  {
    name: "Avoid / limit texts",
    note: "Step 1 limits that apply at any color. {x} is filled in from the answers.",
    header: ["Key", "Text"],
    rows: [
      ["reds", "REDs signs (4.2): no calorie deficit and no added volume; suggest a doctor."],
      ["pelvicFloor", "Pelvic floor symptoms (4.2): keep impact and maximal breath-holding low; suggest a pelvic floor PT."],
      ["hernia", "Hernia (4.2): no maximal bracing or heavy lifts until their doctor OKs it. Repair status: check 4.3."],
      ["medication", "Medication for heart rate, blood pressure, blood sugar or clotting (3.4): coach by RPE, not heart rate."],
      ["otherConditions", "{x} (3.2): plan around it, as in Section 3."],
      ["injuries", "Pain or injury in the last 2 years ({x}, 3.6): pain-free ranges only until you assess it in session one."],
      ["painful", "Painful movements ({x}, 5.5b): substitute them; pain-free ranges only until assessed."],
      ["limits", "Doctor or PT limit (3.8): {x}."],
      ["hormones", "Hormone therapy (4.2): set honest expectations for progress; their doctor stays involved."],
      ["restingHr", "Resting heart rate over {x} (8.1): refer before progressing."],
    ],
  },
  {
    name: "Step 2: experience points",
    note: "A. How long they've trained consistently (5.1).",
    header: ["Answer", "Points"],
    rows: [
      ["Never consistently", "0"],
      ["Under 6 months", "1"],
      ["6 months–2 years", "2"],
      ["2–5 years", "3"],
      ["5+ years", "3"],
    ],
  },
  {
    name: "Step 2: strength-day points",
    note: "B. Strength days a week now (5.3).",
    header: ["Answer", "Points"],
    rows: [
      ["0", "0"],
      ["1", "1"],
      ["2", "2"],
      ["3", "3"],
      ["4+", "3"],
    ],
  },
  {
    name: "Movements",
    note: "C. Movement skill = skillMax × comfortable ÷ counted movements that don't hurt (5.5a, 5.5b). Pattern links each movement to the exercise menu.",
    header: ["Movement (exact answer)", "Pattern", "Counts toward skill"],
    rows: [
      ["Squat", "Squat", "Yes"],
      ["Hip hinge (deadlift or kettlebell swing)", "Hinge", "Yes"],
      ["Push-up", "Push", "Yes"],
      ["Row or pull-up", "Pull", "Yes"],
      ["Lunge or split squat", "Single-leg", "Yes"],
      ["Overhead press", "Push", "Yes"],
      ["Running or jumping", "Impact", "Yes"],
    ],
  },
  {
    name: "Step 2: level bands",
    note: "Score (0–9) → level. A band runs from its From up to the next band's From.",
    header: ["From", "Level", "Roughly ACSM's", "Week-one picture"],
    rows: [
      ["0", "Foundation", "Novice", "Learn the patterns; machines, dumbbells and bodyweight; effort kept easy"],
      ["3", "Developing", "Novice", "Basic lifts with light-moderate loads; steady progression"],
      ["6", "Intermediate", "Intermediate", "Multiple sets, splits possible, planned variation"],
      ["8", "Advanced", "Advanced", "Heavier cycles, more volume, periodized blocks"],
    ],
  },
  {
    name: "Push-up norms (ACSM)",
    note: "Standard push-ups by the form's age ranges (Section 8). The form doesn't ask sex, so +1 needs the higher \"good\" cut-off and −1 the lower \"average\" one.",
    header: ["Age range (form)", "Men: average", "Men: good", "Women: average", "Women: good"],
    rows: [
      ["18–29", "24–29", "39–46", "17–22", "30–35"],
      ["30–39", "20–24", "34–40", "14–21", "30–36"],
      ["40–49", "16–20", "28–33", "11–16", "24–30"],
      ["50–59", "13–17", "25–30", "10–13", "21–24"],
      ["60–69", "11–16", "24–29", "5–11", "19–22"],
      ["70+", "11–16", "24–29", "5–11", "19–22"],
    ],
  },
  {
    name: "Chair-stand norms (CDC, 60+)",
    note: "Below average = fall risk. Uses the higher (men's) cut-off of the youngest ages in each range, so more people get balance work. Under 60: baseline only.",
    header: ["Age range (form)", "Flag if under", "From the CDC table"],
    rows: [
      ["60–69", "14", "Men under 14 / 12, women under 12 / 11 (60–64 / 65–69)"],
      ["70+", "12", "Men under 12 / 11, women under 10 / 10 (70–74 / 75–79)"],
    ],
  },
  {
    name: "Step 3: days",
    note: "Days available (7.1) as a number.",
    header: ["Answer", "Days"],
    rows: [
      ["1–2", "2"],
      ["3", "3"],
      ["4", "4"],
      ["5+", "5"],
    ],
  },
  {
    name: "Step 3: split",
    note: "Starting days × level → split.",
    header: ["Days", "Foundation or Developing", "Intermediate", "Advanced"],
    rows: [
      ["2", "Full body × 2", "Full body × 2", "Full body × 2, heavier focus"],
      ["3", "Full body × 3", "Full body × 3, or Upper / Lower / Full", "Upper / Lower / Full"],
      ["4", "Full body × 3 + 1 cardio or mobility day", "Upper / Lower × 2", "Upper / Lower × 2"],
      ["5", "Full body × 3 + 2 cardio or mobility days", "Upper / Lower × 2 + 1 conditioning day", "Upper / Lower + Push / Pull / Legs"],
    ],
  },
  {
    name: "Step 3: session length",
    note: "Session length (7.2).",
    header: ["Answer", "Minutes", "Exercises", "Sets per exercise", "Format"],
    rows: [
      ["30 min", "30", "4–5", "2", "Paired supersets, short rests"],
      ["45 min", "45", "5–6", "2–3", "Supersets for accessories"],
      ["60 min", "60", "6–8", "3", "Straight sets on the main lifts"],
      ["75+ min", "75", "7–9", "3–4", "Full 2–3 min rests on heavy lifts"],
    ],
  },
  {
    name: "Step 4: goals",
    note: "Main goal (2.1). Level rules below override this table.",
    header: ["Goal", "Main lifts (reps)", "Accessories (reps)", "Weekly sets per muscle (build up to)", "Start weekly sets", "Cardio"],
    rows: [
      ["Build strength", "3–6 once Developing; Advanced cycles 80–100% of 1RM", "8–12", "6–10", "6", "2 easy sessions or a step target"],
      ["Build muscle", "6–12", "10–15", "10+", "6", "1–2 easy sessions"],
      ["Lose body fat", "6–12", "10–15", "6–10, enough to keep muscle", "6", "150–300 min moderate a week, plus steps"],
      ["Lose fat and build muscle", "6–12", "10–15", "10+", "6", "About 150 min moderate a week"],
      ["Improve fitness and energy", "8–12", "12–15", "6–10", "6", "150–300 min moderate a week"],
      ["Move better with less pain", "8–15, slow and pain-free", "Mobility work", "6–10", "6", "Walking"],
      ["Train for a sport or event", "Plan backward from the date in 2.5: base, then strength, then sport-specific", "", "", "", "Sport-specific"],
      ["Stay strong as I get older", "6–12", "10–15, plus balance work", "6–10", "6", "150 min; 65+: balance and strength on 3+ days"],
    ],
  },
  {
    name: "Step 4: level rules",
    note: "These override the goal table. Yellow uses Foundation effort until cleared.",
    header: ["Level", "Sets per exercise", "Effort", "When the goal table fully applies"],
    rows: [
      ["Foundation", "1–2 for weeks 1–4, then 2–3", "Stop with 3–4 reps left; technique first", "After about 8 weeks of clean technique"],
      ["Developing", "2–3", "Stop with 2–3 reps left (about 60–70% of 1RM)", "Main-lift strength sets (3–6) after 4–8 weeks"],
      ["Intermediate", "3–4", "1–3 reps left; vary heavy and moderate days", "Now"],
      ["Advanced", "3–5", "Planned heavy cycles, near-maximal sets used sparingly", "Now, in blocks"],
    ],
  },
  {
    name: "Step 5: recovery flags",
    note: "Count the flags. Rule \"one of\" = the answer is one of the values; \"at least\" = a number at or above it.",
    header: ["Flag", "Question key", "Rule", "Value"],
    rows: [
      ["Sleep under 7 hours", "sleep", "one of", "Under 5|5–6|6–7"],
      ["Stress 4 or 5", "stress", "at least", "4"],
      ["Physically demanding job", "workday", "one of", "Physically demanding"],
    ],
  },
  {
    name: "Step 5: recovery advice",
    note: "By number of flags (the last row covers that many or more).",
    header: ["Flags", "Advice"],
    rows: [
      ["0", "None"],
      ["1", "Start at the low end of the volume range"],
      ["2", "Start at the low end, hold volume flat for 4 weeks, and stop one rep further from failure"],
    ],
  },
  {
    name: "Step 5: exercise menu",
    note: "Start at the left of each cell and progress right.",
    header: ["Pattern", "Bodyweight and bands", "Dumbbells or kettlebells", "Full gym"],
    rows: [
      ["Squat", "Box squat → tempo squat", "Goblet squat", "Leg press → back or front squat"],
      ["Hinge", "Glute bridge → hinge with a broomstick", "Dumbbell RDL → kettlebell swing (Developing+)", "RDL → trap-bar or barbell deadlift"],
      ["Push", "Incline push-up → push-up", "Dumbbell bench or floor press", "Bench press, overhead press"],
      ["Pull", "Band row → towel or table row", "One-arm dumbbell row", "Lat pulldown → assisted pull-up → pull-up"],
      ["Single-leg", "Supported split squat", "Reverse lunge, step-up", "Bulgarian split squat"],
      ["Core and carry", "Dead bug, plank", "Suitcase carry, side plank", "Pallof press, cable chop"],
    ],
  },
  {
    name: "Step 5: equipment tiers",
    note: "First matching row wins (6.5, 6.6). The last row is the default.",
    header: ["Tier (menu column)", "Own workouts (any of)", "Equipment (any of)"],
    rows: [
      ["Full gym", "Commercial gym", "Full commercial gym|Barbell and plates|Squat rack|Cable machine|Leg press or other machines"],
      ["Dumbbells or kettlebells", "", "Dumbbells|Kettlebells"],
      ["Bodyweight and bands", "", ""],
    ],
  },
  {
    name: "Step 5: injury areas",
    note: "Pain or injury area (3.6) → patterns to assess first.",
    header: ["Area (exact answer)", "Patterns"],
    rows: [
      ["Neck", "Push"],
      ["Shoulder", "Push, Pull"],
      ["Elbow, wrist or hand", "Push, Pull"],
      ["Upper back", "Pull"],
      ["Lower back", "Hinge"],
      ["Hip", "Hinge, Squat"],
      ["Knee", "Squat, Single-leg"],
      ["Ankle or foot", "Single-leg, Impact"],
    ],
  },
  {
    name: "Life stage texts",
    note: "On top of Step 1's limits.",
    header: ["Key", "Text"],
    rows: [
      ["pregnancy", "Pregnant or postpartum: follow their provider's guidance and rebuild gradually; postpartum, pelvic floor comes before impact."],
      ["boneHealth", "Bone health (perimenopause, menopause or low bone density): build toward heavier lifting and impact as technique allows, with close coaching (LIFTMOR)."],
      ["olderAdult", "70+: balance and strength work on 3+ days a week."],
      ["maybeOlderAdult", "60–69: if they're 65 or older, balance and strength work on 3+ days a week."],
    ],
  },
];

// ---------------------------------------------------------------------------
// Menu, setup and triggers
// ---------------------------------------------------------------------------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Questionnaire")
    .addItem("Rescore all", "rescoreAll")
    .addItem("Rebuild Call prep", "rebuildCallPrep")
    .addItem("Run clean-up now", "runRetention")
    .addSeparator()
    .addItem("Set up (first time)", "setUp")
    .addToUi();
}

/** Creates the tabs and triggers, then scores every existing response. */
function setUp() {
  withLock_(function () {
    const ss = SpreadsheetApp.getActive();
    if (!ss.getSheetByName(RUBRIC_TAB)) {
      writeDefaultRubric_(ss);
    }
    const rubric = readRubric_(ss);
    responsesSheet_(ss, rubric); // fails early if the form isn't linked
    profileSheet_(ss);
    rebuildCallPrep_(ss, rubric);

    const handlers = ["onQuestionnaireSubmit", "runRetention"];
    ScriptApp.getProjectTriggers().forEach(function (trigger) {
      if (handlers.indexOf(trigger.getHandlerFunction()) >= 0) {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    ScriptApp.newTrigger("onQuestionnaireSubmit")
      .forSpreadsheet(ss)
      .onFormSubmit()
      .create();
    ScriptApp.newTrigger("runRetention")
      .timeBased()
      .everyDays(1)
      .atHour(4)
      .create();

    const count = rescoreAll_(ss, rubric);
    ss.toast("Set up done. Scored " + count + " response(s).", "Questionnaire");
  });
}

/** Installable trigger: a new response arrived. */
function onQuestionnaireSubmit(e) {
  withLock_(function () {
    try {
      const ss = SpreadsheetApp.getActive();
      const rubric = readRubric_(ss);
      const responses = responsesSheet_(ss, rubric);
      if (
        e &&
        e.range &&
        e.range.getSheet().getSheetId() !== responses.getSheetId()
      ) {
        return; // Another form linked to this spreadsheet.
      }
      const row = e && e.range ? e.range.getRow() : responses.getLastRow();
      const answers = readAnswers_(responses, row, rubric);
      const card = scoreResponse_(answers, rubric);
      const profileRow = upsertProfile_(ss, card, rubric);
      if (isYes_(rubric.settings.emailOn)) {
        sendSummary_(ss, card, profileRow);
      }
    } catch (error) {
      notifyFailure_(error);
      throw error;
    }
  });
}

/** Rescores every response. Keeps Client?, Start date and Notes. */
function rescoreAll() {
  return withLock_(function () {
    const ss = SpreadsheetApp.getActive();
    return rescoreAll_(ss, readRubric_(ss));
  });
}

function rescoreAll_(ss, rubric) {
  const responses = responsesSheet_(ss, rubric);
  const profile = profileSheet_(ss);
  const kept = manualColumns_(profile);

  const cards = [];
  for (let row = 2; row <= responses.getLastRow(); row++) {
    const answers = readAnswers_(responses, row, rubric);
    if (answers.submitted) {
      cards.push(scoreResponse_(answers, rubric));
    }
  }

  // Clear instead of deleting rows: a sheet must keep a non-frozen row.
  if (profile.getLastRow() > 1) {
    profile
      .getRange(2, 1, profile.getLastRow() - 1, PROFILE_COLUMNS.length)
      .clearContent()
      .clearFormat()
      .clearDataValidations();
  }
  let row = 2;
  cards.forEach(function (card) {
    writeProfileRow_(profile, row++, card, rubric, kept.take(card));
  });
  // Rows that carry your input but no longer match a response (say, the
  // spreadsheet's time zone changed) are kept as they were, never dropped.
  kept.leftovers().forEach(function (entry) {
    profile
      .getRange(row, 1, 1, PROFILE_COLUMNS.length)
      .setValues([entry.values]);
    profile
      .getRange(row, COL["Client?"])
      .insertCheckboxes()
      .setValue(entry.client);
    row++;
  });
  return cards.length;
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// Rubric
// ---------------------------------------------------------------------------

function writeDefaultRubric_(ss) {
  const sheet = ss.insertSheet(RUBRIC_TAB);
  const width = 6;
  const rows = [
    [
      "Rubric: edit any value, then Questionnaire → Rescore all. Keep the [block names] and header rows as they are.",
      "",
      "",
      "",
      "",
      "",
    ],
    ["", "", "", "", "", ""],
  ];
  const headerRows = [];
  const nameRows = [];
  DEFAULT_RUBRIC.forEach(function (block) {
    nameRows.push(rows.length + 1);
    rows.push(pad_(["[" + block.name + "]", block.note], width));
    headerRows.push(rows.length + 1);
    rows.push(pad_(block.header, width));
    block.rows.forEach(function (r) {
      rows.push(pad_(r, width));
    });
    rows.push(pad_([], width));
  });
  const range = sheet.getRange(1, 1, rows.length, width);
  range.setNumberFormat("@"); // keep "1–2", "0" and "4+" exactly as typed
  range.setValues(rows);
  range.setWrap(true).setVerticalAlignment("top");
  sheet.getRange("A1").setFontWeight("bold");
  nameRows.forEach(function (r) {
    sheet.getRange(r, 1).setFontWeight("bold").setFontSize(11);
    sheet.getRange(r, 2).setFontStyle("italic").setFontColor("#666666");
  });
  headerRows.forEach(function (r) {
    sheet
      .getRange(r, 1, 1, width)
      .setFontWeight("bold")
      .setBackground("#eeeeee");
  });
  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 300);
  sheet.setColumnWidth(3, 260);
  sheet.setColumnWidths(4, 3, 220);
}

/** Reads the Rubric tab into lookup objects. Throws if a block is missing. */
function readRubric_(ss) {
  const sheet = ss.getSheetByName(RUBRIC_TAB);
  if (!sheet) {
    throw new Error('The "Rubric" tab is missing. Run Questionnaire → Set up.');
  }
  return parseRubric_(sheet.getDataRange().getDisplayValues());
}

/** Turns the Rubric tab's cells into { blockName: [ {header: value} ] }. */
function parseRubric_(values) {
  const blocks = {};
  for (let r = 0; r < values.length; r++) {
    const match = String(values[r][0])
      .trim()
      .match(/^\[(.+)\]$/);
    if (!match || r + 1 >= values.length) {
      continue;
    }
    const header = values[r + 1].map(function (cell) {
      return String(cell).trim();
    });
    const rows = [];
    for (let k = r + 2; k < values.length; k++) {
      const line = values[k].map(function (cell) {
        return String(cell).trim();
      });
      if (
        line.every(function (cell) {
          return cell === "";
        }) ||
        /^\[.+\]$/.test(line[0])
      ) {
        break;
      }
      const record = {};
      header.forEach(function (name, i) {
        if (name) {
          record[name] = line[i] || "";
        }
      });
      rows.push(record);
    }
    blocks[match[1].trim()] = rows;
  }

  const need = function (name) {
    if (!blocks[name]) {
      throw new Error(
        'The Rubric has no "[' +
          name +
          ']" block. Restore it (see the repo copy) or delete the Rubric tab and run Set up.',
      );
    }
    return blocks[name];
  };
  const keyed = function (name, keyField, valueField) {
    const out = {};
    need(name).forEach(function (row) {
      out[row[keyField]] = valueField ? row[valueField] : row;
    });
    return out;
  };

  DEFAULT_RUBRIC.forEach(function (block) {
    need(block.name);
  });

  return {
    settings: keyed("Settings", "Key", "Value"),
    questions: keyed("Questions", "Key", "Question title"),
    wording: keyed("Answer wording", "Key"),
    safety: keyed("Safety", "Color", "Means for week one"),
    limits: keyed("Avoid / limit texts", "Key", "Text"),
    experience: keyed("Step 2: experience points", "Answer", "Points"),
    strengthDays: keyed("Step 2: strength-day points", "Answer", "Points"),
    movements: need("Movements"),
    bands: need("Step 2: level bands")
      .map(function (row) {
        return {
          from: num_(row["From"]),
          level: row["Level"],
          acsm: row["Roughly ACSM's"],
        };
      })
      .sort(function (a, b) {
        return a.from - b.from;
      }),
    pushups: keyed("Push-up norms (ACSM)", "Age range (form)"),
    chairStand: keyed(
      "Chair-stand norms (CDC, 60+)",
      "Age range (form)",
      "Flag if under",
    ),
    days: keyed("Step 3: days", "Answer", "Days"),
    split: need("Step 3: split"),
    session: keyed("Step 3: session length", "Answer"),
    goals: keyed("Step 4: goals", "Goal"),
    levelRules: keyed("Step 4: level rules", "Level"),
    recoveryFlags: need("Step 5: recovery flags"),
    recoveryAdvice: need("Step 5: recovery advice")
      .map(function (row) {
        return { flags: num_(row["Flags"]), advice: row["Advice"] };
      })
      .sort(function (a, b) {
        return a.flags - b.flags;
      }),
    menu: keyed("Step 5: exercise menu", "Pattern"),
    tiers: need("Step 5: equipment tiers"),
    injuryAreas: keyed(
      "Step 5: injury areas",
      "Area (exact answer)",
      "Patterns",
    ),
    lifeStage: keyed("Life stage texts", "Key", "Text"),
  };
}

// ---------------------------------------------------------------------------
// Answers
// ---------------------------------------------------------------------------

/**
 * The response row as { key: answer } via the Questions map, plus metadata.
 * Answers are read as shown (so "10/12" stays text, not a date); `missing`
 * lists keys whose question title isn't in the header.
 */
function readAnswers_(sheet, row, rubric) {
  const width = sheet.getLastColumn();
  const header = sheet.getRange(1, 1, 1, width).getValues()[0].map(normalize_);
  const range = sheet.getRange(row, 1, 1, width);
  const values = range.getValues()[0];
  const shown = range.getDisplayValues()[0];
  const answers = { missing: [] };
  Object.keys(rubric.questions).forEach(function (key) {
    const index = header.indexOf(normalize_(rubric.questions[key]));
    if (index < 0) {
      answers.missing.push(key);
    }
    answers[key] = index >= 0 ? String(shown[index]).trim() : "";
  });
  answers.submitted =
    values[0] instanceof Date ? values[0] : toDate_(values[0]);
  answers.row = row;
  return answers;
}

// ---------------------------------------------------------------------------
// Scoring (Steps 1–5). Pure: answers + rubric in, a profile card out.
// ---------------------------------------------------------------------------

function scoreResponse_(answers, rubric) {
  const s = rubric.settings;
  const w = function (key, value) {
    return wordingMatch_(rubric.wording[key], value, key);
  };
  const card = {
    key: responseKey_(answers.submitted, answers.email),
    submitted: answers.submitted,
    name:
      answers.name +
      (answers.callMe && answers.callMe !== answers.name
        ? " (" + answers.callMe + ")"
        : ""),
    fullName: answers.name,
    email: answers.email,
  };

  // Step 1: safety. A safety question the sheet can't find stops scoring
  // (you get the failure email); a blank safety answer is never Green.
  const safetyKeys = ["active", "conditions", "symptoms", "medication"];
  const lost = (answers.missing || []).filter(function (key) {
    return safetyKeys.concat(["limits", "planAround"]).indexOf(key) >= 0;
  });
  if (lost.length) {
    throw new Error(
      "The sheet has no column for the safety question(s): " +
        lost.join(", ") +
        ". Update their titles in the Rubric's Questions map, then run Rescore all.",
    );
  }
  const red = [];
  const yellow = [];
  const known = w("knownDisease", answers.conditions);
  if (answers.symptoms && !w("none", answers.symptoms)) {
    red.push("symptom ticked (3.3)");
  }
  const blank = safetyKeys.filter(function (key) {
    return !answers[key];
  });
  if (blank.length) {
    yellow.push("safety answer blank (" + blank.join(", ") + ")");
  }
  if (known && w("no", answers.active)) {
    red.push("known condition and not active now (3.2, 3.1)");
  }
  if (known && w("yes", answers.active)) {
    yellow.push("known condition, active now (3.2, 3.1)");
  }
  if (w("discuss", answers.conditions) || w("discuss", answers.medication)) {
    yellow.push("Not sure or Prefer to discuss (3.2–3.4)");
  }
  if (answers.limits && !w("no", answers.limits)) {
    yellow.push("a doctor or PT limited some activity (3.8)");
  }
  if (
    w("pregnant", answers.planAround) ||
    w("postpartum", answers.planAround)
  ) {
    yellow.push("pregnant or postpartum (4.2): their provider's OK first");
  }
  const color = red.length ? "Red" : yellow.length ? "Yellow" : "Green";
  card.color = color;
  card.safety =
    color +
    (color === "Green" ? "" : ": " + (red.length ? red : yellow).join("; ")) +
    "\n" +
    (rubric.safety[color] || "");

  // Avoid / limit, at any color.
  const movementsAll = rubric.movements.map(function (m) {
    return m["Movement (exact answer)"];
  });
  const painful = selected_(answers.painful, movementsAll);
  const injuries = w("noneShort", answers.injuries)
    ? []
    : selected_(
        answers.injuries,
        Object.keys(rubric.injuryAreas).concat(["Other"]),
      );
  const limits = [];
  const add = function (key, x) {
    if (rubric.limits[key]) {
      limits.push(rubric.limits[key].replace("{x}", x || ""));
    }
  };
  if (w("reds", answers.planAround)) add("reds");
  if (w("pelvicFloor", answers.planAround)) add("pelvicFloor");
  if (w("hernia", answers.planAround)) add("hernia");
  if (w("hormones", answers.planAround)) add("hormones");
  if (w("yes", answers.medication)) add("medication");
  const otherConditions = wordingParts_(rubric.wording.otherConditions).filter(
    function (part) {
      return answers.conditions.indexOf(part) >= 0;
    },
  );
  if (otherConditions.length)
    add("otherConditions", otherConditions.join(", "));
  if (injuries.length) add("injuries", injuries.join(", ").toLowerCase());
  if (painful.length) add("painful", painful.join(", ").toLowerCase());
  if (answers.limits && !w("no", answers.limits)) add("limits", answers.limits);
  const heartRate = numbers_(answers.restingHr);
  if (
    heartRate.length &&
    Math.max.apply(null, heartRate) > num_(s.restingHrFlag)
  ) {
    add("restingHr", s.restingHrFlag);
  }
  card.avoid = limits.length ? limits.join("\n") : "None";

  if (color === "Red") {
    card.level = "Hold until cleared";
    card.blankProgram = true;
    return card;
  }

  // Step 2: level score.
  const a = num_(rubric.experience[answers.experience]);
  const b = num_(rubric.strengthDays[String(answers.strengthDays)]);
  const counted = rubric.movements.filter(function (m) {
    return (
      isYes_(m["Counts toward skill"]) &&
      painful.indexOf(m["Movement (exact answer)"]) < 0
    );
  });
  let c;
  if (!answers.comfortable) {
    c = num_(s.skillIfSkipped);
  } else if (w("noMovement", answers.comfortable) || !counted.length) {
    c = counted.length ? 0 : num_(s.skillIfSkipped);
  } else {
    const comfortable = selected_(
      answers.comfortable,
      counted.map(function (m) {
        return m["Movement (exact answer)"];
      }),
    );
    c = (num_(s.skillMax) * comfortable.length) / counted.length;
  }
  const push = pushupAdjustment_(answers, rubric, w);
  const raw = Math.min(
    num_(s.scoreMax),
    Math.max(num_(s.scoreMin), a + b + c + push.points),
  );
  const score = Math.round(raw * 10) / 10;
  let band = rubric.bands[0];
  rubric.bands.forEach(function (candidate) {
    if (score >= candidate.from) {
      band = candidate;
    }
  });
  card.levelName = band.level;
  card.score = score;
  card.level =
    band.level +
    " (" +
    score.toFixed(1) +
    ") = experience " +
    a +
    " + strength days " +
    b +
    " + movement " +
    c.toFixed(1) +
    (push.note ? "; " + push.note : "") +
    (color === "Yellow" ? "\nFoundation effort until cleared (Yellow)" : "");

  // Step 3: days, split, session.
  const available = num_(rubric.days[answers.days]) || num_(s.minStartDays);
  const confidence =
    answers.confidence === "" ? null : num_(answers.confidence);
  let start = available;
  let reason = "";
  if (
    confidence !== null &&
    confidence < num_(s.confidenceThreshold) &&
    available > num_(s.minStartDays)
  ) {
    start = Math.max(num_(s.minStartDays), available - 1);
    reason =
      " (" +
      available +
      " available; confidence " +
      confidence +
      " is under " +
      s.confidenceThreshold +
      ", so one day less: add it back after 4 consistent weeks)";
  }
  const session = rubric.session[answers.minutes] || null;
  const minutes = session ? session["Minutes"] : "?";
  card.days = start + " × " + minutes + " min" + reason;
  card.startDays = start;
  card.minutes = minutes;
  const splitRow = rubric.split.filter(function (row) {
    return num_(row["Days"]) === Math.min(start, 5);
  })[0];
  const splitColumn = Object.keys(splitRow || {}).filter(function (name) {
    return name !== "Days" && name.indexOf(band.level) >= 0;
  })[0];
  card.split =
    (splitRow && splitColumn ? splitRow[splitColumn] : "Set on the call") +
    (session
      ? "\n" +
        session["Exercises"] +
        " exercises, " +
        session["Sets per exercise"] +
        " sets each · " +
        session["Format"]
      : "");

  // Recovery flags (Step 5), needed for effort and volume.
  const flags = rubric.recoveryFlags.filter(function (flag) {
    const value = answers[flag["Question key"]];
    if (value === "" || value === undefined) {
      return false;
    }
    if (flag["Rule"] === "at least") {
      return num_(value) >= num_(flag["Value"]);
    }
    return (
      wordingParts_({ Matches: flag["Value"] }).indexOf(String(value)) >= 0
    );
  });
  let advice = rubric.recoveryAdvice[0];
  rubric.recoveryAdvice.forEach(function (row) {
    if (flags.length >= row.flags) {
      advice = row;
    }
  });
  const hold = flags.length >= num_(s.recoveryHoldFlags);
  card.recoveryCount = flags.length;
  card.recovery = flags.length
    ? flags
        .map(function (f) {
          return f["Flag"];
        })
        .join(", ") +
      " (" +
      flags.length +
      " flag" +
      (flags.length > 1 ? "s" : "") +
      "): " +
      advice.advice
    : "None";

  // Step 4: goal and level.
  const goal = rubric.goals[answers.goal];
  const rules =
    rubric.levelRules[color === "Yellow" ? "Foundation" : band.level] || {};
  card.goal =
    (answers.goal
      ? answers.goal +
        (answers.eventDate && /sport|event/i.test(answers.goal)
          ? " (date: " + answers.eventDate + ")"
          : "")
      : "Not answered") +
    (answers.goal2
      ? "\nAlso: " +
        answers.goal2 +
        " (one accessory block, not a second program)"
      : "");
  const effort =
    (rules["Effort"] || "") +
    (color === "Yellow" ? " (Yellow: until cleared)" : "") +
    (hold
      ? "; one rep further from failure for the first 4 weeks (recovery)"
      : "");
  if (goal) {
    card.reps =
      "Main lifts " +
      goal["Main lifts (reps)"] +
      (goal["Accessories (reps)"]
        ? ", accessories " + goal["Accessories (reps)"]
        : "") +
      "\n" +
      effort;
    card.weeklySets = goal["Weekly sets per muscle (build up to)"]
      ? "Start around " +
        goal["Start weekly sets"] +
        ", build toward " +
        goal["Weekly sets per muscle (build up to)"] +
        (hold ? "; hold flat for the first 4 weeks" : "")
      : "Set on the call";
    const lowImpact =
      w("pelvicFloor", answers.planAround) ||
      w("pregnant", answers.planAround) ||
      w("postpartum", answers.planAround) ||
      painful.indexOf("Running or jumping") >= 0;
    card.cardio = goal["Cardio"] + (lowImpact ? " (low-impact)" : "");
  } else {
    card.reps =
      'Goal "' + (answers.goal || "none") + '": set on the call\n' + effort;
    card.weeklySets = "Set on the call";
    card.cardio = "Set on the call";
  }

  // Step 5: equipment tier.
  const equipment = answers.equipment;
  const tierRow = rubric.tiers.filter(function (row, i) {
    const own = wordingParts_({ Matches: row["Own workouts (any of)"] });
    const gear = wordingParts_({ Matches: row["Equipment (any of)"] });
    const last = i === rubric.tiers.length - 1;
    return (
      last ||
      own.indexOf(answers.ownWorkouts) >= 0 ||
      selected_(equipment, gear).length > 0
    );
  })[0];
  const tier = tierRow ? tierRow["Tier (menu column)"] : "Bodyweight and bands";
  card.tier = tier;
  card.equipment = [
    answers.whereInPerson ? "With you: " + answers.whereInPerson : "",
    answers.ownWorkouts ? "On their own: " + answers.ownWorkouts : "",
    equipment ? "Equipment: " + equipment : "",
    answers.weights ? "Weights: " + answers.weights : "",
    "Menu column: " + tier,
    w("noFilming", answers.filming)
      ? "Rather not film: pick lower-skill versions for online work"
      : "",
  ]
    .filter(String)
    .join("\n");

  // Step 5: top 3 priorities.
  const patternOf = {};
  rubric.movements.forEach(function (m) {
    patternOf[m["Movement (exact answer)"]] = m["Pattern"];
  });
  const easyColumn =
    band.level === "Foundation" ||
    band.level === "Developing" ||
    color === "Yellow"
      ? "Bodyweight and bands"
      : tier;
  const menuCell = function (pattern, column) {
    return rubric.menu[pattern] ? rubric.menu[pattern][column] : "";
  };
  const firstStep = function (cell) {
    return String(cell || "")
      .split("→")[0]
      .trim();
  };
  const noImpact =
    w("pelvicFloor", answers.planAround) ||
    w("pregnant", answers.planAround) ||
    w("postpartum", answers.planAround);
  // Picked in the doc's order: (1) painful movements and injury areas,
  // (2) one movement they aren't comfortable with yet, (3) self-check flags.
  // Self-check flags always get a place; extra (1) and (2) items fill the
  // rest of the three.
  const firstItems = [];
  const secondItems = [];
  const flagItems = [];
  painful.forEach(function (movement) {
    const pattern = patternOf[movement];
    const base = menuCell(pattern, "Bodyweight and bands");
    firstItems.push({
      pattern: pattern,
      text:
        pattern +
        ": " +
        movement.toLowerCase() +
        " hurts. Substitute and assess it in session one" +
        (base ? "; start at " + base : "") +
        ".",
    });
  });
  injuries.forEach(function (area) {
    String(rubric.injuryAreas[area] || "")
      .split(",")
      .map(function (p) {
        return p.trim();
      })
      .filter(String)
      .forEach(function (pattern) {
        const base = menuCell(pattern, "Bodyweight and bands");
        const then =
          tier !== "Bodyweight and bands"
            ? firstStep(menuCell(pattern, tier))
            : "";
        firstItems.push({
          pattern: pattern,
          text:
            pattern +
            ": assess the " +
            area.toLowerCase() +
            " in session one" +
            (base
              ? "; start at " + base + (then ? ", then " + then : "")
              : "") +
            ".",
        });
      });
  });
  if (answers.comfortable) {
    const ok = selected_(answers.comfortable, movementsAll);
    rubric.movements.forEach(function (m) {
      const movement = m["Movement (exact answer)"];
      const pattern = m["Pattern"];
      if (ok.indexOf(movement) >= 0 || painful.indexOf(movement) >= 0) {
        return;
      }
      secondItems.push({
        pattern: pattern,
        text:
          pattern === "Impact"
            ? noImpact
              ? "Running and jumping: skip for now (pelvic floor or pregnancy answer in 4.2)."
              : "Running and jumping: build up with low-impact conditioning first."
            : pattern +
              " (" +
              movement.toLowerCase() +
              "): teach it with " +
              menuCell(pattern, easyColumn) +
              ".",
      });
    });
  }
  const balance = numbers_(answers.balance);
  if (
    balance.length &&
    Math.min.apply(null, balance) < num_(s.balanceFlagSeconds)
  ) {
    flagItems.push({
      pattern: "balance",
      text:
        "Balance: under " +
        s.balanceFlagSeconds +
        " seconds on one leg (8.4). Balance work every session.",
    });
  }
  const chairLimit = rubric.chairStand[answers.age];
  const stands = numbers_(answers.chairStand);
  if (chairLimit && stands.length && stands[0] < num_(chairLimit)) {
    flagItems.push({
      pattern: "chair",
      text: "Sit-to-stand progressions: chair stand below average for age (8.5).",
    });
  }

  const priorities = [];
  const usedPatterns = {};
  const take = function (items, limit) {
    items.forEach(function (item) {
      if (priorities.length < limit && !usedPatterns[item.pattern]) {
        usedPatterns[item.pattern] = true;
        priorities.push(item.text);
      }
    });
  };
  const room = 3 - Math.min(flagItems.length, 2);
  take(firstItems, Math.max(1, room - (secondItems.length ? 1 : 0)));
  take(secondItems.slice(0, 1), room);
  take(flagItems, 3);
  take(firstItems, 3);
  take(secondItems, 3);
  card.priorities = priorities.length
    ? priorities
        .map(function (p, i) {
          return i + 1 + ") " + p;
        })
        .join("\n")
    : "Use the session-one movement screen";

  // Life stage.
  const stage = [];
  if (w("pregnant", answers.planAround) || w("postpartum", answers.planAround))
    stage.push(rubric.lifeStage.pregnancy);
  if (w("menopause", answers.planAround) || w("boneHealth", answers.conditions))
    stage.push(rubric.lifeStage.boneHealth);
  if (w("olderAdult", answers.age)) stage.push(rubric.lifeStage.olderAdult);
  if (w("maybeOlderAdult", answers.age))
    stage.push(rubric.lifeStage.maybeOlderAdult);
  card.lifeStage = stage.filter(String).join("\n") || "None";

  return card;
}

function pushupAdjustment_(answers, rubric, w) {
  const s = rubric.settings;
  if (answers.pushupReps === "" || answers.pushupReps === undefined) {
    return { points: 0, note: "" };
  }
  const reps = firstNumber_(answers.pushupReps);
  if (answers.pushupVersion && !w("standardPushup", answers.pushupVersion)) {
    return {
      points: -num_(s.pushupPenalty),
      note:
        "push-ups −" +
        s.pushupPenalty +
        " (" +
        answers.pushupVersion.toLowerCase() +
        ")",
    };
  }
  const norms = rubric.pushups[answers.age];
  if (!norms) {
    return {
      points: 0,
      note: 'push-ups: no norms for age "' + answers.age + '"',
    };
  }
  const good = Math.max(
    lowEnd_(norms["Men: good"]),
    lowEnd_(norms["Women: good"]),
  );
  const average = Math.min(
    lowEnd_(norms["Men: average"]),
    lowEnd_(norms["Women: average"]),
  );
  if (reps >= good) {
    return {
      points: num_(s.pushupBonus),
      note: "push-ups +" + s.pushupBonus + " (" + reps + ", good or better)",
    };
  }
  if (reps < average) {
    return {
      points: -num_(s.pushupPenalty),
      note: "push-ups −" + s.pushupPenalty + " (" + reps + ", below average)",
    };
  }
  return { points: 0, note: "push-ups 0 (" + reps + ", average)" };
}

// ---------------------------------------------------------------------------
// Profile tab
// ---------------------------------------------------------------------------

function profileSheet_(ss) {
  let sheet = ss.getSheetByName(PROFILE_TAB);
  if (sheet) {
    return sheet;
  }
  sheet = ss.insertSheet(PROFILE_TAB, 1);
  sheet
    .getRange(1, 1, 1, PROFILE_COLUMNS.length)
    .setValues([PROFILE_COLUMNS])
    .setFontWeight("bold")
    .setBackground("#eeeeee")
    .setWrap(true);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(COL["Name"]);
  sheet.setColumnWidth(COL["Submitted"], 110);
  sheet.setColumnWidth(COL["Name"], 160);
  sheet.setColumnWidth(COL["Email"], 200);
  sheet.setColumnWidths(COL["Safety"], SCORED_THROUGH - COL["Safety"] + 1, 260);
  sheet.setColumnWidth(COL["Client?"], 70);
  sheet.setColumnWidth(COL["Notes"], 260);
  sheet.hideColumns(COL["Response key"]);
  return sheet;
}

/**
 * Your columns (Client?, Start date, Notes) from the current Profile tab.
 * take(card) finds the row for a response by its key, or else the newest
 * unused row with the same email (keys can drift if the spreadsheet's time
 * zone changes). leftovers() returns unused rows that carry your input.
 */
function manualColumns_(sheet) {
  const entries = [];
  const last = sheet.getLastRow();
  if (last >= 2) {
    sheet
      .getRange(2, 1, last - 1, PROFILE_COLUMNS.length)
      .getValues()
      .forEach(function (row) {
        entries.push({
          key: row[COL["Response key"] - 1],
          email: String(row[COL["Email"] - 1] || "")
            .trim()
            .toLowerCase(),
          client: row[COL["Client?"] - 1] === true,
          start: row[COL["Start date"] - 1],
          notes: row[COL["Notes"] - 1],
          values: row,
          used: false,
        });
      });
  }
  const hasInput = function (entry) {
    return entry.client || Boolean(entry.start) || Boolean(entry.notes);
  };
  return {
    entries: entries,
    take: function (card) {
      let match = entries.filter(function (entry) {
        return !entry.used && entry.key && entry.key === card.key;
      })[0];
      if (!match) {
        const email = String(card.email || "")
          .trim()
          .toLowerCase();
        match = entries
          .filter(function (entry) {
            return (
              !entry.used && email && entry.email === email && hasInput(entry)
            );
          })
          .pop();
      }
      if (match) {
        match.used = true;
      }
      return match || null;
    },
    leftovers: function () {
      return entries.filter(function (entry) {
        return !entry.used && hasInput(entry);
      });
    },
    clientEmails: function () {
      const out = {};
      entries.forEach(function (entry) {
        if (entry.client && entry.email) {
          out[entry.email] = true;
        }
      });
      return out;
    },
  };
}

/** Updates this response's Profile row, or adds one. Returns the row number. */
function upsertProfile_(ss, card, rubric) {
  const sheet = profileSheet_(ss);
  const manual = manualColumns_(sheet);
  let row = sheet.getLastRow() + 1;
  let kept = null;
  manual.entries.forEach(function (entry, i) {
    if (!kept && entry.key === card.key) {
      row = i + 2;
      kept = entry;
    }
  });
  if (!kept) {
    // A returning client keeps their Client? tick on the new response.
    const email = String(card.email || "")
      .trim()
      .toLowerCase();
    if (manual.clientEmails()[email]) {
      kept = { client: true, start: "", notes: "" };
    }
  }
  writeProfileRow_(sheet, row, card, rubric, kept);
  return row;
}

function writeProfileRow_(sheet, row, card, rubric, kept) {
  const blank = card.blankProgram;
  const values = [
    card.submitted || "",
    card.name,
    card.email,
    card.safety,
    card.avoid,
    card.level,
    blank ? "" : card.goal,
    blank ? "" : card.days,
    blank ? "" : card.split,
    blank ? "" : card.reps,
    blank ? "" : card.weeklySets,
    blank ? "" : card.cardio,
    blank ? "" : card.priorities,
    blank ? "" : card.equipment,
    blank ? "" : card.recovery,
    blank ? "" : card.lifeStage,
  ].map(safeCell_);
  sheet.getRange(row, 1, 1, SCORED_THROUGH).setValues([values]);
  sheet.getRange(row, COL["Submitted"]).setNumberFormat("mmm d, yyyy");

  const client = sheet.getRange(row, COL["Client?"]);
  client.insertCheckboxes();
  client.setValue(kept ? kept.client === true : false);
  sheet
    .getRange(row, COL["Start date"])
    .setValue(kept && kept.start ? kept.start : "")
    .setNumberFormat("mmm d, yyyy");
  const startCell = columnLetter_(COL["Start date"]) + row;
  sheet
    .getRange(row, COL["Re-test"])
    .setFormula(
      "=IF(" +
        startCell +
        '="","",' +
        startCell +
        "+" +
        num_(rubric.settings.retestDays) +
        ")",
    )
    .setNumberFormat("mmm d, yyyy");
  sheet
    .getRange(row, COL["Notes"])
    .setValue(kept && kept.notes ? kept.notes : "");
  sheet.getRange(row, COL["Response key"]).setValue(card.key);
  sheet
    .getRange(row, COL["Scored"])
    .setValue(new Date())
    .setNumberFormat("mmm d, h:mm am/pm");

  sheet
    .getRange(row, 1, 1, COL["Notes"])
    .setBackground(SAFETY_FILL[card.color] || null)
    .setWrap(true)
    .setVerticalAlignment("top");
}

// ---------------------------------------------------------------------------
// Email (no health details)
// ---------------------------------------------------------------------------

function sendSummary_(ss, card, profileRow) {
  const to = Session.getEffectiveUser().getEmail();
  if (!to) {
    return;
  }
  const profile = ss.getSheetByName(PROFILE_TAB);
  const link =
    ss.getUrl() + "#gid=" + profile.getSheetId() + "&range=A" + profileRow;
  const level =
    card.color === "Red"
      ? "Hold until cleared"
      : card.levelName + " (" + card.score.toFixed(1) + ")";
  const start =
    card.color === "Red" ? "—" : card.startDays + " × " + card.minutes + " min";
  const firstName =
    String(card.fullName || "")
      .trim()
      .split(/\s+/)[0] || "Someone";
  MailApp.sendEmail({
    to: to,
    subject: "Questionnaire scored: " + firstName + " (" + card.color + ")",
    body: [
      (card.fullName || "Someone") + " filled in the questionnaire.",
      "",
      "Safety: " + card.color,
      "Level: " + level,
      "Start: " + start,
      "",
      "Profile row: " + link,
      "",
      "Details stay in the private sheet.",
    ].join("\n"),
  });
}

function notifyFailure_(error) {
  try {
    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      subject: "Questionnaire scoring failed",
      body:
        "A new questionnaire response couldn't be scored: " +
        error.message +
        "\n\nOpen the sheet and run Questionnaire → Rescore all once it's fixed.",
    });
  } catch (ignored) {
    // Nothing more to do.
  }
}

// ---------------------------------------------------------------------------
// Clean-up (daily): non-clients after the retention period
// ---------------------------------------------------------------------------

function runRetention() {
  return withLock_(function () {
    const ss = SpreadsheetApp.getActive();
    return runRetention_(ss, readRubric_(ss));
  });
}

/**
 * Deletes, for everyone whose email isn't ticked Client? in Profile:
 * response rows, form responses and Profile rows older than retentionDays.
 * Each place is checked on its own, so nothing is missed if one step fails
 * or a row was removed by hand. Profile rows with no response left are
 * removed too, unless their person is a client.
 */
function runRetention_(ss, rubric) {
  if (!isYes_(rubric.settings.retentionOn)) {
    return 0;
  }
  const days = num_(rubric.settings.retentionDays);
  if (!(days >= 90)) {
    notifyFailure_(
      new Error(
        'Clean-up skipped: "retentionDays" in the Rubric is "' +
          rubric.settings.retentionDays +
          '". It must be a number of days, at least 90.',
      ),
    );
    return 0;
  }
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const responses = responsesSheet_(ss, rubric);
  const profile = profileSheet_(ss);
  const clients = manualColumns_(profile).clientEmails();
  const lower = function (value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  };
  let removed = 0;

  // 1. Response rows (bottom up so row numbers stay valid).
  for (let row = responses.getLastRow(); row >= 2; row--) {
    const answers = readAnswers_(responses, row, rubric);
    if (
      answers.submitted &&
      answers.submitted < cutoff &&
      !clients[lower(answers.email)]
    ) {
      responses.deleteRow(row);
      removed++;
    }
  }

  // 2. The form's own copy of the responses.
  const form = FormApp.openByUrl(responses.getFormUrl());
  const emailTitle = normalize_(rubric.questions.email);
  form.getResponses().forEach(function (response) {
    if (response.getTimestamp() >= cutoff) {
      return;
    }
    const emailItem = response.getItemResponses().filter(function (item) {
      return normalize_(item.getItem().getTitle()) === emailTitle;
    })[0];
    const email = emailItem ? lower(emailItem.getResponse()) : "";
    if (!clients[email]) {
      form.deleteResponse(response.getId());
      removed++;
    }
  });

  // 3. Profile rows: old ones, and ones whose person has no response left.
  const stillAnswered = {};
  for (let row = 2; row <= responses.getLastRow(); row++) {
    stillAnswered[lower(readAnswers_(responses, row, rubric).email)] = true;
  }
  for (let row = profile.getLastRow(); row >= 2; row--) {
    const values = profile
      .getRange(row, 1, 1, PROFILE_COLUMNS.length)
      .getValues()[0];
    const email = lower(values[COL["Email"] - 1]);
    if (clients[email] || values[COL["Client?"] - 1] === true) {
      continue;
    }
    const submitted = toDate_(values[COL["Submitted"] - 1]);
    if ((submitted && submitted < cutoff) || !stillAnswered[email]) {
      profile.deleteRow(row);
      removed++;
    }
  }
  return removed;
}

// ---------------------------------------------------------------------------
// Call prep: the chosen person's profile card plus every answer
// ---------------------------------------------------------------------------

function rebuildCallPrep() {
  withLock_(function () {
    const ss = SpreadsheetApp.getActive();
    rebuildCallPrep_(ss, readRubric_(ss));
  });
}

function rebuildCallPrep_(ss, rubric) {
  const responses = responsesSheet_(ss, rubric);
  profileSheet_(ss);
  const old = ss.getSheetByName(CALL_PREP_TAB);
  if (old) {
    ss.deleteSheet(old);
  }
  const sheet = ss.insertSheet(CALL_PREP_TAB, Math.min(1, ss.getNumSheets()));
  const r = "'" + responses.getName().replace(/'/g, "''") + "'!";
  const p = "'" + PROFILE_TAB + "'!";
  const header = responses
    .getRange(1, 1, 1, responses.getLastColumn())
    .getValues()[0]
    .map(normalize_);
  const emailIndex = header.indexOf(normalize_(rubric.questions.email));
  const e = columnLetter_(emailIndex >= 0 ? emailIndex + 1 : 2);
  const pe = columnLetter_(COL["Email"]);

  const lookup = function (column) {
    const letter = columnLetter_(COL[column]);
    return (
      "=IF(ISNUMBER($B$3),INDEX(" + p + letter + ":" + letter + ',$B$3),"")'
    );
  };
  const rows = [
    ["Call prep", ""],
    ["Email", ""],
    [
      "Profile row",
      '=IF($B$2="","",IFERROR(MAX(FILTER(ROW(' +
        p +
        pe +
        ":" +
        pe +
        "),LOWER(TRIM(" +
        p +
        pe +
        ":" +
        pe +
        '))=LOWER(TRIM($B$2)))),"Not scored yet"))',
    ],
    [
      "Response row",
      '=IF($B$2="","",IFERROR(MAX(FILTER(ROW(' +
        r +
        e +
        ":" +
        e +
        "),LOWER(TRIM(" +
        r +
        e +
        ":" +
        e +
        '))=LOWER(TRIM($B$2)))),"Not found"))',
    ],
    ["", ""],
    ["Profile card", "From the Profile tab, scored with the Rubric."],
  ];
  PROFILE_COLUMNS.slice(0, COL["Re-test"]).forEach(function (column) {
    if (column !== "Email") {
      rows.push([column, lookup(column)]);
    }
  });
  rows.push(["", ""]);
  rows.push(["All answers", ""]);
  const answers =
    "TRANSPOSE(OFFSET(" + r + "$A$1,$B$4-1,0,1,COLUMNS(" + r + "$1:$1)))";
  const questions = "TRANSPOSE(" + r + "$1:$1)";
  rows.push([
    "=IF(ISNUMBER($B$4),IFERROR(FILTER({" +
      questions +
      "," +
      answers +
      "}," +
      answers +
      '<>"",' +
      questions +
      '<>"Timestamp"),""),"")',
    "",
  ]);
  sheet.getRange(1, 1, rows.length, 2).setValues(rows);

  sheet
    .getRange("B2")
    .setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInRange(responses.getRange(e + "2:" + e), true)
        .setAllowInvalid(true)
        .build(),
    )
    .setBackground("#fff8e1");
  sheet.getRange("C2").setValue("← pick or paste a lead's email");
  sheet.getRange("A1").setFontSize(14).setFontWeight("bold");
  sheet.getRange("A3:B4").setFontColor("#888888");
  sheet.getRange("A6").setFontWeight("bold");
  sheet.getRange("B6").setFontColor("#888888").setFontStyle("italic");
  sheet.getRange(rows.length - 1, 1).setFontWeight("bold");
  ["Submitted", "Start date", "Re-test"].forEach(function (column) {
    const at = rows
      .map(function (row) {
        return row[0];
      })
      .indexOf(column);
    if (at >= 0) {
      sheet.getRange(at + 1, 2).setNumberFormat("mmm d, yyyy");
    }
  });
  sheet.setColumnWidth(1, 300);
  sheet.setColumnWidth(2, 620);
  sheet
    .getRange(1, 1, rows.length + 120, 2)
    .setWrap(true)
    .setVerticalAlignment("top");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * The tab Google Forms writes the questionnaire's answers to: the
 * form-linked tab whose header has the symptoms question (in case another
 * form is linked to this spreadsheet later).
 */
function responsesSheet_(ss, rubric) {
  const linked = ss.getSheets().filter(function (candidate) {
    return Boolean(candidate.getFormUrl());
  });
  if (!linked.length) {
    throw new Error(
      'No form is linked to this spreadsheet. Run this from "Questionnaire responses (private)".',
    );
  }
  if (rubric && linked.length > 1) {
    const wanted = normalize_(rubric.questions.symptoms);
    const match = linked.filter(function (sheet) {
      const width = Math.max(1, sheet.getLastColumn());
      return (
        sheet
          .getRange(1, 1, 1, width)
          .getValues()[0]
          .map(normalize_)
          .indexOf(wanted) >= 0
      );
    })[0];
    if (match) {
      return match;
    }
  }
  return linked[0];
}

/** Stable id for a response: its timestamp plus email. */
function responseKey_(submitted, email) {
  const stamp =
    submitted instanceof Date
      ? submitted.toISOString()
      : String(submitted || "");
  return (
    stamp +
    "|" +
    String(email || "")
      .trim()
      .toLowerCase()
  );
}

/**
 * Which of these exact options a checkbox answer contains. Google joins
 * checkbox answers with ", " and some options contain commas themselves, so
 * this matches whole options rather than splitting.
 */
function selected_(answer, options) {
  const text = String(answer || "").toLowerCase();
  if (!text) {
    return [];
  }
  return options.filter(function (original) {
    const option = String(original || "").toLowerCase();
    if (!option) {
      return false;
    }
    let from = 0;
    while (true) {
      const at = text.indexOf(option, from);
      if (at < 0) {
        return false;
      }
      const before = at === 0 || text.slice(at - 2, at) === ", ";
      const end = at + option.length;
      const after = end === text.length || text.slice(end, end + 2) === ", ";
      if (before && after) {
        return true;
      }
      from = at + 1;
    }
  });
}

function wordingParts_(row) {
  return String((row && row["Matches"]) || "")
    .split("|")
    .map(function (part) {
      return part.trim();
    })
    .filter(String);
}

function wordingMatch_(row, value, key) {
  if (!row) {
    throw new Error(
      'The Rubric\'s "Answer wording" block has no "' + key + '" row.',
    );
  }
  const text = String(value === undefined || value === null ? "" : value)
    .trim()
    .toLowerCase();
  if (!text) {
    return false;
  }
  const parts = wordingParts_(row).map(function (part) {
    return part.toLowerCase();
  });
  if (String(row["How"]).trim().toLowerCase() === "is") {
    return parts.indexOf(text) >= 0;
  }
  return parts.some(function (part) {
    return text.indexOf(part) >= 0;
  });
}

function firstNumber_(value) {
  const found = numbers_(value);
  return found.length ? found[0] : 0;
}

function numbers_(value) {
  return (String(value || "").match(/\d+(\.\d+)?/g) || []).map(Number);
}

function lowEnd_(range) {
  const found = numbers_(range);
  return found.length ? found[0] : 0;
}

function num_(value) {
  const n = Number(
    String(value === undefined || value === null ? "" : value).replace(
      /[^\d.\-]/g,
      "",
    ),
  );
  return isNaN(n) ? 0 : n;
}

function isYes_(value) {
  return /^(yes|true|y|on)$/i.test(String(value || "").trim());
}

function normalize_(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function toDate_(value) {
  if (value instanceof Date) {
    return value;
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

/** Text a sheet would treat as a formula gets a leading apostrophe. */
function safeCell_(value) {
  if (typeof value === "string" && /^[=+\-@]/.test(value)) {
    return "'" + value;
  }
  return value;
}

function pad_(row, width) {
  const out = row.slice(0, width);
  while (out.length < width) {
    out.push("");
  }
  return out;
}

function columnLetter_(number) {
  let letters = "";
  while (number > 0) {
    const remainder = (number - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    number = Math.floor((number - 1) / 26);
  }
  return letters;
}
