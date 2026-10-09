/**
 * Natty Fitness Trainer: consultation Leads sheet and reminders.
 *
 * This runs in Nathnael's Google account (Google Apps Script), not on the
 * website. The copy in the repo is for history; the live copy is the one
 * pasted into the Leads spreadsheet. It does three jobs:
 *
 *   1. doPost: the website adds one row per consultation request with the
 *      request ID, date, name, email and coaching interest. Nothing
 *      health-related ever arrives here.
 *   2. runDaily (9 AM Pacific): records who has booked (a Google Calendar
 *      event that lists their email) and who has answered the questionnaire
 *      (a form response with their email), then sends one combined reminder
 *      the day after the request and a last one on day 3, only for what's
 *      missing. Skips anyone whose call time has passed, anyone marked
 *      Client or Closed, anyone with "Stop reminders" ticked, and anyone who
 *      replied STOP.
 *   3. Retention, off until RETENTION_ENABLED is "true": for people who
 *      don't become clients, deletes questionnaire answers after 6 months
 *      and Leads rows after 12 months.
 *
 * SETUP (once)
 *   1. Create a Google Sheet (e.g. "Natty Fitness Leads") in the same
 *      Google account as the calendar Cal.com books into. Open
 *      Extensions > Apps Script, replace the contents of Code.gs with this
 *      file, and save.
 *   2. Project Settings > Script properties, add:
 *        LEADS_SECRET               A long random string. The same value
 *                                   goes in Cloudflare as the secret
 *                                   LEADS_SCRIPT_SECRET.
 *        BOOKING_URL                Your public Cal.com link.
 *        QUESTIONNAIRE_FORM_ID      The Google Form's ID (the long part of
 *                                   its edit link, between /d/ and /edit).
 *        QUESTIONNAIRE_URL          The form's .../viewform link.
 *        QUESTIONNAIRE_EMAIL_ENTRY  The Email question's pre-fill key,
 *                                   e.g. entry.123456789.
 *        QUESTIONNAIRE_EMAIL_TITLE  The Email question's title, if it isn't
 *                                   exactly "Email".
 *        FROM_ADDRESS               hello@nattyfitnesstrainer.com, set up
 *                                   in Gmail under "Send mail as".
 *        CALENDAR_ID                Optional. Defaults to your main calendar.
 *        RETENTION_ENABLED          "true" once existing clients are marked
 *                                   Client in the Status column.
 *   3. In the editor, choose setUp and press Run. Approve the permissions.
 *      It adds the Leads tab and a daily trigger at 9 AM Pacific.
 *   4. Deploy > New deployment > Web app. Execute as: Me. Who has access:
 *      Anyone. Copy the web app URL into Cloudflare as the secret
 *      LEADS_SCRIPT_URL.
 *   5. When a lead becomes a client, set their Status to Client. To stop
 *      reminders for anyone, tick "Stop reminders".
 */

const LEADS_TAB = "Leads";
const TIME_ZONE = "America/Los_Angeles";
const SENDER_NAME = "Natty Fitness Trainer";
const SIGN_OFF = "Nathnael";
const CALL_DESCRIPTION = "your free 20-minute call";

const COLUMNS = [
  "Received",
  "Request ID",
  "Name",
  "Email",
  "Coaching interest",
  "Status",
  "Booked call",
  "Questionnaire done",
  "Reminder 1 sent",
  "Reminder 2 sent",
  "Stop reminders",
  "Notes",
];
const STATUSES = ["New", "Replied", "Client", "Closed"];

const DAY_MS = 24 * 60 * 60 * 1000;
const QUESTIONNAIRE_KEEP_DAYS = 183;
const LEADS_KEEP_DAYS = 365;
const MAX_REMINDER_AGE_DAYS = 7;

