/**
 * Natty Fitness Trainer: builds the client questionnaire as a Google Form.
 *
 * Generated from the Claude Doc "Client Questionnaire — Natty Fitness
 * Trainer" (v2: one form for everyone, no separate men's/women's paths).
 * Run it ONCE to create the form; after that, edit the form in the Google
 * Forms editor. The copy in the repo is for history.
 *
 * It also sets up the private responses sheet with three extra tabs:
 *   - Call prep: pick a lead's email to see their flags, the key answers
 *     and every answer in one column. Formulas only, so nothing is copied
 *     and the 6-month retention clean-up removes everything at once.
 *   - Question stats: how often each question gets answered, so you can
 *     cut what people skip.
 *   - Changes: a log you fill in whenever you edit the form.
 *
 * HOW TO RUN
 *   1. Sign in to Google with the Gmail that holds your Cal.com calendar
 *      (the account that receives leads). Go to script.google.com and click
 *      New project. Name it "Build questionnaire".
 *   2. Replace the contents of Code.gs with this file and save.
 *   3. In the toolbar, choose buildQuestionnaire and press Run. Approve the
 *      permissions (Forms, Sheets).
 *   4. Open the Execution log. It prints the form link, the editor link,
 *      the responses sheet and the three pre-fill keys. Send the block
 *      marked "SEND THIS TO CLAUDE" back to the chat. (If it says the
 *      sheet tabs couldn't be set up yet, run refreshResponseTabs a minute
 *      later.)
 *   5. In the form editor, finish the two settings a script can't change:
 *      Responses > ⋮ > Get email notifications for new responses, and the
 *      theme (palette icon: logo header and colours).
 *
 * Running buildQuestionnaire again refuses to make a second form. To print
 * the links and keys again later, run logQuestionnaireLinks. To rebuild the
 * Call prep and Question stats tabs (say, after deleting and re-adding a
 * question they use), run refreshResponseTabs. Once questionnaire-scoring.gs
 * is installed in the sheet, it owns Call prep and this script leaves it be.
 *
 * KEEP THE PRE-FILL WORKING
 *   - Never delete and recreate "Email", "Full name" or "Which coaching
 *     format are you leaning toward?". Editing their wording is fine.
 *   - The format answers must stay exactly In-person, Online, Hybrid and
 *     Not sure; the website fills them in by those words.
 *   - The reminder script finds the email column by the header "Email".
 *   - Rewording any question is safe for Call prep: it follows the
 *     questions by their internal IDs and sheet columns. Its flags do read
 *     a few answer wordings ("None of these", "No", "Under 6 months"...),
 *     so if you reword an answer option, ask Claude to check the flags.
 */

const FORM_TITLE = "Client Questionnaire — Natty Fitness Trainer";
const RESPONSES_SHEET_NAME = "Questionnaire responses (private)";

const FORM_DESCRIPTION =
  "Thanks for reaching out! This helps me plan your free call around you " +
  "and takes about 10 minutes. Answer what you can — anything optional can " +
  "wait for the call. Only I see your answers. This isn't medical advice " +
  "or a diagnosis. For adults 18 and over.";

const CONFIRMATION_MESSAGE =
  "Thanks — I'll read this before our call. If you haven't picked a time " +
  "yet, book here: https://cal.com/nattyfitnesstrainer/free-consultation. " +
  "Questions? Email hello@nattyfitnesstrainer.com.";

// Pre-filled from the website. Keep these titles and answers in step with
// src/content/consultation.ts.
const EMAIL_TITLE = "Email";
const NAME_TITLE = "Full name";
const FORMAT_TITLE = "Which coaching format are you leaning toward?";
const FORMAT_CHOICES = ["In-person", "Online", "Hybrid", "Not sure"];

const PLAN_AROUND_INTRO =
  "These are optional. No judgment — they help me plan around things that " +
  "affect training, safety and progress. Skip anything you'd rather talk " +
  "about on the call.";

const SELF_CHECK_INTRO =
  "About 10–15 minutes. Do only what fits you and skip anything that " +
  "doesn't feel right. Warm up for 5 minutes first (easy walking, arm " +
  "circles). Stop right away if you feel chest pain or pressure, " +
  "dizziness, unusual shortness of breath or sharp pain, and tell me on " +
  "the call. These numbers are a starting point we'll re-test, not a grade.";

const GOALS = [
  "Build strength",
  "Build muscle",
  "Lose body fat",
  "Lose fat and build muscle",
  "Improve fitness and energy",
  "Move better with less pain",
  "Train for a sport or event",
  "Stay strong as I get older",
];

// One list for everyone instead of separate men's and women's sections:
// each item changes how training is planned (see the questionnaire doc).
const PLAN_AROUND_CHOICES = [
  "Pregnant",
  "Planning a pregnancy in the next 6 months",
  "Gave birth in the last 12 months",
  "Leaking urine or heaviness in the pelvis during exercise, coughing, " +
    "jumping or running",
  "Periods stopped or became irregular while training hard or dieting",
  "Perimenopause or menopause",
  "A hernia (groin or belly), repaired or not",
  "Taking testosterone or another hormone therapy (not birth control)",
  "Unusual fatigue, getting sick often, injuries that won't heal, or a " +
    "drop in sex drive while training hard or dieting",
  "None of these",
  "Prefer to discuss on the call",
];

const MOVEMENTS = [
  "Squat",
  "Hip hinge (deadlift or kettlebell swing)",
  "Lunge or split squat",
  "Push-up",
  "Overhead press",
  "Row or pull-up",
  "Running or jumping",
];

// City Sports Club (San Pablo) and YMCA (Oakland) are left out until their
// outside-trainer policies are confirmed. Add them here when they are.
const TRAINING_LOCATIONS = [
  "My home",
  "My apartment or building gym",
  "My work gym",
  "A park or outdoors",
];

const EQUIPMENT = [
  "None, bodyweight only",
  "Resistance bands",
  "Dumbbells",
  "Kettlebells",
  "Barbell and plates",
  "Squat rack",
  "Adjustable bench",
  "Pull-up bar",
  "Cable machine",
  "Leg press or other machines",
  "Cardio machine (treadmill, bike, rower)",
  "Full commercial gym",
];

