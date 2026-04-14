#!/usr/bin/env bun
/**
 * Date MCP Server - Multi-tool MCP for calendars, prayer times, moon phases, and astronomy.
 * Works with LM Studio, Claude Desktop, Ollama, and any MCP-compatible client via stdio transport.
 *
 * Usage: bun run src/index.ts
 * Config (LM Studio mcp.json): {"mcpServers":{"date-mcp":{"command":"bun","args":["/path/to/src/index.ts"]}}}
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// moment-hijri (this IS moment, patched with hijri support - must import it directly)
import moment from "moment-hijri";

// astronomy engine for sun/moon calculations
import * as Astro from "astronomy-engine";

// ============================================================
// Helper Functions
// ============================================================

function getSunDeclination(date: Date): number {
  const sv = Astro.GeoVector(Astro.Body.Sun, date, true);
  const eq = Astro.EquatorFromVector(sv);
  return eq.dec;
}

function formatTime(date: Date, timezone: string): string {
  return date.toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatDate(date: Date, timezone: string): string {
  return date.toLocaleDateString("en-US", {
    timeZone: timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getMoonPhaseName(phaseAngle: number): string {
  // phase_angle from Illumination: 0 = full, 180 = new
  if (phaseAngle < 22.5) return "Full Moon";
  if (phaseAngle < 67.5) return "Waning Gibbous";
  if (phaseAngle < 112.5) return "Last Quarter";
  if (phaseAngle < 157.5) return "Waning Crescent";
  if (phaseAngle < 202.5) return "New Moon";
  if (phaseAngle < 247.5) return "Waxing Crescent";
  if (phaseAngle < 292.5) return "First Quarter";
  if (phaseAngle < 337.5) return "Waxing Gibbous";
  return "Full Moon";
}

const HIJRI_MONTH_NAMES = [
  "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
  "Jumada al-Ula", "Jumada al-Thania", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
];

const HIJRI_WEEKDAYS = [
  "Yaum al-Ahad (Sunday)", "Yaum al-Ithnayn (Monday)", "Yaum ath-Thulatha (Tuesday)",
  "Yaum al-Arba'a (Wednesday)", "Yaum al-Khamis (Thursday)", "Yaum al-Jumu'a (Friday)",
  "Yaum as-Sabt (Saturday)",
];

function getHijriDateParts(date: moment.Moment): { year: number; month: number; day: number } {
  return {
    year: (date as any).iYear() as number,
    month: ((date as any).iMonth() as number) + 1, // 0-based to 1-based
    day: (date as any).iDate() as number,
  };
}

function getChineseZodiac(year: number): string {
  const animals = [
    "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
    "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig",
  ];
  const elements = ["Metal", "Water", "Wood", "Fire", "Earth"];
  const branch = ((year - 4) % 12 + 12) % 12;
  const elementIndex = Math.floor(((year - 4) % 10 + 10) % 10 / 2);
  return `${elements[elementIndex]} ${animals[branch]}`;
}

function getChineseDateString(date: Date): string {
  const year = date.getFullYear();

  // Find the Chinese New Year (new moon between Jan 21 - Feb 20)
  let newMoon = Astro.SearchMoonPhase(0, new Date(year, 0, 1), 60);
  // Ensure we get the CNY in Jan/Feb
  while (newMoon.date.getMonth() > 1 || (newMoon.date.getMonth() === 1 && newMoon.date.getDate() > 21)) {
    newMoon = Astro.SearchMoonPhase(0, new Date(newMoon.date.getTime() - 30 * 86400000), 60);
  }
  while (newMoon.date.getMonth() < 1 || (newMoon.date.getMonth() === 0 && newMoon.date.getDate() < 21)) {
    newMoon = Astro.SearchMoonPhase(0, new Date(newMoon.date.getTime() + 10 * 86400000), 60);
  }

  const cny = newMoon.date;
  const zodiac = getChineseZodiac(year);
  const daysDiff = Math.floor((date.getTime() - cny.getTime()) / 86400000);

  if (daysDiff < 0) {
    // Date is before this year's CNY, use previous year's CNY
    return getChineseDateString(new Date(year - 1, date.getMonth(), date.getDate()));
  }

  const lunarMonth = Math.floor(daysDiff / 29.5) + 1;
  const lunarDay = (daysDiff % 29) + 1;

  return `${zodiac} Year, Month ${lunarMonth}, Day ${lunarDay}`;
}

function gregorianToPersian(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100)
    + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

function calculatePrayerTimes(
  latitude: number,
  longitude: number,
  date: Date,
  elevation: number = 0,
  method: string = "MWL"
): Record<string, Date> {
  const obs = new Astro.Observer(latitude, longitude, elevation);

  // Start search from midnight UTC of the target date (to catch Fajr which is before noon)
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

  // Fajr angle by method
  const fajrAngle =
    method === "ISNA" ? -15 :
    method === "Egypt" ? -19.5 :
    method === "Makkah" ? -18.5 :
    method === "Karachi" ? -18 :
    -18; // MWL default

  // Isha angle by method
  const ishaAngle =
    method === "ISNA" ? -15 :
    method === "Egypt" ? -17.5 :
    method === "Makkah" ? -19 :
    method === "Karachi" ? -18 :
    -17; // MWL default

  // Fajr: sun rising through fajrAngle (direction=1 means altitude increasing)
  // Search from dayStart to give enough window for all longitudes
  const fajr = Astro.SearchAltitude(Astro.Body.Sun, obs, 1, dayStart, 1, fajrAngle);

  // Sunrise: sun rising through -0.833°
  const sunrise = Astro.SearchAltitude(Astro.Body.Sun, obs, 1, dayStart, 1, -0.833);

  // Sunset: sun descending through -0.833° (direction=-1 means altitude decreasing)
  const sunset = Astro.SearchAltitude(Astro.Body.Sun, obs, -1, dayStart, 1, -0.833);

  // Dhuhr = midpoint of sunrise and sunset
  const dhuhr = new Date(
    (sunrise.date.getTime() + sunset.date.getTime()) / 2
  );

  // Asr (Shafi'i): shadow length = 1 + noon shadow
  // Formula: tan(asr_alt) = 1 / (1 + tan(|lat - dec|))
  const dec = getSunDeclination(dhuhr);
  const latRad = (latitude * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;
  const tanShadow = Math.tan(Math.abs(latRad - decRad));
  const asrAltDeg = (Math.atan(1 / (1 + tanShadow)) * 180) / Math.PI;
  const asr = Astro.SearchAltitude(Astro.Body.Sun, obs, -1, dhuhr, 0.5, asrAltDeg);

  // Maghrib = sunset (same event)
  const maghrib = sunset;

  // Isha: sun descending through ishaAngle after sunset
  const isha = Astro.SearchAltitude(Astro.Body.Sun, obs, -1, sunset.date, 1, ishaAngle);

  return {
    Fajr: fajr.date,
    Sunrise: sunrise.date,
    Dhuhr: dhuhr,
    Asr: asr.date,
    Maghrib: maghrib.date,
    Isha: isha.date,
  };
}

// ============================================================
// MCP Server Setup
// ============================================================

const server = new McpServer({
  name: "date-mcp",
  version: "1.0.0",
});

// ============================================================
// Tool 1: Get Current Gregorian Date
// ============================================================
server.tool(
  "get_gregorian_date",
  "Get the current Gregorian (Western) date and time in a specified timezone with full formatting. Returns date, time, day of week, week number, day of year, and ISO format.",
  {
    timezone: z.string().describe("IANA timezone string, e.g. 'America/New_York', 'Asia/Tokyo', 'UTC'").default("UTC"),
  },
  async ({ timezone }) => {
    const now = new Date();
    const m = moment(now);

    const result = [
      `**Gregorian Date & Time**`,
      `Date: ${formatDate(now, timezone)}`,
      `Time: ${formatTime(now, timezone)}`,
      `Timezone: ${timezone}`,
      `ISO 8601: ${now.toISOString()}`,
      `Day of Year: ${m.dayOfYear()}`,
      `Week Number (ISO): ${m.isoWeek()}`,
      `Quarter: Q${m.quarter()}`,
      `Unix Timestamp: ${now.getTime()}`,
      `Is Leap Year: ${m.isLeapYear()}`,
    ].join("\n");

    return { content: [{ type: "text", text: result }] };
  }
);

// ============================================================
// Tool 2: Get Current Hijri (Islamic) Date
// ============================================================
server.tool(
  "get_hijri_date",
  "Get the current Hijri (Islamic) calendar date. Returns the Hijri date, month name, day of week in both Hijri and Gregorian, and important Islamic calendar info.",
  {
    locale: z.enum(["en", "ar"]).describe("Locale for output: 'en' for English, 'ar' for Arabic").default("en"),
  },
  async ({ locale }) => {
    const now = moment();
    const hijri = getHijriDateParts(now);
    const dayOfWeek = now.day();

    const result = [
      `**Hijri (Islamic) Calendar Date**`,
      `Hijri Date: ${hijri.year}/${String(hijri.month).padStart(2, "0")}/${String(hijri.day).padStart(2, "0")}`,
      `Day: ${hijri.day}`,
      `Month: ${HIJRI_MONTH_NAMES[hijri.month - 1]} (${hijri.month})`,
      `Year: ${hijri.year} AH`,
      `Day of Week: ${HIJRI_WEEKDAYS[dayOfWeek]}`,
      `Gregorian Equivalent: ${now.format("dddd, YYYY-MM-DD")}`,
      `Locale: ${locale === "ar" ? "Arabic" : "English"}`,
    ].join("\n");

    return { content: [{ type: "text", text: result }] };
  }
);

// ============================================================
// Tool 3: Get Chinese Calendar Date
// ============================================================
server.tool(
  "get_chinese_date",
  "Get the current Chinese (Lunar) calendar date. Includes the Chinese zodiac animal, element, lunar month and day, and the estimated Chinese New Year for the year.",
  {},
  async () => {
    const now = new Date();
    const year = now.getFullYear();
    const chineseDate = getChineseDateString(now);

    // Find Chinese New Year for this year
    let cny = Astro.SearchMoonPhase(0, new Date(year, 0, 1), 60);
    while (cny.date.getMonth() > 1 || (cny.date.getMonth() === 1 && cny.date.getDate() > 21)) {
      cny = Astro.SearchMoonPhase(0, new Date(cny.date.getTime() - 30 * 86400000), 60);
    }
    while (cny.date.getMonth() < 1 || (cny.date.getMonth() === 0 && cny.date.getDate() < 21)) {
      cny = Astro.SearchMoonPhase(0, new Date(cny.date.getTime() + 10 * 86400000), 60);
    }

    const result = [
      `**Chinese (Lunar) Calendar Date**`,
      `Lunar Date: ${chineseDate}`,
      `Zodiac Animal: ${getChineseZodiac(year)}`,
      `Gregorian Date: ${formatDate(now, "Asia/Shanghai")}`,
      `Chinese New Year ${year}: ${cny.date.toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" })}`,
      ``,
      `Chinese zodiac cycle: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig`,
    ].join("\n");

    return { content: [{ type: "text", text: result }] };
  }
);

// ============================================================
// Tool 4: Get Persian (Solar Hijri) Date
// ============================================================
server.tool(
  "get_persian_date",
  "Get the current Persian (Solar Hijri / Jalali) calendar date. Includes the Persian month name, day, year, and Nowruz (Persian New Year) info.",
  {},
  async () => {
    const now = new Date();
    const [py, pm, pd] = gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());

    const persianMonths = [
      "Farvardin", "Ordibehesht", "Khordad", "Tir",
      "Mordad", "Shahrivar", "Mehr", "Aban",
      "Azar", "Dey", "Bahman", "Esfand",
    ];
    const persianWeekdays = ["Shanbeh", "Yekshanbeh", "Doshanbeh", "Seshanbeh", "Chaharshanbeh", "Panjshanbeh", "Jomeh"];

    const result = [
      `**Persian (Jalali / Solar Hijri) Calendar Date**`,
      `Date: ${py}/${String(pm).padStart(2, "0")}/${String(pd).padStart(2, "0")}`,
      `Long Format: ${persianWeekdays[now.getDay()]}, ${pd} ${persianMonths[pm - 1]} ${py}`,
      `Month: ${persianMonths[pm - 1]} (${pm})`,
      `Day: ${pd}`,
      `Year: ${py} SH`,
      `Gregorian Equivalent: ${formatDate(now, "Asia/Tehran")}`,
      ``,
      `Nowruz (Persian New Year) falls on the March equinox, typically March 20-21.`,
    ].join("\n");

    return { content: [{ type: "text", text: result }] };
  }
);

// ============================================================
// Tool 5: Get Moon Phase
// ============================================================
server.tool(
  "get_moon_phase",
  "Get the current moon phase, illumination percentage, and next major moon events (new moon, first quarter, full moon, last quarter). Uses astronomy-engine for precise calculations.",
  {},
  async () => {
    const now = new Date();
    const illum = Astro.Illumination(Astro.Body.Moon, now);
    const phaseName = getMoonPhaseName(illum.phase_angle);
    const illumPercent = ((1 - illum.phase_angle / 180) * 100).toFixed(1);

    const nextNewMoon = Astro.SearchMoonPhase(0, now, 30);
    const nextFirstQuarter = Astro.SearchMoonPhase(90, now, 30);
    const nextFullMoon = Astro.SearchMoonPhase(180, now, 30);
    const nextLastQuarter = Astro.SearchMoonPhase(270, now, 30);

    const events = [
      { name: "New Moon", date: nextNewMoon.date },
      { name: "First Quarter", date: nextFirstQuarter.date },
      { name: "Full Moon", date: nextFullMoon.date },
      { name: "Last Quarter", date: nextLastQuarter.date },
    ].filter((e) => e.date > now).sort((a, b) => a.date.getTime() - b.date.getTime());

    const result = [
      `**Moon Phase Information**`,
      `Current Phase: ${phaseName}`,
      `Illumination: ${illumPercent}%`,
      `Phase Angle: ${illum.phase_angle.toFixed(2)}\u00B0`,
      `Age: ${((illum.phase_angle / 360) * 29.53).toFixed(1)} days (approx)`,
      `Distance from Earth: ${(illum.geo_dist * 149597870.7).toFixed(0)} km`,
      ``,
      `**Upcoming Moon Events:**`,
      ...events.map(
        (e) =>
          `  ${e.name}: ${e.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} at ${e.date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}`
      ),
    ].join("\n");

    return { content: [{ type: "text", text: result }] };
  }
);

// ============================================================
// Tool 6: Get Prayer Times
// ============================================================
server.tool(
  "get_prayer_times",
  "Get Islamic prayer times (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha) for a specific location and date. Supports multiple calculation methods (MWL, ISNA, Egypt, Makkah, Karachi). Uses astronomy-engine for precise sun position calculations.",
  {
    latitude: z.number().min(-90).max(90).describe("Latitude of the location (e.g. 21.4225 for Makkah)"),
    longitude: z.number().min(-180).max(180).describe("Longitude of the location (e.g. 39.8262 for Makkah)"),
    date: z.string().optional().describe("Date in YYYY-MM-DD format (default: today)"),
    method: z.enum(["MWL", "ISNA", "Egypt", "Makkah", "Karachi"]).describe("Calculation method for Fajr/Isha angles").default("MWL"),
    timezone: z.string().describe("IANA timezone for displaying times, e.g. 'Asia/Riyadh'").default("UTC"),
    location_name: z.string().optional().describe("Name of the location for display (e.g. 'Makkah, Saudi Arabia')"),
  },
  async ({ latitude, longitude, date, method, timezone, location_name }) => {
    const targetDate = date ? new Date(date + "T12:00:00Z") : new Date();
    const locDisplay = location_name || `${latitude}\u00B0, ${longitude}\u00B0`;

    const prayerTimes = calculatePrayerTimes(latitude, longitude, targetDate, 0, method);

    const methodDescriptions: Record<string, string> = {
      MWL: "Muslim World League (Fajr: 18\u00B0, Isha: 17\u00B0)",
      ISNA: "Islamic Society of North America (Fajr: 15\u00B0, Isha: 15\u00B0)",
      Egypt: "Egyptian General Authority (Fajr: 19.5\u00B0, Isha: 17.5\u00B0)",
      Makkah: "Umm al-Qura, Makkah (Fajr: 18.5\u00B0, Isha: 19\u00B0)",
      Karachi: "University of Islamic Sciences, Karachi (Fajr: 18\u00B0, Isha: 18\u00B0)",
    };

    const result = [
      `**Islamic Prayer Times**`,
      `Location: ${locDisplay}`,
      `Coordinates: ${latitude}\u00B0, ${longitude}\u00B0`,
      `Date: ${formatDate(targetDate, timezone)}`,
      `Method: ${method} \u2014 ${methodDescriptions[method]}`,
      `Timezone: ${timezone}`,
      ``,
      `  Fajr:      ${formatTime(prayerTimes.Fajr, timezone)}`,
      `  Sunrise:   ${formatTime(prayerTimes.Sunrise, timezone)}`,
      `  Dhuhr:     ${formatTime(prayerTimes.Dhuhr, timezone)}`,
      `  Asr:       ${formatTime(prayerTimes.Asr, timezone)} (Shafi'i)`,
      `  Maghrib:   ${formatTime(prayerTimes.Maghrib, timezone)}`,
      `  Isha:      ${formatTime(prayerTimes.Isha, timezone)}`,
    ].join("\n");

    return { content: [{ type: "text", text: result }] };
  }
);

// ============================================================
// Tool 7: Get Sun Position
// ============================================================
server.tool(
  "get_sun_position",
  "Get the current sun position including right ascension, declination, ecliptic longitude, distance from Earth, and distance in AU. Useful for astronomical calculations and solar-related queries.",
  {
    latitude: z.number().min(-90).max(90).describe("Observer latitude").default(0),
    longitude: z.number().min(-180).max(180).describe("Observer longitude").default(0),
  },
  async ({ latitude, longitude }) => {
    const now = new Date();
    const sp = Astro.SunPosition(now);
    const sv = Astro.GeoVector(Astro.Body.Sun, now, true);
    const eq = Astro.EquatorFromVector(sv);

    const result = [
      `**Sun Position**`,
      `Right Ascension: ${eq.ra.toFixed(4)} hours (${(eq.ra * 15).toFixed(2)}\u00B0)`,
      `Declination: ${eq.dec.toFixed(4)}\u00B0`,
      `Ecliptic Longitude: ${sp.elon.toFixed(4)}\u00B0`,
      `Distance from Earth: ${eq.dist.toFixed(6)} AU (${(eq.dist * 149597870.7).toFixed(0)} km)`,
      `Observer: ${latitude}\u00B0N, ${longitude}\u00B0E`,
      `Time (UTC): ${now.toISOString()}`,
    ].join("\n");

    return { content: [{ type: "text", text: result }] };
  }
);

// ============================================================
// Tool 8: Convert Between Dates
// ============================================================
server.tool(
  "convert_date",
  "Convert a Gregorian date to Hijri, Persian, or Chinese calendar equivalent, or convert a Hijri date to Gregorian.",
  {
    calendar: z.enum(["gregorian", "hijri"]).describe("Source calendar system"),
    year: z.number().describe("Year in the source calendar"),
    month: z.number().min(1).max(12).describe("Month (1-12)"),
    day: z.number().min(1).max(31).describe("Day"),
  },
  async ({ calendar, year, month, day }) => {
    let date: moment.Moment;
    let sourceStr: string;

    if (calendar === "gregorian") {
      date = moment([year, month - 1, day]);
      sourceStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} (Gregorian)`;
    } else {
      // Parse Hijri date using moment-hijri
      date = moment(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`, "iYYYY-iMM-iDD");
      sourceStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} (${year} AH, Hijri)`;
    }

    if (!date.isValid()) {
      return {
        content: [{ type: "text", text: `Invalid ${calendar} date: ${year}-${month}-${day}` }],
      };
    }

    const gregorian = date.format("YYYY-MM-DD");
    const hParts = getHijriDateParts(date);
    const hijri = `${hParts.year}-${String(hParts.month).padStart(2, "0")}-${String(hParts.day).padStart(2, "0")}`;
    const [py, pm2, pd] = gregorianToPersian(date.year(), date.month() + 1, date.date());
    const persian = `${py}-${String(pm2).padStart(2, "0")}-${String(pd).padStart(2, "0")}`;
    const chinese = getChineseDateString(date.toDate());

    const result = [
      `**Date Conversion**`,
      `Source: ${sourceStr}`,
      ``,
      `  Gregorian: ${gregorian} (${date.format("dddd, MMMM D, YYYY")})`,
      `  Hijri:     ${hijri} AH (${HIJRI_MONTH_NAMES[hParts.month - 1]})`,
      `  Persian:   ${persian} SH`,
      `  Chinese:   ${chinese}`,
    ].join("\n");

    return { content: [{ type: "text", text: result }] };
  }
);

// ============================================================
// Tool 9: Get Upcoming Events
// ============================================================
server.tool(
  "get_upcoming_events",
  "Get upcoming astronomical and calendar events including moon phases, equinoxes, solstices, and notable dates. Shows events for the next 60 days.",
  {},
  async () => {
    const now = new Date();
    const events: { name: string; date: Date; type: string }[] = [];

    const phases = [
      { name: "New Moon", lon: 0 },
      { name: "First Quarter", lon: 90 },
      { name: "Full Moon", lon: 180 },
      { name: "Last Quarter", lon: 270 },
    ];

    for (const phase of phases) {
      try {
        const r = Astro.SearchMoonPhase(phase.lon, now, 60);
        if (r.date > now) {
          events.push({ name: phase.name, date: r.date, type: "Moon" });
        }
      } catch { /* skip */ }
    }

    const seasons = Astro.Seasons(now.getFullYear());
    const seasonEvents = [
      { name: "March Equinox", date: seasons.mar_equinox, type: "Season" },
      { name: "June Solstice", date: seasons.jun_solstice, type: "Season" },
      { name: "September Equinox", date: seasons.sep_equinox, type: "Season" },
      { name: "December Solstice", date: seasons.dec_solstice, type: "Season" },
    ];

    for (const se of seasonEvents) {
      if (se.date > now) {
        events.push(se);
      }
    }

    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    const result = [
      `**Upcoming Astronomical & Calendar Events**`,
      `Generated: ${now.toISOString()}`,
      `Showing next ${Math.min(events.length, 10)} events:`,
      ``,
      ...events.slice(0, 10).map((e) => {
        const daysUntil = Math.ceil((e.date.getTime() - now.getTime()) / 86400000);
        return `  [${e.type}] ${e.name} \u2014 ${e.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} (${daysUntil} days away)`;
      }),
    ].join("\n");

    return { content: [{ type: "text", text: result }] };
  }
);

// ============================================================
// Start Server
// ============================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error starting MCP server:", error);
  process.exit(1);
});