/** Letters (including common accented ones), apostrophes and hyphens only. */
const FIRST_NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ɏ][A-Za-zÀ-ÖØ-öø-ɏ'’-]{0,29}$/;

// ---------------------------------------------------------------------------
// 1. New requests from the website
// ---------------------------------------------------------------------------

function doPost(e) {
  const props = PropertiesService.getScriptProperties();
  const expectedSecret = props.getProperty("LEADS_SECRET");

  let body = null;
  try {
    body = JSON.parse(e && e.postData ? e.postData.contents : "");
  } catch (error) {
    body = null;
  }

  if (
    !expectedSecret ||
    !body ||
    typeof body.secret !== "string" ||
    !constantTimeEquals_(body.secret, expectedSecret)
  ) {
    return jsonOutput_({ ok: false });
  }

  const lead = {
    requestId: cleanText_(body.requestId, 64),
    submittedAt: cleanText_(body.submittedAt, 40),
    name: cleanText_(body.name, 100),
    email: cleanText_(body.email, 254).toLowerCase(),
    coachingInterest: cleanText_(body.coachingInterest, 60),
  };

  if (!lead.requestId || !/^[^\s@]+@[^\s@]+$/.test(lead.email)) {
    return jsonOutput_({ ok: false });
  }

  const received = new Date(lead.submittedAt);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getLeadsSheet_();
    const columns = columnIndex_(sheet);
    if (!hasRequestId_(sheet, columns, lead.requestId)) {
      const row = new Array(COLUMNS.length).fill("");
      row[columns["Received"]] = isNaN(received.getTime())
        ? new Date()
        : received;
      row[columns["Request ID"]] = safeCell_(lead.requestId);
      row[columns["Name"]] = safeCell_(lead.name);
      row[columns["Email"]] = safeCell_(lead.email);
      row[columns["Coaching interest"]] = safeCell_(lead.coachingInterest);
      row[columns["Status"]] = "New";
      row[columns["Stop reminders"]] = false;
      sheet.appendRow(row);
    }
  } finally {
    lock.releaseLock();
  }

  return jsonOutput_({ ok: true });
}

// ---------------------------------------------------------------------------
// 2. Daily check and reminders
// ---------------------------------------------------------------------------

function runDaily() {
  const props = PropertiesService.getScriptProperties();
  const settings = readSettings_(props);
  const now = new Date();
  const sheet = getLeadsSheet_();
  const columns = columnIndex_(sheet);
  const values = sheet.getDataRange().getValues();

  const bookings = getBookingsByEmail_(settings, now);
  const answered = getQuestionnaireEmails_(settings);
  const fromAddress = getVerifiedFromAddress_(settings);
  let couldNotSend = 0;

  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const rowNumber = r + 1;
    const email = String(row[columns["Email"]] || "")
      .trim()
      .toLowerCase();
    const received = toDate_(row[columns["Received"]]);
    if (!email || !received) {
      continue;
    }

    // Record what has happened, for Nathnael's view of the sheet.
    const call = latestCallSince_(bookings[email], received);
    const recordedCall = toDate_(row[columns["Booked call"]]);
    if (call && String(recordedCall) !== String(call)) {
      setCell_(sheet, rowNumber, columns["Booked call"], call);
    } else if (!call && recordedCall && recordedCall > now) {
      // An upcoming booking that's gone from the calendar was cancelled.
      setCell_(sheet, rowNumber, columns["Booked call"], "");
    }
    const questionnaireDone = answered.has(email);
    if (questionnaireDone && !row[columns["Questionnaire done"]]) {
      setCell_(sheet, rowNumber, columns["Questionnaire done"], now);
    }

    // Decide whether a reminder is due.
    const status = String(row[columns["Status"]] || "")
      .trim()
      .toLowerCase();
    if (status === "client" || status === "closed") {
      continue;
    }
    if (isTicked_(row[columns["Stop reminders"]])) {
      continue;
    }
    if (row[columns["Reminder 2 sent"]]) {
      continue;
    }
    if (call && call.getTime() <= now.getTime()) {
      continue; // The call already happened.
    }

    const needsBooking = !call && Boolean(settings.bookingUrl);
    const needsQuestionnaire =
      !questionnaireDone && Boolean(settings.questionnaireUrl);
    if (!needsBooking && !needsQuestionnaire) {
      continue;
    }

    const days = calendarDaysBetween_(received, now);
    if (days > MAX_REMINDER_AGE_DAYS) {
      continue; // Too old to chase, e.g. after the script was paused.
    }
    let reminder = 0;
    if (days >= 3) {
      reminder = 2;
    } else if (days >= 1 && !row[columns["Reminder 1 sent"]]) {
      reminder = 1;
    }
    if (reminder === 0) {
      continue;
    }

    if (repliedStop_(email, received)) {
      setCell_(sheet, rowNumber, columns["Stop reminders"], true);
      setCell_(
        sheet,
        rowNumber,
        columns["Notes"],
        appendNote_(row[columns["Notes"]], "Replied STOP"),
      );
      continue;
    }

    if (!fromAddress) {
      couldNotSend++;
      continue;
    }

    sendReminder_({
      to: email,
      fromAddress: fromAddress,
      name: String(row[columns["Name"]] || ""),
      isFinal: reminder === 2,
      needsBooking: needsBooking,
      needsQuestionnaire: needsQuestionnaire,
      settings: settings,
    });
    setCell_(
      sheet,
      rowNumber,
      columns[reminder === 2 ? "Reminder 2 sent" : "Reminder 1 sent"],
      now,
    );
  }

  runRetention_(settings, now);

  if (couldNotSend > 0) {
    // Apps Script emails the owner when a scheduled run fails, so this is
    // how Nathnael hears about it. Nothing is sent from his personal Gmail.
    throw new Error(
      couldNotSend +
        " reminder(s) not sent: FROM_ADDRESS isn't set up as a Gmail " +
        '"Send mail as" address yet.',
    );
  }
}