// Section 6 questions. Each one exists once, so the responses sheet has
// one column per question and an edit happens in one place.
const Q6 = {
  where: {
    type: "checkbox",
    title: "Where would you like to train with me?",
    choices: TRAINING_LOCATIONS,
    other: true,
    required: true,
    flag: "whereInPerson",
  },
  city: {
    type: "text",
    title: "Which city or neighborhood? Nearest cross streets are enough.",
    required: true,
  },
  access: {
    type: "paragraph",
    title:
      "Anything I should know about getting there (parking, building " +
      "check-in, pets)?",
  },
  frequency: {
    type: "choice",
    title: "How often would you like to train with me in person?",
    choices: [
      "Twice a month",
      "Once a week",
      "Twice a week",
      "3 times a week",
      "Not sure",
    ],
  },
  ownWorkouts: {
    type: "choice",
    title: "Where will you do most of your own workouts?",
    choices: [
      "Commercial gym",
      "Apartment or building gym",
      "Home gym",
      "Home with little or no equipment",
      "Outdoors",
      "A mix",
      "Only in my sessions with you",
    ],
    required: true,
    flag: "ownWorkouts",
  },
  equipment: {
    type: "checkbox",
    title: "What equipment can you use?",
    help: "Include what's at home or at your gym. Skip it if you're not sure yet.",
    choices: EQUIPMENT,
  },
  weights: {
    type: "text",
    title: "If you have dumbbells or kettlebells, what weights?",
    help: 'For example, "adjustable 5–50 lb".',
  },
  filming: {
    type: "choice",
    title: "Could you film a set now and then so I can check your form?",
    help: "Mostly for online and hybrid coaching.",
    choices: ["Yes", "Maybe", "I'd rather not"],
  },
  contact: {
    type: "checkbox",
    title: "How would you like to stay in touch between sessions?",
    choices: ["Text", "Email", "Video call", "An app"],
  },
  unsure: {
    type: "checkbox",
    title: "What's making you unsure?",
    choices: [
      "Cost",
      "Schedule",
      "Whether I need in-person help",
      "What each option includes",
    ],
    other: true,
  },
};

/**
 * The whole form, section by section. Section "about" is the form's first
 * page. A section's `next` is where it goes when it ends ("After section").
 * A `branch` maps each answer to the section it sends people to. A `flag`
 * names a question the Call prep tab reads (its item ID is saved, so
 * rewording the question doesn't break it).
 */
