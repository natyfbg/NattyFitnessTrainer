/**
 * Natty Fitness Trainer: builds the client questionnaire as a Google Form.
 *
 * Generated from the Claude Doc "Client Questionnaire — Natty Fitness
 * Trainer (Draft v1)". Run it ONCE to create the form; after that, edit the
 * form in the Google Forms editor. The copy in the repo is for history.
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
 *      marked "SEND THIS TO CLAUDE" back to the chat.
 *   5. In the form editor, finish the two settings a script can't change:
 *      Responses > ⋮ > Get email notifications for new responses, and the
 *      theme (palette icon: logo header and colours).
 *
 * Running buildQuestionnaire again refuses to make a second form. To print
 * the links and keys again later, run logQuestionnaireLinks.
 *
 * KEEP THE PRE-FILL WORKING
 *   - Never delete and recreate "Email", "Full name" or "Which coaching
 *     format are you leaning toward?". Editing their wording is fine.
 *   - The format answers must stay exactly In-person, Online, Hybrid and
 *     Not sure; the website fills them in by those words.
 *   - The reminder script finds the email column by the header "Email".
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

const PATH_INTRO =
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

const REDS_QUESTION = {
  type: "choice",
  title:
    "While training hard or dieting, have you noticed unusual fatigue, " +
    "getting sick often, injuries that won't heal, or a drop in sex drive?",
  choices: ["Yes", "No", "Prefer to discuss on the call"],
};

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

// Section 6 questions, shared by the four format variants.
const Q6 = {
  where: {
    type: "checkbox",
    title: "Where would you like to train with me?",
    choices: TRAINING_LOCATIONS,
    other: true,
    required: true,
  },
  city: {
    type: "text",
    title: "Which city or neighborhood? Nearest cross streets are enough.",
  },
  access: {
    type: "paragraph",
    title:
      "Anything I should know about getting there (parking, building " +
      "check-in, pets)?",
  },
  sessions: {
    type: "choice",
    title: "How many in-person sessions a month would suit you?",
    choices: ["2", "4", "Not sure"],
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
    ],
    required: true,
  },
  equipment: {
    type: "checkbox",
    title: "What equipment can you use?",
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

function withRequired_(question, required) {
  return Object.assign({}, question, { required: required });
}

/**
 * The whole form, section by section. Section "about" is the form's first
 * page. A section's `next` is where it goes when it ends ("After section").
 * A `branch` maps each answer to the section it sends people to.
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
      },
      { type: "text", title: NAME_TITLE, required: true, prefill: "name" },
      { type: "text", title: "What should I call you?" },
      {
        type: "list",
        title: "Age range",
        choices: ["18–29", "30–39", "40–49", "50–59", "60–69", "70+"],
        required: true,
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
      },
      {
        type: "scale",
        title:
          "How confident are you that you can stick with a plan for 3 months?",
        low: 0,
        high: 10,
        lowLabel: "Not at all",
        highLabel: "Extremely",
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
      },
      {
        type: "choice",
        title:
          "Do you take any medication that affects your heart rate, blood " +
          "pressure, blood sugar or blood clotting?",
        choices: ["Yes", "No", "Not sure", "Prefer to discuss on the call"],
        required: true,
      },
      {
        type: "text",
        title: "If yes, what is it for? (The type is enough.)",
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
      },
      {
        type: "choice",
        title:
          "In the past 12 months, have you had a hospital stay, surgery or a " +
          "new diagnosis?",
        choices: ["Yes", "No", "Prefer to discuss on the call"],
      },
      {
        type: "paragraph",
        title:
          "Anything else about your health you'd like me to know? Only share " +
          "what you're comfortable with.",
      },
      {
        type: "choice",
        title: "Which short question set fits you best?",
        help: "It only decides the next section.",
        choices: ["Men's", "Women's", "General (skip these questions)"],
        branch: {
          "Men's": "mens",
          "Women's": "womens",
          "General (skip these questions)": "general",
        },
        required: true,
      },
    ],
  },
  {
    key: "mens",
    title: "Men's questions",
    help: PATH_INTRO,
    next: "background",
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
        type: "choice",
        title: "Have you ever had a hernia (groin or belly)?",
        choices: ["Yes, repaired", "Yes, not repaired", "No", "Not sure"],
      },
      {
        type: "choice",
        title: "Are you currently using testosterone or any other hormones?",
        choices: [
          "Yes, prescribed",
          "Yes, not prescribed",
          "No",
          "Prefer to discuss on the call",
        ],
      },
      REDS_QUESTION,
    ],
  },
  {
    key: "womens",
    title: "Women's questions",
    help: PATH_INTRO,
    next: "background",
    items: [
      {
        type: "choice",
        title: "Are you pregnant, or planning to be in the next 6 months?",
        choices: [
          "Pregnant",
          "Planning",
          "No",
          "Prefer to discuss on the call",
        ],
      },
      {
        type: "choice",
        title: "Have you given birth in the last 12 months?",
        choices: ["Yes", "No", "Prefer to discuss on the call"],
      },
      {
        type: "text",
        title:
          "If pregnant or postpartum: how many weeks along, or how long since " +
          "the birth? Has your doctor or midwife OK'd exercise?",
      },
      {
        type: "choice",
        title:
          "During exercise, coughing, sneezing, jumping or running, do you " +
          "ever leak urine or feel heaviness in your pelvis?",
        choices: [
          "Never",
          "Sometimes",
          "Often",
          "Prefer to discuss on the call",
        ],
      },
      {
        type: "choice",
        title: "How does your menstrual cycle affect your training?",
        choices: [
          "It doesn't",
          "Sometimes (energy, cramps, sleep)",
          "Often",
          "I don't have periods right now (pregnancy, menopause, birth " +
            "control or other)",
          "My periods stopped or became irregular while training hard or " +
            "dieting",
          "Prefer not to say",
        ],
      },
      {
        type: "choice",
        title: "Which best describes you?",
        choices: [
          "Before menopause",
          "Perimenopause (cycle changes, hot flashes, sleep changes)",
          "After menopause",
          "Not sure",
          "Prefer not to say",
        ],
      },
    ],
  },
  {
    key: "general",
    title: "General questions",
    help: PATH_INTRO,
    next: "background",
    items: [
      {
        type: "paragraph",
        title:
          "Is there anything about your body, hormones or health — for " +
          "example pregnancy, a recent birth, menopause, hormone therapy or " +
          "pelvic floor symptoms — that you'd like me to plan around?",
      },
      REDS_QUESTION,
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
      {
        type: "grid",
        title: "How comfortable are you with these movements?",
        rows: [
          "Squat",
          "Hip hinge (deadlift or kettlebell swing)",
          "Lunge or split squat",
          "Push-up",
          "Overhead press",
          "Row or pull-up",
          "Running or jumping",
        ],
        columns: [
          "Never tried",
          "Still learning",
          "Comfortable",
          "Confident with heavy weight",
          "Painful, I avoid it",
        ],
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
          Online: "online",
          Hybrid: "hybrid",
          "Not sure": "notSure",
        },
        required: true,
        prefill: "format",
      },
    ],
  },
  {
    key: "inPerson",
    title: "Training setup: in person",
    next: "schedule",
    items: [
      Q6.where,
      withRequired_(Q6.city, true),
      Q6.access,
      withRequired_(Q6.equipment, false),
      Q6.weights,
    ],
  },
  {
    key: "online",
    title: "Training setup: online",
    next: "schedule",
    items: [
      Q6.ownWorkouts,
      withRequired_(Q6.equipment, true),
      Q6.weights,
      Q6.filming,
      Q6.contact,
    ],
  },
  {
    key: "hybrid",
    title: "Training setup: hybrid",
    next: "schedule",
    items: [
      Q6.where,
      withRequired_(Q6.city, true),
      Q6.access,
      Q6.sessions,
      Q6.ownWorkouts,
      withRequired_(Q6.equipment, true),
      Q6.weights,
      Q6.filming,
      Q6.contact,
    ],
  },
  {
    key: "notSure",
    title: "Training setup: not sure yet",
    next: "schedule",
    items: [
      withRequired_(Q6.city, false),
      withRequired_(Q6.equipment, true),
      Q6.weights,
      Q6.unsure,
    ],
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
      },
      {
        type: "choice",
        title: "How long can a session be?",
        choices: ["30 min", "45 min", "60 min", "75+ min"],
        required: true,
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