function sendReminder_(options) {
  const settings = options.settings;
  const firstName = greetingName_(options.name);
  const items = [];

  if (options.needsBooking) {
    items.push({
      text: "Pick a time for " + CALL_DESCRIPTION + ".",
      label: "Pick a time",
      href: bookingLink_(settings.bookingUrl, options.name, options.to),
    });
  }
  if (options.needsQuestionnaire) {
    items.push({
      text: "Fill out the questionnaire so our call can focus on you.",
      label: "Start the questionnaire",
      href: questionnaireLink_(settings, options.to),
    });
  }

  const subject = options.isFinal
    ? "Last reminder: your free consultation"
    : "Quick reminder: your free consultation";
  const intro = options.isFinal
    ? "One last reminder about your consultation request, then I'll stop."
    : "Just a quick reminder about your consultation request.";
  const ignoreLine = "If you've already done this, you can ignore this email.";
  const stopLine = "Reply STOP and I won't send any more reminders.";

  const text = ["Hi " + firstName + ",", "", intro, ""]
    .concat(
      items.map(function (item) {
        return item.text + "\n" + item.label + ": " + item.href;
      }),
    )
    .concat(["", ignoreLine, stopLine, "", SIGN_OFF])
    .join("\n");

  const html = [
    "<p>Hi " + escapeHtml_(firstName) + ",</p>",
    "<p>" + escapeHtml_(intro) + "</p>",
  ]
    .concat(
      items.map(function (item) {
        return (
          "<p>" +
          escapeHtml_(item.text) +
          '<br /><a href="' +
          escapeHtml_(item.href) +
          '">' +
          escapeHtml_(item.label) +
          "</a></p>"
        );
      }),
    )
    .concat([
      "<p>" +
        escapeHtml_(ignoreLine) +
        "<br />" +
        escapeHtml_(stopLine) +
        "</p>",
      "<p>" + escapeHtml_(SIGN_OFF) + "</p>",
    ])
    .join("\n");

  GmailApp.sendEmail(options.to, subject, text, {
    htmlBody: html,
    from: options.fromAddress,
    name: SENDER_NAME,
    replyTo: options.fromAddress,
  });
}

// ---------------------------------------------------------------------------
// 3. Retention (off until RETENTION_ENABLED is "true")
// ---------------------------------------------------------------------------

function runRetention_(settings, now) {
  if (!settings.retentionEnabled) {
    return;
  }

  const sheet = getLeadsSheet_();
  const columns = columnIndex_(sheet);
  const values = sheet.getDataRange().getValues();
  const clients = new Set();
  for (let r = 1; r < values.length; r++) {
    const status = String(values[r][columns["Status"]] || "")
      .trim()
      .toLowerCase();
    if (status === "client") {
      clients.add(
        String(values[r][columns["Email"]] || "")
          .trim()
          .toLowerCase(),
      );
    }
  }

  // Questionnaire answers from people who aren't clients, after 6 months:
  // removed from the form itself and from its responses sheet.
  if (settings.formId) {
    const cutoff = new Date(now.getTime() - QUESTIONNAIRE_KEEP_DAYS * DAY_MS);
    const form = FormApp.openById(settings.formId);
    form.getResponses().forEach(function (response) {
      const email = responseEmail_(response, settings);
      if (response.getTimestamp() < cutoff && !clients.has(email)) {
        form.deleteResponse(response.getId());
      }
    });
    deleteOldResponseRows_(form, settings, cutoff, clients);
  }

  // Leads rows for people who aren't clients, after 12 months.
  const leadCutoff = new Date(now.getTime() - LEADS_KEEP_DAYS * DAY_MS);
  for (let r = values.length - 1; r >= 1; r--) {
    const received = toDate_(values[r][columns["Received"]]);
    const status = String(values[r][columns["Status"]] || "")
      .trim()
      .toLowerCase();
    if (received && received < leadCutoff && status !== "client") {
      sheet.deleteRow(r + 1);
    }
  }
}