const SECTIONS = [
  {
    key: "about",
    items: [
      {
        type: "text",
        title: EMAIL_TITLE,
        help: "This should already be filled in from your link.",
        validation: "email",
        required: true,
        prefill: "email",
        flag: "email",
      },
      {
        type: "text",
        title: NAME_TITLE,
        required: true,
        prefill: "name",
        flag: "name",
      },
      { type: "text", title: "What should I call you?", flag: "callMe" },
      {
        type: "list",
        title: "Age range",
        choices: ["18–29", "30–39", "40–49", "50–59", "60–69", "70+"],
        required: true,
        flag: "age",
      },
    ],
  },
  {
    key: "goals",
    title: "Goals and motivation",
    items: [
      {
        type: "choice",
        title: "What's your main goal right now?",
        choices: GOALS,
        other: true,
        required: true,
        flag: "goal",
      },
      {
        type: "checkbox",
        title: "Anything else you'd like to work on?",
        choices: GOALS,
        other: true,
      },
      {
        type: "paragraph",
        title:
          'Picture three months from now. What would make you say "this worked"?',
        required: true,
        flag: "worked",
      },
      { type: "paragraph", title: "Why is now the right time?" },
      {
        type: "text",
        title: "Is there a date you're working toward (event, trip, season)?",
      },
      {
        type: "paragraph",
        title: "What have you tried before, and what got in the way?",
      },
      {
        type: "scale",
        title: "How important is this goal to you right now?",
        low: 0,
        high: 10,
        lowLabel: "Not at all",
        highLabel: "Extremely",
        required: true,
        flag: "importance",
      },
      {
        type: "scale",
        title:
          "How confident are you that you can stick with a plan for 3 months?",
        low: 0,
        high: 10,
        lowLabel: "Not at all",
        highLabel: "Extremely",
        flag: "confidence",
      },
      {
        type: "checkbox",
        title: "What usually gets in the way?",
        choices: [
          "Time",
          "Energy or sleep",
          "Motivation",
          "Not knowing what to do",
          "Pain or injury",
          "Work or family schedule",
          "Travel",
          "Cost",
        ],
        other: true,
      },
      {
        type: "choice",
        title: "How much support would you like?",
        choices: [
          "A solid plan and a monthly check-in",
          "Check-ins every couple of weeks",
          "Weekly check-ins and messaging",
          "Not sure yet",
        ],
        flag: "support",
      },
    ],
  },
  {
    key: "health",
    title: "Health and readiness",
    items: [
      {
        type: "choice",
        title:
          "In the last 3 months, have you done planned exercise for 30+ " +
          "minutes at a moderate effort (breathing harder but still able " +
          "to talk) on 3 or more days a week?",
        choices: ["Yes", "No"],
        required: true,
        flag: "active",
      },
      {
        type: "checkbox",
        title: "Has a doctor ever told you that you have any of these?",
        choices: [
          "A heart condition (heart attack, stent or heart surgery, valve " +
            "problem, heart failure, irregular heartbeat, a heart problem " +
            "since birth)",
          "Stroke",
          "Diabetes (type 1 or 2)",
          "Kidney disease",
          "High blood pressure",
          "Asthma, COPD or another lung condition",
          "Osteoporosis or low bone density",
          "None of these",
          "Prefer to discuss on the call",
        ],
        required: true,
        flag: "conditions",
      },
      {
        type: "checkbox",
        title: "Do you ever notice any of these, at rest or during activity?",
        choices: [
          "Pain, pressure or discomfort in your chest, neck, jaw or arms",
          "Short of breath at rest or with light activity",
          "Dizziness, fainting or blacking out",
          "Trouble breathing when lying flat",
          "Swollen ankles not caused by an injury",
          "A racing, pounding or irregular heartbeat",
          "Burning or cramping in your lower legs when walking that eases " +
            "with rest",
          "A known heart murmur",
          "Unusual tiredness or breathlessness during normal activities",
          "None of these",
        ],
        required: true,
        flag: "symptoms",
      },
      {
        type: "choice",
        title:
          "Do you take any medication that affects your heart rate, blood " +
          "pressure, blood sugar or blood clotting?",
        choices: ["Yes", "No", "Not sure", "Prefer to discuss on the call"],
        required: true,
        flag: "medication",
      },
      {
        type: "text",
        title: "If yes, what is it for? (The type is enough.)",
        flag: "medicationFor",
      },
      {
        type: "checkbox",
        title: "Any pain, injury or surgery in the last 2 years?",
        choices: [
          "Neck",
          "Shoulder",
          "Elbow, wrist or hand",
          "Upper back",
          "Lower back",
          "Hip",
          "Knee",
          "Ankle or foot",
          "Other",
          "None",
        ],
        required: true,
        flag: "injuries",
      },
      {
        type: "paragraph",
        title:
          "Tell me a bit more: what happened, does it still bother you, and " +
          "what makes it worse?",
      },
      {
        type: "choice",
        title:
          "Has a doctor or physical therapist told you to avoid or limit any " +
          "activity?",
        help: 'Choose "Other" to add details.',
        choices: ["Yes", "No"],
        other: true,
        flag: "limits",
      },
      {
        type: "choice",
        title:
          "In the past 12 months, have you had a hospital stay, surgery or a " +
          "new diagnosis?",
        choices: ["Yes", "No", "Prefer to discuss on the call"],
        flag: "hospital",
      },
      {
        type: "paragraph",
        title:
          "Anything else about your health you'd like me to know? Only share " +
          "what you're comfortable with.",
      },
    ],
  },
  {
    key: "planAround",
    title: "A few things to plan around",
    help: PLAN_AROUND_INTRO,
    items: [
      {
        type: "choice",
        title: "When did you last have a check-up with a doctor?",
        choices: [
          "Within the last year",
          "1–2 years",
          "2–5 years",
          "5+ years",
          "Not sure",
        ],
      },
      {
        type: "checkbox",
        title: "Do any of these apply to you right now?",
        help: "Tick anything that applies, or skip it.",
        choices: PLAN_AROUND_CHOICES,
        flag: "planAround",
      },
      {
        type: "paragraph",
        title: "Anything I should know about what you ticked?",
        help:
          "For example: how many weeks pregnant or since the birth, whether " +
          "your doctor or midwife has OK'd exercise, whether a hernia was " +
          "repaired, or whether a hormone therapy is prescribed.",
      },
    ],
  },
  {
    key: "background",
    title: "Training background",
    items: [
      {
        type: "choice",
        title: "How long have you trained consistently (2+ times a week)?",
        choices: [
          "Never consistently",
          "Under 6 months",
          "6 months–2 years",
          "2–5 years",
          "5+ years",
        ],
        required: true,
        flag: "experience",
      },
      {
        type: "checkbox",
        title: "What do you do now?",
        choices: [
          "Nothing regular right now",
          "Walking",
          "Weights or machines",
          "Running",
          "Cycling",
          "Swimming",
          "Group classes",
          "Yoga or Pilates",
          "Sports",
        ],
        other: true,
        required: true,
      },
      {
        type: "list",
        title: "In a typical week, how many days do you strength train?",
        choices: ["0", "1", "2", "3", "4+"],
        required: true,
        flag: "strengthDays",
      },
      {
        type: "list",
        title: "About how many steps do you get a day?",
        choices: [
          "Don't know",
          "Under 5,000",
          "5,000–7,500",
          "7,500–10,000",
          "10,000+",
        ],
      },
      // Two checkbox questions instead of a grid: grids are hard to use on a
      // phone, and most people open this link on one.
      {
        type: "checkbox",
        title: "Which of these can you do comfortably, with good form?",
        choices: MOVEMENTS.concat(["None of these yet"]),
      },
      {
        type: "checkbox",
        title: "Do any of these cause pain, so you avoid them?",
        choices: MOVEMENTS.concat(["None"]),
        flag: "painful",
      },
      {
        type: "paragraph",
        title: "Any exercise you love, or really don't want to do?",
      },
      {
        type: "choice",
        title: FORMAT_TITLE,
        help:
          "Hybrid mixes in-person sessions with online programming and " +
          "check-ins.",
        choices: FORMAT_CHOICES,
        branch: {
          "In-person": "inPerson",
          Online: "setup",
          Hybrid: "inPerson",
          "Not sure": "notSure",
        },
        required: true,
        prefill: "format",
        flag: "format",
      },
    ],
  },
  // In-person and Hybrid answer this, Not sure answers the next one, and
  // everyone (Online goes straight there) ends with "Your training setup".
  {
    key: "inPerson",
    title: "Training with me in person",
    next: "setup",
    items: [Q6.where, Q6.city, Q6.access, Q6.frequency],
  },
  {
    key: "notSure",
    title: "Still deciding",
    items: [Q6.unsure],
  },
  {
    key: "setup",
    title: "Your training setup",
    items: [Q6.ownWorkouts, Q6.equipment, Q6.weights, Q6.filming, Q6.contact],
  },
  {
    key: "schedule",
    title: "Schedule and lifestyle",
    items: [
      {
        type: "choice",
        title: "How many days a week can you realistically train?",
        choices: ["1–2", "3", "4", "5+"],
        required: true,
        flag: "days",
      },
      {
        type: "choice",
        title: "How long can a session be?",
        choices: ["30 min", "45 min", "60 min", "75+ min"],
        required: true,
        flag: "length",
      },
      {
        type: "checkbox",
        title: "When can you usually train?",
        choices: [
          "Early morning (before 8)",
          "Late morning",
          "Midday",
          "Afternoon",
          "Evening (after 6)",
          "Weekends",
        ],
        required: true,
        flag: "times",
      },
      {
        type: "choice",
        title: "What does a typical workday look like?",
        choices: [
          "Mostly sitting",
          "A mix of sitting and moving",
          "Mostly on my feet",
          "Physically demanding",
        ],
      },
      {
        type: "choice",
        title: "On average, how many hours do you sleep a night?",
        choices: ["Under 5", "5–6", "6–7", "7–8", "8+"],
        flag: "sleep",
      },
      {
        type: "scale",
        title: "How would you rate your stress lately?",
        low: 1,
        high: 5,
        lowLabel: "Low",
        highLabel: "Very high",
      },
      {
        type: "choice",
        title: "How would you describe the way you eat right now?",
        choices: [
          "No real structure",
          "Mostly balanced",
          "I track what I eat",
          "I follow a specific diet (vegetarian, keto, etc.)",
        ],
        other: true,
      },
      {
        type: "text",
        title:
          "Any food allergies, intolerances or dietary needs (religious, " +
          "cultural, medical)?",
      },
      {
        type: "choice",
        title: "About how many alcoholic drinks a week?",
        choices: ["0", "1–3", "4–7", "8–14", "15+", "Prefer not to say"],
      },
      {
        type: "choice",
        title: "Do you smoke or vape?",
        choices: [
          "No",
          "Yes",
          "Quit in the last 6 months",
          "Prefer not to say",
        ],
      },
      {
        type: "choice",
        title: "Want to do the optional self-check now?",
        help:
          "It takes 10–15 minutes and gives us a starting point to re-test. " +
          "Skip it if you ticked anything in the symptoms question or you're " +
          "pregnant — we'll do it together.",
        choices: ["Yes, let's do it", "Not now, take me to the end"],
        branch: {
          "Yes, let's do it": "selfCheck",
          "Not now, take me to the end": "wrapUp",
        },
        required: true,
        flag: "selfCheck",
      },
    ],
  },
  {
    key: "selfCheck",
    title: "Optional self-check",
    help: SELF_CHECK_INTRO,
    items: [
      {
        type: "header",
        title: "Level 1 — Anyone, no equipment (about 5 minutes)",
      },
      {
        type: "text",
        title: "Resting heart rate (beats per minute)",
        help:
          "Sit quietly for 5 minutes (first thing in the morning is best). " +
          "Count your pulse at the wrist for 30 seconds and double it. A " +
          "watch reading is fine.",
        validation: "number",
      },
      {
        type: "text",
        title: "Height and weight",
        help: "Your best estimate is fine.",
      },
      {
        type: "text",
        title: "Waist (inches)",
        help:
          "Needs a soft tape. Around your bare belly just above your hip " +
          "bones, right after you breathe out.",
        validation: "number",
      },
      {
        type: "text",
        title: "One-leg balance (seconds): left leg, then right leg",
        help:
          "Next to a wall. Stand on one leg with the other foot resting " +
          "behind your standing calf, arms at your sides, eyes forward. Time " +
          "it, up to 30 seconds. Best of 3 tries per leg. For example: 30, 22",
      },
      {
        type: "text",
        title: "30-second chair stand (number of stands)",
        help:
          "Sturdy chair with no arms, against a wall. Arms crossed on your " +
          "chest. Stand all the way up and sit back down as many times as you " +
          "can in 30 seconds. If you need your hands, stop and enter 0.",
        validation: "number",
      },
      {
        type: "choice",
        title: "Toe reach",
        help: "Stand tall, knees straight, and slowly reach down. How far do you get?",
        choices: [
          "Above my knees",
          "Shins",
          "Ankles",
          "Toes",
          "Palms flat on the floor",
        ],
      },
      {
        type: "header",
        title:
          "Level 2 — If you exercise now and nothing hurts (about 5–8 minutes)",
      },
      {
        type: "choice",
        title: "Push-ups: which version did you do?",
        help:
          "As many as you can in a row with good form: body straight, chest " +
          "to about a fist from the floor. Pick the version where you can do " +
          "at least a few.",
        choices: [
          "Standard on toes",
          "On knees",
          "Hands on a bench or counter",
        ],
      },
      {
        type: "text",
        title: "Push-ups: how many in a row?",
        validation: "number",
      },
      {
        type: "text",
        title: "Front plank (seconds)",
        help:
          "On forearms and toes, body in a straight line. Stop when your hips " +
          "sag or lift, or at 2 minutes.",
        validation: "number",
      },
      {
        type: "choice",
        title: "Cardio: which test did you do?",
        help:
          "1-mile brisk walk: time it and take your pulse right after. Or a " +
          "1.5-mile run: time it. Skip the run if you're new to running.",
        choices: ["1-mile brisk walk", "1.5-mile run"],
      },
      {
        type: "text",
        title:
          "Cardio: your time (minutes:seconds), and your pulse after the walk",
        help: "For example: 15:30, pulse 128",
      },
      {
        type: "header",
        title:
          "Level 3 — If you have the equipment or already lift (about 5 minutes)",
      },
      {
        type: "text",
        title: "Dead hang (seconds)",
        help: "Hang from a pull-up bar with straight arms. Stop at 2 minutes.",
        validation: "number",
      },
      {
        type: "text",
        title: "Pull-ups or chin-ups (strict reps)",
        help: "Strict reps from a full hang, chin over the bar.",
        validation: "number",
      },
      {
        type: "paragraph",
        title: "Recent best sets",
        help:
          "Don't test a new max for this. Share sets you've done lately, like " +
          '"Squat 185 lb × 5" or "Bench 135 × 8".',
      },
      {
        type: "text",
        title: "Form video link",
        help:
          "A link to short clips, filmed from the front and the side, of: 5 " +
          "bodyweight squats, 3 lunges per leg, 5 push-ups, a hip hinge with a " +
          "broomstick along your back, and standing on each leg for 10 " +
          "seconds. Google Drive or unlisted YouTube, or email them to " +
          "hello@nattyfitnesstrainer.com.",
      },
    ],
  },
  {
    key: "wrapUp",
    title: "Wrap-up",
    items: [
      {
        type: "paragraph",
        title: "Anything else you'd like me to know before our call?",
      },
      {
        type: "choice",
        title: "How did you hear about me?",
        choices: [
          "Instagram",
          "TikTok",
          "YouTube",
          "Google search",
          "A friend or referral",
        ],
        other: true,
      },
      {
        type: "paragraph",
        title: "Was anything in this form confusing, missing or too personal?",
        help: "Optional. It helps me make the form better.",
      },
      {
        type: "checkbox",
        title:
          "I understand this form isn't medical advice, and I'll let Nathnael " +
          "know if my health changes before we start.",
        choices: ["I understand"],
        required: true,
      },
      {
        type: "checkbox",
        title:
          "Nathnael can keep my answers privately to plan my coaching. If I " +
          "don't become a client, they're deleted after 6 months.",
        choices: ["I agree"],
        required: true,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

function buildQuestionnaire() {
  const props = PropertiesService.getScriptProperties();
  const existingId = props.getProperty("FORM_ID");
  if (existingId) {
    throw new Error(
      "This project already built the questionnaire (form ID " +
        existingId +
        "). Run logQuestionnaireLinks to see its links. To build a fresh " +
        "copy anyway, delete the FORM_ID script property first.",
    );
  }

  const form = FormApp.create(FORM_TITLE);
  applySettings_(form);

  const pages = {};
  const branching = [];
  const flagItems = {};

  SECTIONS.forEach(function (section, index) {
    if (index > 0) {
      const page = form.addPageBreakItem().setTitle(section.title);
      if (section.help) {
        page.setHelpText(section.help);
      }
      pages[section.key] = page;
    }
    section.items.forEach(function (spec) {
      const item = addItem_(form, spec);
      if (spec.branch) {
        branching.push({ item: item, spec: spec });
      }
      if (spec.flag) {
        flagItems[spec.flag] = item.getId();
      }
    });
  });

  // Answers that send people to a section.
  branching.forEach(function (entry) {
    entry.item.setChoices(
      entry.spec.choices.map(function (value) {
        const target = pages[entry.spec.branch[value]];
        if (!target) {
          throw new Error('No section "' + entry.spec.branch[value] + '".');
        }
        return entry.item.createChoice(value, target);
      }),
    );
  });

  // "After section": Google sets this on the page break that follows the
  // section, so 4A > Section 5 lives on 4B's page break, and so on.
  SECTIONS.forEach(function (section, index) {
    const following = SECTIONS[index + 1];
    if (!section.next || !following || following.key === section.next) {
      return;
    }
    pages[following.key].setGoToPage(pages[section.next]);
  });

  const spreadsheet = SpreadsheetApp.create(RESPONSES_SHEET_NAME);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());

  props.setProperty("FORM_ID", form.getId());
  props.setProperty("FLAG_ITEMS", JSON.stringify(flagItems));

  try {
    setUpResponseTabs_(form, { firstRun: true });
  } catch (error) {
    console.log(
      "The form is built, but the sheet tabs couldn't be set up yet (" +
        error.message +
        "). Wait a minute, then run refreshResponseTabs.",
    );
  }
  logQuestionnaireLinks();
}

function applySettings_(form) {
  form.setDescription(FORM_DESCRIPTION);
  form.setConfirmationMessage(CONFIRMATION_MESSAGE);
  form.setProgressBar(true);
  form.setAllowResponseEdits(false);
  form.setLimitOneResponsePerUser(false); // On, it forces a Google sign-in.
  form.setShowLinkToRespondAgain(false);
  form.setPublishingSummary(false);
  form.setShuffleQuestions(false);

  // No email collection by Google: "Verified" forces a sign-in, and the
  // form's own Email question can be pre-filled instead.
  if (FormApp.EmailCollectionType && form.setEmailCollectionType) {
    form.setEmailCollectionType(FormApp.EmailCollectionType.DO_NOT_COLLECT);
  } else {
    form.setCollectEmail(false);
  }

  // Newer forms can start unpublished; make sure this one takes responses.
  try {
    if (typeof form.setPublished === "function") {
      form.setPublished(true);
    }
  } catch (error) {
    console.log("Publish it by hand in the editor if it shows as a draft.");
  }
  form.setAcceptingResponses(true);
}

function addItem_(form, spec) {
  let item;
  switch (spec.type) {
    case "text":
      item = form.addTextItem();
      if (spec.validation === "email") {
        item.setValidation(
          FormApp.createTextValidation()
            .setHelpText("Enter a valid email address.")
            .requireTextIsEmail()
            .build(),
        );
      } else if (spec.validation === "number") {
        item.setValidation(
          FormApp.createTextValidation()
            .setHelpText("Enter a number.")
            .requireNumberGreaterThanOrEqualTo(0)
            .build(),
        );
      }
      break;
    case "paragraph":
      item = form.addParagraphTextItem();
      break;
    case "choice":
      item = form.addMultipleChoiceItem();
      if (!spec.branch) {
        item.setChoiceValues(spec.choices);
      }
      if (spec.other) {
        item.showOtherOption(true);
      }
      break;
    case "checkbox":
      item = form.addCheckboxItem().setChoiceValues(spec.choices);
      if (spec.other) {
        item.showOtherOption(true);
      }
      break;
    case "list":
      item = form.addListItem().setChoiceValues(spec.choices);
      break;
    case "scale":
      item = form
        .addScaleItem()
        .setBounds(spec.low, spec.high)
        .setLabels(spec.lowLabel, spec.highLabel);
      break;
    case "grid":
      item = form.addGridItem().setRows(spec.rows).setColumns(spec.columns);
      break;
    case "header":
      item = form.addSectionHeaderItem();
      break;
    default:
      throw new Error("Unknown question type: " + spec.type);
  }

  item.setTitle(spec.title);
  if (spec.help) {
    item.setHelpText(spec.help);
  }
  if (spec.required && spec.type !== "header") {
    item.setRequired(true);
  }
  return item;
}

// ---------------------------------------------------------------------------
// Responses sheet tabs: Call prep, Question stats, Changes
// ---------------------------------------------------------------------------

const CALL_PREP_TAB = "Call prep";
const STATS_TAB = "Question stats";
const CHANGES_TAB = "Changes";
/** Question rows on the stats tab: room to add questions later. */
const STATS_ROWS = 150;

/** Rebuilds the Call prep and Question stats tabs. Safe to run any time. */
function refreshResponseTabs() {
  const formId = PropertiesService.getScriptProperties().getProperty("FORM_ID");
  if (!formId) {
    throw new Error("Run buildQuestionnaire first.");
  }
  setUpResponseTabs_(FormApp.openById(formId), { firstRun: false });
  console.log("Call prep and Question stats are up to date.");
}

function setUpResponseTabs_(form, options) {
  const spreadsheet = SpreadsheetApp.openById(form.getDestinationId());
  const responses = waitForResponsesTab_(form, spreadsheet);
  const columns = flagColumns_(form, responses);
  const ref = "'" + responses.getName().replace(/'/g, "''") + "'!";

  // Once questionnaire-scoring.gs is installed it owns Call prep (it shows
  // the scored Profile card), so don't overwrite its version.
  if (!spreadsheet.getSheetByName("Profile")) {
    buildCallPrepTab_(spreadsheet, responses, ref, columns);
  }
  buildStatsTab_(spreadsheet, ref);
  if (!spreadsheet.getSheetByName(CHANGES_TAB)) {
    buildChangesTab_(spreadsheet);
  }

  if (options.firstRun) {
    // A new spreadsheet starts with an empty "Sheet1"; drop it if unused.
    spreadsheet.getSheets().forEach(function (sheet) {
      const ours = [CALL_PREP_TAB, STATS_TAB, CHANGES_TAB];
      if (
        sheet.getSheetId() !== responses.getSheetId() &&
        ours.indexOf(sheet.getName()) < 0 &&
        sheet.getLastRow() === 0
      ) {
        spreadsheet.deleteSheet(sheet);
      }
    });
  }
}

/** The tab Google Forms writes answers to. It can take a moment to appear. */
function waitForResponsesTab_(form, spreadsheet) {
  const formKey = form.getEditUrl().replace(/\/edit.*$/, "");
  for (let attempt = 0; attempt < 10; attempt++) {
    const found = spreadsheet.getSheets().find(function (sheet) {
      const linked = sheet.getFormUrl();
      return (
        linked && linked.replace(/\/viewform.*$|\/edit.*$/, "") === formKey
      );
    });
    if (found && found.getLastColumn() > 1) {
      return found;
    }
    SpreadsheetApp.flush();
    Utilities.sleep(1500);
  }
  throw new Error("the responses tab isn't ready");
}

/**
 * Which sheet column (A, B, ...) holds each flagged question. Found by the
 * question's current title in the header row, so rewording a question in
 * the editor (which renames its column) keeps working.
 */
function flagColumns_(form, responses) {
  const ids = JSON.parse(
    PropertiesService.getScriptProperties().getProperty("FLAG_ITEMS") || "{}",
  );
  const header = responses
    .getRange(1, 1, 1, responses.getLastColumn())
    .getValues()[0]
    .map(function (cell) {
      return String(cell).trim().toLowerCase();
    });
  const columns = {};
  Object.keys(ids).forEach(function (key) {
    const item = form.getItemById(ids[key]);
    if (!item) {
      return; // Deleted from the form: its flags are skipped.
    }
    const index = header.indexOf(item.getTitle().trim().toLowerCase());
    if (index >= 0) {
      columns[key] = columnLetter_(index + 1);
    }
  });
  return columns;
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

/**
 * The Call prep flags, written as Sheets formulas. `v(key)` is that
 * question's answer for the chosen lead. They follow the decision rules in
 * the questionnaire doc (ACSM screening steps): prompts, not diagnoses.
 */
const CALL_PREP_FLAGS = [
  {
    needs: ["symptoms"],
    formula: function (v) {
      return (
        "IF(AND(" +
        v("symptoms") +
        '<>"",' +
        v("symptoms") +
        '<>"None of these"),"• Doctor first: a symptom is ticked ("&' +
        v("symptoms") +
        '&"). No exercise until a doctor clears them.","")'
      );
    },
  },
  {
    needs: ["conditions", "active"],
    formula: function (v) {
      return (
        "IF(REGEXMATCH(" +
        v("conditions") +
        '&"","heart condition|Stroke|Diabetes|Kidney disease"),IF(' +
        v("active") +
        '="No","• Doctor\'s OK before starting: known condition and not ' +
        'active now. Then light to moderate, building up.","• Moderate is ' +
        "fine. Doctor's OK before vigorous work: known condition, active " +
        'now."),"")'
      );
    },
  },
  {
    needs: ["conditions"],
    formula: function (v) {
      // Lists only the conditions that aren't clearance triggers.
      const c = v("conditions") + '&""';
      const named = function (pattern, label) {
        return "IF(REGEXMATCH(" + c + ',"' + pattern + '"),"' + label + '","")';
      };
      return (
        "IF(REGEXMATCH(" +
        c +
        ',"High blood pressure|Asthma|Osteoporosis"),"• Plan around (not a ' +
        'clearance trigger on its own): "&TEXTJOIN(", ",TRUE,' +
        named("High blood pressure", "high blood pressure") +
        "," +
        named("Asthma", "a lung condition") +
        "," +
        named("Osteoporosis", "osteoporosis or low bone density") +
        '),"")'
      );
    },
  },
  {
    needs: ["conditions", "medication", "hospital"],
    formula: function (v) {
      return (
        "IF(REGEXMATCH(" +
        v("conditions") +
        '&" "&' +
        v("medication") +
        '&" "&' +
        v("hospital") +
        ',"Not sure|Prefer to discuss"),"• Ask on the call before planning ' +
        'intensity: they chose Not sure or Prefer to discuss.","")'
      );
    },
  },
  {
    needs: ["medication", "medicationFor"],
    formula: function (v) {
      return (
        "IF(" +
        v("medication") +
        '="Yes","• Medication that affects heart ' +
        'rate, blood pressure, blood sugar or clotting"&IF(' +
        v("medicationFor") +
        '<>""," ("&' +
        v("medicationFor") +
        '&")","")&": coach by effort (RPE), not heart rate.","")'
      );
    },
  },
  {
    needs: ["hospital"],
    formula: function (v) {
      return (
        "IF(" +
        v("hospital") +
        '="Yes","• Hospital stay, surgery or new ' +
        'diagnosis in the last 12 months: ask about it.","")'
      );
    },
  },
  {
    needs: ["limits"],
    formula: function (v) {
      return (
        "IF(AND(" +
        v("limits") +
        '<>"",' +
        v("limits") +
        '<>"No"),"• A doctor or PT limited some activity: "&' +
        v("limits") +
        ',"")'
      );
    },
  },
  {
    needs: ["injuries"],
    formula: function (v) {
      return (
        "IF(AND(" +
        v("injuries") +
        '<>"",' +
        v("injuries") +
        '<>"None"),"• Pain, injury or surgery in the last 2 years: "&' +
        v("injuries") +
        ',"")'
      );
    },
  },
  {
    needs: ["painful"],
    formula: function (v) {
      return (
        "IF(AND(" +
        v("painful") +
        '<>"",' +
        v("painful") +
        '<>"None"),"• Painful movements, check these first: "&' +
        v("painful") +
        ',"")'
      );
    },
  },
  {
    needs: ["planAround"],
    formula: function (v) {
      return (
        "IF(AND(" +
        v("planAround") +
        '<>"",' +
        v("planAround") +
        '<>"None of these"),"• Plan around: "&' +
        v("planAround") +
        ',"")'
      );
    },
  },
  {
    needs: ["experience", "strengthDays"],
    formula: function (v) {
      return (
        "IF(OR(" +
        v("experience") +
        '="Never consistently",' +
        v("experience") +
        '="Under 6 months",' +
        v("strengthDays") +
        '&""="0",' +
        v("strengthDays") +
        '&""="1"),"• Treat as a beginner: teach the patterns before ' +
        'loading them.","")'
      );
    },
  },
  {
    needs: ["confidence"],
    formula: function (v) {
      return (
        "IF(AND(" +
        v("confidence") +
        '&""<>"",N(' +
        v("confidence") +
        ')<7),"• Confidence "&' +
        v("confidence") +
        '&"/10: start with fewer days a week.","")'
      );
    },
  },
  {
    needs: ["sleep"],
    formula: function (v) {
      return (
        "IF(OR(" +
        v("sleep") +
        '="Under 5",' +
        v("sleep") +
        '="5–6",' +
        v("sleep") +
        '="6–7"),"• Sleeps "&' +
        v("sleep") +
        '&" hours: sleep may be the easiest first habit.","")'
      );
    },
  },
  {
    needs: ["selfCheck"],
    formula: function (v) {
      return (
        "IF(LEFT(" +
        v("selfCheck") +
        ',3)="Yes","• Did the self-check: ' +
        'the numbers are under All answers.","")'
      );
    },
  },
];

/** The "At a glance" rows: a label and a formula built from answers. */
const CALL_PREP_GLANCE = [
  {
    label: "Name",
    needs: ["name"],
    formula: function (v) {
      return (
        v("name") +
        "&IF(" +
        v("callMe") +
        '<>""," (call them "&' +
        v("callMe") +
        '&")","")'
      );
    },
    optional: ["callMe"],
  },
  { label: "Age range", needs: ["age"], formula: (v) => v("age") },
  { label: "Main goal", needs: ["goal"], formula: (v) => v("goal") },
  {
    label: "Three months from now",
    needs: ["worked"],
    formula: (v) => v("worked"),
  },
  {
    label: "Importance · confidence",
    needs: ["importance", "confidence"],
    formula: function (v) {
      return (
        v("importance") +
        '&"/10 · "&IF(' +
        v("confidence") +
        '&""="","–",' +
        v("confidence") +
        '&"/10")'
      );
    },
  },
  {
    label: "Support they want",
    needs: ["support"],
    formula: function (v) {
      const s = v("support");
      return (
        s +
        "&IF(" +
        s +
        '="A solid plan and a monthly check-in"," (≈ ' +
        'Essentials)",IF(' +
        s +
        '="Check-ins every couple of weeks"," (≈ ' +
        'Standard)",IF(' +
        s +
        '="Weekly check-ins and messaging"," (≈ ' +
        'Premium)","")))'
      );
    },
  },
  { label: "Format", needs: ["format"], formula: (v) => v("format") },
  {
    label: "Schedule",
    needs: ["days", "length", "times"],
    formula: function (v) {
      return (
        v("days") + '&" days a week · "&' + v("length") + '&" · "&' + v("times")
      );
    },
  },
  {
    label: "Where they'll train",
    needs: ["ownWorkouts"],
    optional: ["whereInPerson"],
    formula: function (v) {
      return (
        'TEXTJOIN(" · ",TRUE,IF(' +
        v("whereInPerson") +
        '<>"","With you: "&' +
        v("whereInPerson") +
        ',""),IF(' +
        v("ownWorkouts") +
        '<>"","On their own: "&' +
        v("ownWorkouts") +
        ',""))'
      );
    },
  },
];

function buildCallPrepTab_(spreadsheet, responses, ref, columns) {
  const sheet = resetTab_(spreadsheet, CALL_PREP_TAB, 1);
  const row = "$B$3";
  const v = function (key) {
    // A question that's gone from the form reads as blank.
    return columns[key]
      ? "INDEX(" + ref + columns[key] + ":" + columns[key] + "," + row + ")"
      : '""';
  };
  const has = function (keys) {
    return keys.every(function (key) {
      return Boolean(columns[key]);
    });
  };
  const ready = function (body) {
    return "=IF(ISNUMBER(" + row + "),IFERROR(" + body + ',""),"")';
  };

  const email = columns.email || "B";
  const rows = [
    ["Call prep", ""],
    ["Email", ""],
    [
      "Response row",
      '=IF($B$2="","",IFERROR(MAX(FILTER(ROW(' +
        ref +
        email +
        ":" +
        email +
        "),LOWER(TRIM(" +
        ref +
        email +
        ":" +
        email +
        '))=LOWER(TRIM($B$2)))),"Not found"))',
    ],
    [
      "Submitted",
      "=IF(ISNUMBER(" + row + "),INDEX(" + ref + "A:A," + row + '),"")',
    ],
    ["", ""],
    [
      "Flags",
      "Prompts from your screening rules, not diagnoses. Blank means " +
        "nothing to flag.",
    ],
  ];

  const flags = CALL_PREP_FLAGS.filter(function (flag) {
    return has(flag.needs);
  }).map(function (flag) {
    return flag.formula(v);
  });
  rows.push([
    "",
    "=IF(ISNUMBER(" +
      row +
      "),IFERROR(TEXTJOIN(CHAR(10),TRUE," +
      flags.join(",") +
      '),"A flag formula failed. Send Claude a screenshot."),"")',
  ]);
  rows.push(["", ""]);
  rows.push(["At a glance", ""]);
  CALL_PREP_GLANCE.forEach(function (line) {
    rows.push([
      line.label,
      has(line.needs) ? ready(line.formula(v)) : "(question not found)",
    ]);
  });
  rows.push(["", ""]);
  rows.push(["All answers", ""]);
  // The chosen response's whole row (as wide as the sheet), as a column.
  const answers =
    "TRANSPOSE(OFFSET(" +
    ref +
    "$A$1," +
    row +
    "-1,0,1,COLUMNS(" +
    ref +
    "$1:$1)))";
  const questions = "TRANSPOSE(" + ref + "$1:$1)";
  rows.push([
    "=IF(ISNUMBER(" +
      row +
      "),IFERROR(FILTER({" +
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

  // Email picker: the responses' email column, newest answers win.
  sheet
    .getRange("B2")
    .setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInRange(responses.getRange(email + "2:" + email), true)
        .setAllowInvalid(true)
        .build(),
    )
    .setBackground("#fff8e1");
  sheet.getRange("C2").setValue("← pick or paste a lead's email");
  sheet.getRange("A1").setFontSize(14).setFontWeight("bold");
  sheet.getRange("A3:B3").setFontColor("#888888");
  sheet.getRange("B4").setNumberFormat("mmm d, yyyy h:mm am/pm");
  ["A6", "A9", "A" + (rows.length - 1)].forEach(function (cell) {
    sheet.getRange(cell).setFontWeight("bold");
  });
  sheet.getRange("B6").setFontColor("#888888").setFontStyle("italic");
  sheet.setColumnWidth(1, 300);
  sheet.setColumnWidth(2, 560);
  sheet
    .getRange(1, 1, rows.length + 120, 2)
    .setWrap(true)
    .setVerticalAlignment("top");
}

function buildStatsTab_(spreadsheet, ref) {
  const sheet = resetTab_(spreadsheet, STATS_TAB, 2);
  // Open-ended ranges (A2:A, whole rows) so the formulas keep up as the
  // responses sheet grows.
  const responseCount = "COUNTA(" + ref + "$A$2:$A)";
  const rows = [["Question", "Answered", "Share of responses"]];
  for (let r = 2; r <= STATS_ROWS + 1; r++) {
    // Row r shows sheet column r: column A is the timestamp, so row 2
    // shows column B, the first question.
    const answeredInColumn =
      "COUNTA(OFFSET(" +
      ref +
      "$A$1,1," +
      (r - 1) +
      ",MAX(1,ROWS(" +
      ref +
      "$A:$A)-1),1))";
    rows.push([
      "=IFERROR(INDEX(" + ref + "$1:$1,1," + r + '),"")',
      "=IF(A" + r + '="","",' + answeredInColumn + ")",
      "=IF(A" + r + '="","",B' + r + "/MAX(1," + responseCount + "))",
    ]);
  }
  sheet.getRange(1, 1, rows.length, 3).setValues(rows);
  sheet.getRange("E1").setValue("Responses");
  sheet.getRange("F1").setValue("=" + responseCount);
  sheet.getRange("A1:F1").setFontWeight("bold");
  sheet.getRange("C2:C" + (STATS_ROWS + 1)).setNumberFormat("0%");
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 480);
  sheet.getRange("A2:A" + (STATS_ROWS + 1)).setWrap(true);
}

function buildChangesTab_(spreadsheet) {
  const sheet = spreadsheet.insertSheet(
    CHANGES_TAB,
    Math.min(3, spreadsheet.getNumSheets()),
  );
  sheet.getRange(1, 1, 2, 3).setValues([
    ["Date", "What changed", "Why"],
    [
      new Date(),
      "Built the form from the questionnaire doc (v2: one form for " +
        "everyone, one optional 'plan around' section, movement questions " +
        "as checkboxes, three setup sections, a feedback question).",
      "First version",
    ],
  ]);
  sheet.getRange("A1:C1").setFontWeight("bold");
  sheet.getRange("A2:A").setNumberFormat("mmm d, yyyy");
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(2, 520);
  sheet.setColumnWidth(3, 260);
  sheet.getRange("B:C").setWrap(true);
}

/** An empty tab with this name at this position, replacing any old one. */
function resetTab_(spreadsheet, name, position) {
  const existing = spreadsheet.getSheetByName(name);
  if (existing) {
    spreadsheet.deleteSheet(existing);
  }
  return spreadsheet.insertSheet(
    name,
    Math.min(position, spreadsheet.getNumSheets()),
  );
}

// ---------------------------------------------------------------------------
// Links and pre-fill keys (safe to run any time)
// ---------------------------------------------------------------------------

function logQuestionnaireLinks() {
  const formId = PropertiesService.getScriptProperties().getProperty("FORM_ID");
  if (!formId) {
    throw new Error("Run buildQuestionnaire first.");
  }
  const form = FormApp.openById(formId);

  const emailItem = findItem_(form, EMAIL_TITLE).asTextItem();
  const nameItem = findItem_(form, NAME_TITLE).asTextItem();
  const formatItem = findItem_(form, FORMAT_TITLE).asMultipleChoiceItem();

  const prefilled = form
    .createResponse()
    .withItemResponse(emailItem.createResponse("EMAIL_HERE"))
    .withItemResponse(nameItem.createResponse("NAME_HERE"))
    .withItemResponse(formatItem.createResponse(FORMAT_CHOICES[1]))
    .toPrefilledUrl();

  const key = function (marker) {
    const match = prefilled.match(new RegExp("(entry\\.\\d+)=" + marker));
    return match ? match[1] : "(not found)";
  };

  let responsesSheet = "(not linked)";
  try {
    responsesSheet = SpreadsheetApp.openById(form.getDestinationId()).getUrl();
  } catch (error) {
    // Not linked yet.
  }

  console.log(
    [
      "===== SEND THIS TO CLAUDE =====",
      "Form link: " + form.getPublishedUrl(),
      "Form ID: " + form.getId(),
      "Email pre-fill key: " + key("EMAIL_HERE"),
      "Name pre-fill key: " + key("NAME_HERE"),
      "Format pre-fill key: " + key(FORMAT_CHOICES[1]),
      "Pre-filled test link: " + prefilled,
      "===== FOR YOU ONLY =====",
      "Edit the form: " + form.getEditUrl(),
      "Responses sheet (keep private): " + responsesSheet,
      "  Tabs: answers, Call prep (pick an email), Question stats, Changes.",
    ].join("\n"),
  );
}

function findItem_(form, title) {
  const match = form.getItems().find(function (item) {
    return item.getTitle().trim() === title;
  });
  if (!match) {
    throw new Error(
      "Can't find the question \"" + title + '". Was it renamed or deleted?',
    );
  }
  return match;
}