function deleteOldResponseRows_(form, settings, cutoff, clients) {
  if (form.getDestinationType() !== FormApp.DestinationType.SPREADSHEET) {
    return;
  }
  const spreadsheet = SpreadsheetApp.openById(form.getDestinationId());
  const formUrl = form.getEditUrl().replace(/\/edit.*$/, "");
  const sheet = spreadsheet.getSheets().find(function (candidate) {
    const linked = candidate.getFormUrl();
    return linked && linked.replace(/\/viewform.*$|\/edit.*$/, "") === formUrl;
  });
  if (!sheet) {
    return;
  }

  const values = sheet.getDataRange().getValues();
  const header = values[0].map(function (cell) {
    return String(cell).trim().toLowerCase();
  });
  const emailColumn = header.indexOf(settings.emailTitle.toLowerCase());
  for (let r = values.length - 1; r >= 1; r--) {
    const timestamp = toDate_(values[r][0]);
    const email =
      emailColumn >= 0
        ? String(values[r][emailColumn] || "")
            .trim()
            .toLowerCase()
        : "";
    if (timestamp && timestamp < cutoff && !clients.has(email)) {
      sheet.deleteRow(r + 1);
    }
  }
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

function setUp() {
  const sheet = getLeadsSheet_();
  sheet
    .getRange(2, COLUMNS.indexOf("Status") + 1, sheet.getMaxRows() - 1, 1)
    .setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList(STATUSES, true)
        .build(),
    );
  sheet
    .getRange(
      2,
      COLUMNS.indexOf("Stop reminders") + 1,
      sheet.getMaxRows() - 1,
      1,
    )
    .insertCheckboxes();

  ScriptApp.getProjectTriggers()
    .filter(function (trigger) {
      return trigger.getHandlerFunction() === "runDaily";
    })
    .forEach(function (trigger) {
      ScriptApp.deleteTrigger(trigger);
    });
  ScriptApp.newTrigger("runDaily")
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .inTimezone(TIME_ZONE)
    .create();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readSettings_(props) {
  return {
    bookingUrl: props.getProperty("BOOKING_URL") || "",
    formId: props.getProperty("QUESTIONNAIRE_FORM_ID") || "",
    questionnaireUrl: props.getProperty("QUESTIONNAIRE_URL") || "",
    questionnaireEmailEntry:
      props.getProperty("QUESTIONNAIRE_EMAIL_ENTRY") || "",
    emailTitle: props.getProperty("QUESTIONNAIRE_EMAIL_TITLE") || "Email",
    fromAddress: (props.getProperty("FROM_ADDRESS") || "").trim(),
    calendarId: props.getProperty("CALENDAR_ID") || "",
    retentionEnabled: props.getProperty("RETENTION_ENABLED") === "true",
  };
}

function getLeadsSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(LEADS_TAB);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(LEADS_TAB);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold");
  }
  return sheet;
}

/** Column positions by header name, so moving columns doesn't break anything. */
function columnIndex_(sheet) {
  const header = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];
  const index = {};
  COLUMNS.forEach(function (name) {
    const position = header.indexOf(name);
    if (position < 0) {
      throw new Error('The Leads tab is missing the "' + name + '" column.');
    }
    index[name] = position;
  });
  return index;
}

function hasRequestId_(sheet, columns, requestId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return false;
  }
  return sheet
    .getRange(2, columns["Request ID"] + 1, lastRow - 1, 1)
    .getValues()
    .some(function (cell) {
      return String(cell[0]).replace(/^'/, "") === requestId;
    });
}

/** Every Google Calendar event start, by guest email, from 60 days back to 90 ahead. */
function getBookingsByEmail_(settings, now) {
  const calendar = settings.calendarId
    ? CalendarApp.getCalendarById(settings.calendarId)
    : CalendarApp.getDefaultCalendar();
  const byEmail = {};
  if (!calendar) {
    return byEmail;
  }
  const events = calendar.getEvents(
    new Date(now.getTime() - 60 * DAY_MS),
    new Date(now.getTime() + 90 * DAY_MS),
  );
  events.forEach(function (event) {
    event.getGuestList().forEach(function (guest) {
      const email = guest.getEmail().trim().toLowerCase();
      (byEmail[email] = byEmail[email] || []).push(event.getStartTime());
    });
  });
  return byEmail;
}

function latestCallSince_(starts, received) {
  if (!starts) {
    return null;
  }
  const earliestCounted = received.getTime() - DAY_MS;
  let latest = null;
  starts.forEach(function (start) {
    if (start.getTime() >= earliestCounted && (!latest || start > latest)) {
      latest = start;
    }
  });
  return latest;
}

function getQuestionnaireEmails_(settings) {
  const emails = new Set();
  if (!settings.formId) {
    return emails;
  }
  FormApp.openById(settings.formId)
    .getResponses()
    .forEach(function (response) {
      const email = responseEmail_(response, settings);
      if (email) {
        emails.add(email);
      }
    });
  return emails;
}

function responseEmail_(response, settings) {
  const wanted = settings.emailTitle.trim().toLowerCase();
  const match = response.getItemResponses().find(function (itemResponse) {
    return itemResponse.getItem().getTitle().trim().toLowerCase() === wanted;
  });
  const answer = match ? String(match.getResponse() || "") : "";
  return (answer || response.getRespondentEmail() || "").trim().toLowerCase();
}

/** True when the lead replied to a reminder with STOP as the first word. */
function repliedStop_(email, received) {
  const query =
    "from:(" +
    email +
    ") after:" +
    Utilities.formatDate(received, TIME_ZONE, "yyyy/MM/dd");
  return GmailApp.search(query, 0, 20).some(function (thread) {
    return thread.getMessages().some(function (message) {
      if (message.getFrom().toLowerCase().indexOf(email) < 0) {
        return false;
      }
      const firstLine =
        message
          .getPlainBody()
          .split("\n")
          .map(function (line) {
            return line.trim();
          })
          .find(function (line) {
            return line.length > 0;
          }) || "";
      return (
        /^stop\b/i.test(firstLine) ||
        /^stop\b/i.test(message.getSubject().replace(/^re:\s*/i, ""))
      );
    });
  });
}

/** FROM_ADDRESS, only if Gmail is set up to send as it. */
function getVerifiedFromAddress_(settings) {
  if (!settings.fromAddress) {
    return null;
  }
  const wanted = settings.fromAddress.toLowerCase();
  const aliases = GmailApp.getAliases().map(function (alias) {
    return alias.toLowerCase();
  });
  return aliases.indexOf(wanted) >= 0 ? settings.fromAddress : null;
}

function bookingLink_(bookingUrl, name, email) {
  const separator = bookingUrl.indexOf("?") >= 0 ? "&" : "?";
  return (
    bookingUrl +
    separator +
    "name=" +
    encodeURIComponent(name) +
    "&email=" +
    encodeURIComponent(email)
  );
}

function questionnaireLink_(settings, email) {
  if (!settings.questionnaireEmailEntry) {
    return settings.questionnaireUrl;
  }
  const separator = settings.questionnaireUrl.indexOf("?") >= 0 ? "&" : "?";
  return (
    settings.questionnaireUrl +
    separator +
    "usp=pp_url&" +
    encodeURIComponent(settings.questionnaireEmailEntry) +
    "=" +
    encodeURIComponent(email)
  );
}

function greetingName_(fullName) {
  const first = String(fullName || "")
    .trim()
    .split(/\s+/)[0];
  return FIRST_NAME_PATTERN.test(first) ? first : "there";
}

/** Whole days between two dates, counted on the Pacific calendar. */
function calendarDaysBetween_(from, to) {
  const day = function (date) {
    const parts = Utilities.formatDate(date, TIME_ZONE, "yyyy-MM-dd").split(
      "-",
    );
    return Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  };
  return Math.round((day(to) - day(from)) / DAY_MS);
}

function toDate_(value) {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function isTicked_(value) {
  return value === true || /^(yes|true|x)$/i.test(String(value || "").trim());
}

function setCell_(sheet, rowNumber, columnIndex, value) {
  sheet.getRange(rowNumber, columnIndex + 1).setValue(value);
}

function appendNote_(existing, note) {
  const current = String(existing || "").trim();
  return current ? current + "; " + note : note;
}

function cleanText_(value, maxLength) {
  return String(value == null ? "" : value)
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Stops a value like "=HYPERLINK(...)" from running as a formula in the sheet. */
function safeCell_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function constantTimeEquals_(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let difference = 0;
  for (let i = 0; i < a.length; i++) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return difference === 0;
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function jsonOutput_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
