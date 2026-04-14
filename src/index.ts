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

import moment from "moment-hijri";
import * as Astro from "astronomy-engine";

const CITY_COORDINATES: Record<string, { lat: number; lon: number; country: string; timezone: string; method?: string }> = {
  "Makkah": { lat: 21.3891, lon: 39.8579, country: "Saudi Arabia", timezone: "Asia/Riyadh", method: "Makkah" },
  "Mecca": { lat: 21.3891, lon: 39.8579, country: "Saudi Arabia", timezone: "Asia/Riyadh", method: "Makkah" },
  "Madinah": { lat: 24.5247, lon: 39.5692, country: "Saudi Arabia", timezone: "Asia/Riyadh", method: "Makkah" },
  "Medina": { lat: 24.5247, lon: 39.5692, country: "Saudi Arabia", timezone: "Asia/Riyadh", method: "Makkah" },
  "Riyadh": { lat: 24.7136, lon: 46.6753, country: "Saudi Arabia", timezone: "Asia/Riyadh" },
  "Jeddah": { lat: 21.4858, lon: 39.1925, country: "Saudi Arabia", timezone: "Asia/Riyadh" },
  "Dubai": { lat: 25.2048, lon: 55.2708, country: "UAE", timezone: "Asia/Dubai" },
  "Abu Dhabi": { lat: 24.4539, lon: 54.3773, country: "UAE", timezone: "Asia/Dubai" },
  "Doha": { lat: 25.2854, lon: 51.531, country: "Qatar", timezone: "Asia/Qatar" },
  "Kuwait City": { lat: 29.3759, lon: 47.9774, country: "Kuwait", timezone: "Asia/Kuwait" },
  "Manama": { lat: 26.2285, lon: 50.586, country: "Bahrain", timezone: "Asia/Bahrain" },
  "Muscat": { lat: 23.588, lon: 58.3829, country: "Oman", timezone: "Asia/Muscat" },
  "Karachi": { lat: 24.8607, lon: 67.0011, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  "Lahore": { lat: 31.5204, lon: 74.3587, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  "Islamabad": { lat: 33.6844, lon: 73.0479, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  "Peshawar": { lat: 34.0151, lon: 71.5245, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  "Quetta": { lat: 30.1798, lon: 66.975, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  "Faisalabad": { lat: 31.4504, lon: 73.065, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  "Multan": { lat: 30.1575, lon: 71.5245, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  "Hyderabad": { lat: 25.3278, lon: 68.6694, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  "Sialkot": { lat: 32.4949, lon: 74.5379, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  "Mumbai": { lat: 19.076, lon: 72.8777, country: "India", timezone: "Asia/Kolkata" },
  "Delhi": { lat: 28.7041, lon: 77.1025, country: "India", timezone: "Asia/Kolkata" },
  "Kolkata": { lat: 22.5726, lon: 88.3639, country: "India", timezone: "Asia/Kolkata" },
  "Chennai": { lat: 13.0827, lon: 80.2707, country: "India", timezone: "Asia/Kolkata" },
  "Bangalore": { lat: 12.9716, lon: 77.5946, country: "India", timezone: "Asia/Kolkata" },
  "Hyderabad India": { lat: 17.385, lon: 78.4867, country: "India", timezone: "Asia/Kolkata" },
  "Ahmedabad": { lat: 23.0225, lon: 72.5714, country: "India", timezone: "Asia/Kolkata" },
  "Jaipur": { lat: 26.9124, lon: 75.7873, country: "India", timezone: "Asia/Kolkata" },
  "Dhaka": { lat: 23.8103, lon: 90.4125, country: "Bangladesh", timezone: "Asia/Dhaka" },
  "Chittagong": { lat: 22.3569, lon: 91.7832, country: "Bangladesh", timezone: "Asia/Dhaka" },
  "Jakarta": { lat: -6.2088, lon: 106.8456, country: "Indonesia", timezone: "Asia/Jakarta" },
  "Surabaya": { lat: -7.2575, lon: 112.7521, country: "Indonesia", timezone: "Asia/Jakarta" },
  "Bandung": { lat: -6.9175, lon: 107.6191, country: "Indonesia", timezone: "Asia/Jakarta" },
  "Medan": { lat: 3.5952, lon: 98.6722, country: "Indonesia", timezone: "Asia/Jakarta" },
  "Kuala Lumpur": { lat: 3.139, lon: 101.6869, country: "Malaysia", timezone: "Asia/Kuala_Lumpur" },
  "Johor Bahru": { lat: 1.4921, lon: 103.7389, country: "Malaysia", timezone: "Asia/Kuala_Lumpur" },
  "Singapore": { lat: 1.3521, lon: 103.8198, country: "Singapore", timezone: "Asia/Singapore" },
  "Bangkok": { lat: 13.7563, lon: 100.5018, country: "Thailand", timezone: "Asia/Bangkok" },
  "Phuket": { lat: 7.8804, lon: 98.3923, country: "Thailand", timezone: "Asia/Bangkok" },
  "Hanoi": { lat: 21.0285, lon: 105.8542, country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
  "Ho Chi Minh": { lat: 10.8231, lon: 106.6297, country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
  "Manila": { lat: 14.5995, lon: 120.9842, country: "Philippines", timezone: "Asia/Manila" },
  "Cebu": { lat: 10.3157, lon: 123.8854, country: "Philippines", timezone: "Asia/Manila" },
  "Tokyo": { lat: 35.6762, lon: 139.6503, country: "Japan", timezone: "Asia/Tokyo" },
  "Osaka": { lat: 34.6937, lon: 135.5023, country: "Japan", timezone: "Asia/Tokyo" },
  "Kyoto": { lat: 35.0116, lon: 135.7681, country: "Japan", timezone: "Asia/Tokyo" },
  "Seoul": { lat: 37.5665, lon: 126.978, country: "South Korea", timezone: "Asia/Seoul" },
  "Beijing": { lat: 39.9042, lon: 116.4074, country: "China", timezone: "Asia/Shanghai" },
  "Shanghai": { lat: 31.2304, lon: 121.4737, country: "China", timezone: "Asia/Shanghai" },
  "Hong Kong": { lat: 22.3193, lon: 114.1694, country: "Hong Kong", timezone: "Asia/Hong_Kong" },
  "Taipei": { lat: 25.033, lon: 121.5654, country: "Taiwan", timezone: "Asia/Taipei" },
  "London": { lat: 51.5074, lon: -0.1278, country: "UK", timezone: "Europe/London" },
  "Manchester": { lat: 53.4808, lon: -2.2426, country: "UK", timezone: "Europe/London" },
  "Birmingham": { lat: 52.4862, lon: -1.8904, country: "UK", timezone: "Europe/London" },
  "Paris": { lat: 48.8566, lon: 2.3522, country: "France", timezone: "Europe/Paris" },
  "Berlin": { lat: 52.52, lon: 13.405, country: "Germany", timezone: "Europe/Berlin" },
  "Munich": { lat: 48.1351, lon: 11.582, country: "Germany", timezone: "Europe/Berlin" },
  "Frankfurt": { lat: 50.1109, lon: 8.6821, country: "Germany", timezone: "Europe/Berlin" },
  "Rome": { lat: 41.9028, lon: 12.4964, country: "Italy", timezone: "Europe/Rome" },
  "Milan": { lat: 45.4642, lon: 9.19, country: "Italy", timezone: "Europe/Rome" },
  "Madrid": { lat: 40.4168, lon: -3.7038, country: "Spain", timezone: "Europe/Madrid" },
  "Barcelona": { lat: 41.3874, lon: 2.1686, country: "Spain", timezone: "Europe/Madrid" },
  "Amsterdam": { lat: 52.3676, lon: 4.9041, country: "Netherlands", timezone: "Europe/Amsterdam" },
  "Brussels": { lat: 50.8503, lon: 4.3517, country: "Belgium", timezone: "Europe/Brussels" },
  "Vienna": { lat: 48.2082, lon: 16.3738, country: "Austria", timezone: "Europe/Vienna" },
  "Zurich": { lat: 47.3769, lon: 8.5417, country: "Switzerland", timezone: "Europe/Zurich" },
  "Geneva": { lat: 46.2044, lon: 6.1432, country: "Switzerland", timezone: "Europe/Zurich" },
  "Toronto": { lat: 43.6532, lon: -79.3832, country: "Canada", timezone: "America/Toronto" },
  "Vancouver": { lat: 49.2827, lon: -123.1207, country: "Canada", timezone: "America/Vancouver" },
  "Montreal": { lat: 45.5017, lon: -73.5673, country: "Canada", timezone: "America/Toronto" },
  "Calgary": { lat: 51.0447, lon: -114.0719, country: "Canada", timezone: "America/Edmonton" },
  "New York": { lat: 40.7128, lon: -74.006, country: "USA", timezone: "America/New_York" },
  "Los Angeles": { lat: 34.0522, lon: -118.2437, country: "USA", timezone: "America/Los_Angeles" },
  "Chicago": { lat: 41.8781, lon: -87.6298, country: "USA", timezone: "America/Chicago" },
  "Houston": { lat: 29.7604, lon: -95.3698, country: "USA", timezone: "America/Chicago" },
  "Phoenix": { lat: 33.4484, lon: -112.074, country: "USA", timezone: "America/Phoenix" },
  "San Francisco": { lat: 37.7749, lon: -122.4194, country: "USA", timezone: "America/Los_Angeles" },
  "Seattle": { lat: 47.6062, lon: -122.3321, country: "USA", timezone: "America/Los_Angeles" },
  "Miami": { lat: 25.7617, lon: -80.1918, country: "USA", timezone: "America/New_York" },
  "Boston": { lat: 42.3601, lon: -71.0589, country: "USA", timezone: "America/New_York" },
  "Atlanta": { lat: 33.749, lon: -84.388, country: "USA", timezone: "America/New_York" },
  "Washington DC": { lat: 38.9072, lon: -77.0369, country: "USA", timezone: "America/New_York" },
  "Sydney": { lat: -33.8688, lon: 151.2093, country: "Australia", timezone: "Australia/Sydney" },
  "Melbourne": { lat: -37.8136, lon: 144.9631, country: "Australia", timezone: "Australia/Melbourne" },
  "Brisbane": { lat: -27.4698, lon: 153.0251, country: "Australia", timezone: "Australia/Brisbane" },
  "Perth": { lat: -31.9505, lon: 115.8605, country: "Australia", timezone: "Australia/Perth" },
  "Auckland": { lat: -36.8509, lon: 174.7645, country: "New Zealand", timezone: "Pacific/Auckland" },
  "Wellington": { lat: -41.2865, lon: 174.7762, country: "New Zealand", timezone: "Pacific/Auckland" },
  "Cairo": { lat: 30.0444, lon: 31.2357, country: "Egypt", timezone: "Africa/Cairo", method: "Egypt" },
  "Alexandria": { lat: 31.2001, lon: 29.9187, country: "Egypt", timezone: "Africa/Cairo", method: "Egypt" },
  "Giza": { lat: 30.0131, lon: 31.2089, country: "Egypt", timezone: "Africa/Cairo", method: "Egypt" },
  "Istanbul": { lat: 41.0082, lon: 28.9784, country: "Turkey", timezone: "Europe/Istanbul" },
  "Ankara": { lat: 39.9334, lon: 32.8597, country: "Turkey", timezone: "Europe/Istanbul" },
  "Tehran": { lat: 35.6892, lon: 51.389, country: "Iran", timezone: "Asia/Tehran" },
  "Mashhad": { lat: 36.2605, lon: 59.6168, country: "Iran", timezone: "Asia/Tehran" },
  "Isfahan": { lat: 32.6546, lon: 51.668, country: "Iran", timezone: "Asia/Tehran" },
  "Shiraz": { lat: 29.5918, lon: 52.5837, country: "Iran", timezone: "Asia/Tehran" },
  "Baghdad": { lat: 33.3152, lon: 44.3661, country: "Iraq", timezone: "Asia/Baghdad" },
  "Basra": { lat: 30.5085, lon: 47.8134, country: "Iraq", timezone: "Asia/Baghdad" },
  "Amman": { lat: 31.9454, lon: 35.9284, country: "Jordan", timezone: "Asia/Amman" },
  "Beirut": { lat: 33.8938, lon: 35.5018, country: "Lebanon", timezone: "Asia/Beirut" },
  "Damascus": { lat: 33.5138, lon: 36.2765, country: "Syria", timezone: "Asia/Damascus" },
  "Moscow": { lat: 55.7558, lon: 37.6173, country: "Russia", timezone: "Europe/Moscow" },
  "St Petersburg": { lat: 59.9311, lon: 30.3609, country: "Russia", timezone: "Europe/Moscow" },
  "Kiev": { lat: 50.4501, lon: 30.5234, country: "Ukraine", timezone: "Europe/Kiev" },
  "Warsaw": { lat: 52.2297, lon: 21.0122, country: "Poland", timezone: "Europe/Warsaw" },
  "Prague": { lat: 50.0755, lon: 14.4378, country: "Czech Republic", timezone: "Europe/Prague" },
  "Budapest": { lat: 47.4979, lon: 19.0402, country: "Hungary", timezone: "Europe/Budapest" },
  "Athens": { lat: 37.9838, lon: 23.7275, country: "Greece", timezone: "Europe/Athens" },
  "Dushanbe": { lat: 38.5598, lon: 68.7738, country: "Tajikistan", timezone: "Asia/Dushanbe" },
  "Bishkek": { lat: 42.8746, lon: 74.5698, country: "Kyrgyzstan", timezone: "Asia/Bishkek" },
  "Tashkent": { lat: 41.2995, lon: 69.2401, country: "Uzbekistan", timezone: "Asia/Tashkent" },
  "Almaty": { lat: 43.222, lon: 76.8512, country: "Kazakhstan", timezone: "Asia/Almaty" },
  "Astana": { lat: 51.1694, lon: 71.4491, country: "Kazakhstan", timezone: "Asia/Almaty" },
  "Kabul": { lat: 34.5553, lon: 69.2075, country: "Afghanistan", timezone: "Asia/Kabul" },
  "Kandahar": { lat: 31.6089, lon: 65.737, country: "Afghanistan", timezone: "Asia/Kabul" },
  "Herat": { lat: 34.341, lon: 62.2038, country: "Afghanistan", timezone: "Asia/Kabul" },
};

const PAKISTAN_CITIES = ["karachi", "lahore", "islamabad", "peshawar", "quetta", "faisalabad", "multan", "hyderabad", "sialkot", "rawalpindi", "gujranwala", "sukkur", "lahore", " Abbottabad", "karachi"];
const methodByCountry: Record<string, string> = {
  PK: "Karachi",
  SA: "Makkah",
  SAU: "Makkah",
  AE: "Makkah",
  QA: "Makkah",
  KW: "Makkah",
  BH: "Makkah",
  OM: "Makkah",
  EG: "Egypt",
  MY: "Egypt",
  ID: "Egypt",
  BD: "Egypt",
  IN: "ISNA",
  US: "ISNA",
  CA: "ISNA",
  GB: "MWL",
  DE: "MWL",
  FR: "MWL",
  NL: "MWL",
};

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
    month: ((date as any).iMonth() as number) + 1,
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
  let newMoon = Astro.SearchMoonPhase(0, new Date(year, 0, 1), 60);
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

function parseCityName(cityName: string): { lat: number; lon: number; country: string; timezone: string; method?: string } | null {
  if (!cityName) return null;
  const normalized = cityName.trim();
  if (CITY_COORDINATES[normalized]) {
    return CITY_COORDINATES[normalized];
  }
  const lower = normalized.toLowerCase();
  for (const [name, coords] of Object.entries(CITY_COORDINATES)) {
    if (name.toLowerCase() === lower || name.toLowerCase().includes(lower) || lower.includes(name.toLowerCase())) {
      return coords;
    }
  }
  return null;
}

function inferMethod(lat: number, lon: number): string {
  const isPakistan = lat >= 23 && lat <= 37 && lon >= 60 && lon <= 79;
  if (isPakistan) return "Karachi";
  const isSaudiArabia = lat >= 16 && lat <= 32 && lon >= 34 && lon <= 56;
  if (isSaudiArabia) return "Makkah";
  const isEgypt = lat >= 20 && lat <= 32 && lon >= 25 && lon <= 35;
  if (isEgypt) return "Egypt";
  const isGulf = lat >= 10 && lat <= 30 && lon >= 40 && lon <= 60;
  if (isGulf) return "Makkah";
  const isIndonesia = lat >= -10 && lat <= 5 && lon >= 95 && lon <= 141;
  if (isIndonesia) return "Egypt";
  return "MWL";
}

function inferAsrMethod(lat: number, lon: number): "Shafi" | "Hanafi" {
  const isPakistan = lat >= 23 && lat <= 37 && lon >= 60 && lon <= 79;
  if (isPakistan) return "Hanafi";
  const isIndia = lat >= 6 && lat <= 36 && lon >= 68 && lon <= 98;
  if (isIndia) return "Hanafi";
  const isTurkey = lat >= 35 && lat <= 42 && lon >= 26 && lon <= 45;
  if (isTurkey) return "Hanafi";
  const isAfghanistan = lat >= 29 && lat <= 39 && lon >= 60 && lon <= 75;
  if (isAfghanistan) return "Hanafi";
  const isIran = lat >= 25 && lat <= 40 && lon >= 44 && lon <= 64;
  if (isIran) return "Hanafi";
  const isSaudiGulf = lat >= 15 && lat <= 32 && lon >= 34 && lon <= 60;
  if (isSaudiGulf) return "Shafi";
  return "Shafi";
}

function parseDate(dateInput: string | undefined): { date: Date; parsedFrom: string } {
  if (!dateInput) {
    return { date: new Date(), parsedFrom: "today" };
  }
  const input = dateInput.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const parsed = new Date(input + "T12:00:00Z");
    if (!isNaN(parsed.getTime())) {
      return { date: parsed, parsedFrom: `gregorian: ${input}` };
    }
  }
  if (/^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/.test(input)) {
    const parsed = new Date(input + "T12:00:00Z");
    if (!isNaN(parsed.getTime())) {
      return { date: parsed, parsedFrom: `gregorian: ${input}` };
    }
  }
  if (/^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/.test(input)) {
    const parts = input.split(/[\/\-\.]/);
    const y = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    const d = parseInt(parts[2]);
    const year = y < 100 ? (y > 50 ? 1900 + y : 2000 + y) : y;
    const parsed = new Date(Date.UTC(year, m - 1, d, 12, 0, 0));
    if (!isNaN(parsed.getTime())) {
      return { date: parsed, parsedFrom: `gregorian: ${year}-${m}-${d}` };
    }
  }
  const hijriMatch = input.match(/^(\d{1,4})[hH]\s*(\d{1,2})[\/\-\.](\d{1,2})$/);
  if (hijriMatch || input.toLowerCase().includes("ah") || input.toLowerCase().includes("hijri")) {
    const cleanInput = input.replace(/ah|hijri/gi, "").trim();
    if (cleanInput.includes("/") || cleanInput.includes("-") || cleanInput.includes(".")) {
      const parts = cleanInput.split(/[\/\-\.]/).map((p: string) => parseInt(p.trim()));
      if (parts.length === 3) {
        const hYear = parts[0];
        const hMonth = parts[1];
        const hDay = parts[2];
        if (hYear >= 1000 && hMonth >= 1 && hMonth <= 12 && hDay >= 1 && hDay <= 30) {
          const m = moment(`${hYear}-${String(hMonth).padStart(2, "0")}-${String(hDay).padStart(2, "0")}`, "iYYYY-iMM-iDD");
          if (m.isValid()) {
            const gregDate = m.toDate();
            return { date: gregDate, parsedFrom: `hijri: ${hYear} AH, ${hMonth}/${hDay}` };
          }
        }
      }
    }
    for (let hYear = 1400; hYear <= 1500; hYear++) {
      for (let hMonth = 1; hMonth <= 12; hMonth++) {
        const dateStr = `${hYear}-${String(hMonth).padStart(2, "0")}`;
        const m = moment(dateStr + "-01", "iYYYY-iMM-DD");
        if (m.isValid()) {
          const diff = Math.abs(m.format("iMMMM")?.toLowerCase() || "");
          if (input.toLowerCase().includes(diff) || diff.includes(input.toLowerCase())) {
            const day = parseInt(input.replace(/[^\d]/g, "")) || 1;
            const adjusted = moment(`${hYear}-${String(hMonth).padStart(2, "0")}-${Math.min(day, 30)}`, "iYYYY-iMM-iDD");
            if (adjusted.isValid()) {
              return { date: adjusted.toDate(), parsedFrom: `hijri: ${hYear} AH` };
            }
          }
        }
      }
    }
  }
  if (input.toLowerCase() === "today" || input.toLowerCase() === "now") {
    return { date: new Date(), parsedFrom: "today" };
  }
  if (input.toLowerCase() === "yesterday") {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return { date: d, parsedFrom: "yesterday" };
  }
  if (input.toLowerCase() === "tomorrow") {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return { date: d, parsedFrom: "tomorrow" };
  }
  if (input.toLowerCase().includes("ramadan")) {
    const now = moment();
    const currentYear = now.iYear();
    for (let y = -1; y <= 1; y++) {
      for (let m = 1; m <= 12; m++) {
        const testDate = moment(`${currentYear + y}-${m.toString().padStart(2, "0")}-01`, "iYYYY-iMM-DD");
        if (testDate.isValid() && testDate.format("iMMMM")?.toLowerCase().includes("ramadan")) {
          return { date: testDate.toDate(), parsedFrom: `hijri: ${currentYear + y} Ramadan` };
        }
      }
    }
  }
  if (input.toLowerCase().includes("eid")) {
    const now = moment();
    const currentYear = now.iYear();
    const eidMonths = [10, 11, 12];
    for (const m of eidMonths) {
      for (let d = 1; d <= 3; d++) {
        const testDate = moment(`${currentYear}-${m.toString().padStart(2, "0")}-${d}`, "iYYYY-iMM-iDD");
        if (testDate.isValid()) {
          return { date: testDate.toDate(), parsedFrom: `hijri: ${currentYear} AH` };
        }
      }
    }
  }
  try {
    const parsed = new Date(input);
    if (!isNaN(parsed.getTime())) {
      return { date: parsed, parsedFrom: `parsed: ${input}` };
    }
  } catch {}
  return { date: new Date(), parsedFrom: "today (fallback)" };
}

function calculatePrayerTimes(
  latitude: number,
  longitude: number,
  date: Date,
  elevation: number = 0,
  method: string = "MWL",
  asrMethod: "Shafi" | "Hanafi" = "Shafi"
): Record<string, Date> {
  const obs = new Astro.Observer(latitude, longitude, elevation);
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

  const fajrAngle =
    method === "ISNA" ? -15 :
    method === "Egypt" ? -19.5 :
    method === "Makkah" ? -18.5 :
    method === "Karachi" ? -18 :
    -18;

  const ishaAngle =
    method === "ISNA" ? -15 :
    method === "Egypt" ? -17.5 :
    method === "Makkah" ? -19 :
    method === "Karachi" ? -18 :
    -17;

  const fajr = Astro.SearchAltitude(Astro.Body.Sun, obs, 1, dayStart, 1, fajrAngle);
  const sunrise = Astro.SearchAltitude(Astro.Body.Sun, obs, 1, dayStart, 1, -0.833);
  const sunset = Astro.SearchAltitude(Astro.Body.Sun, obs, -1, dayStart, 1, -0.833);
  const dhuhr = new Date((sunrise.date.getTime() + sunset.date.getTime()) / 2);

  const dec = getSunDeclination(dhuhr);
  const latRad = (latitude * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;
  const tanShadow = Math.tan(Math.abs(latRad - decRad));

  let asrAltDeg: number;
  if (asrMethod === "Hanafi") {
    asrAltDeg = (Math.atan(1 / (2 + tanShadow))) * 180 / Math.PI;
  } else {
    asrAltDeg = (Math.atan(1 / (1 + tanShadow))) * 180 / Math.PI;
  }

  const asr = Astro.SearchAltitude(Astro.Body.Sun, obs, -1, dhuhr, 0.5, asrAltDeg);
  const maghrib = sunset;
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

const server = new McpServer({
  name: "date-mcp",
  version: "1.0.0",
});

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

server.tool(
  "get_chinese_date",
  "Get the current Chinese (Lunar) calendar date. Includes the Chinese zodiac animal, element, lunar month and day, and the estimated Chinese New Year for the year.",
  {},
  async () => {
    const now = new Date();
    const year = now.getFullYear();
    const chineseDate = getChineseDateString(now);

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
      `Phase Angle: ${illum.phase_angle.toFixed(2)}°`,
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

server.tool(
  "get_prayer_times",
  "Get Islamic prayer times (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha) for a location and date. Accepts city names (auto-resolved to coordinates), Gregorian dates (YYYY-MM-DD), Hijri dates (e.g. '1445/9/15 AH'), or relative dates ('today', 'tomorrow', 'Ramadan 1'). Auto-detects calculation method (Karachi for Pakistan, Makkah for Gulf, Egypt for Egypt/Indonesia, MWL otherwise) and Asr method (Hanafi for Pakistan/India/Turkey/Afghanistan/Iran, Shafi for others).",
  {
    location: z.string().optional().describe("Location: city name (e.g. 'Karachi', 'Lahore', 'Makkah', 'London') OR latitude,longitude OR leave empty to use coordinates below"),
    latitude: z.number().min(-90).max(90).optional().describe("Latitude (use if location not provided)"),
    longitude: z.number().min(-180).max(180).optional().describe("Longitude (use if location not provided)"),
    date: z.string().optional().describe("Date: YYYY-MM-DD, Hijri like '1445/9/15 AH', 'today', 'tomorrow', 'Ramadan 1', or leave empty for today"),
    method: z.enum(["MWL", "ISNA", "Egypt", "Makkah", "Karachi"]).optional().describe("Calculation method (auto-detected if not provided)"),
    timezone: z.string().optional().describe("IANA timezone (auto-detected from location if not provided)"),
    asr_method: z.enum(["Shafi", "Hanafi"]).optional().describe("Asr calculation: Shafi standard or Hanafi (auto-detected from location)"),
  },
  async ({ location, latitude, longitude, date, method, timezone, asr_method }) => {
    let lat: number;
    let lon: number;
    let locName: string;
    let detectedTimezone: string;
    let detectedMethod: string;
    let detectedAsr: "Shafi" | "Hanafi";

    if (location) {
      const cityData = parseCityName(location);
      if (cityData) {
        lat = cityData.lat;
        lon = cityData.lon;
        locName = location;
        detectedTimezone = cityData.timezone;
        detectedMethod = cityData.method || inferMethod(lat, lon);
        detectedAsr = inferAsrMethod(lat, lon);
      } else if (location.includes(",") || location.match(/^-?\d+\.?\d*,-?\d+\.?\d*$/)) {
        const parts = location.split(",").map((s: string) => s.trim());
        if (parts.length >= 2) {
          lat = parseFloat(parts[0]);
          lon = parseFloat(parts[1]);
          if (isNaN(lat) || isNaN(lon)) {
            return { content: [{ type: "text", text: `Invalid location format. Use city name (e.g., 'Karachi', 'Makkah') or 'latitude,longitude' (e.g., '33.5,73.0')` }] };
          }
        } else {
          return { content: [{ type: "text", text: `Invalid location. Use city name (e.g., 'Karachi', 'Makkah') or 'latitude,longitude'` }] };
        }
        detectedTimezone = timezone || "UTC";
        detectedMethod = method || inferMethod(lat, lon);
        detectedAsr = asr_method ? (asr_method as "Shafi" | "Hanafi") : inferAsrMethod(lat, lon);
        locName = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      } else {
        return { content: [{ type: "text", text: `Unknown city: '${location}'. Please use a recognized city name or provide latitude,longitude coordinates.` }] };
      }
    } else if (latitude !== undefined && longitude !== undefined) {
      lat = latitude;
      lon = longitude;
      detectedTimezone = timezone || "UTC";
      detectedMethod = method || inferMethod(lat, lon);
      detectedAsr = asr_method ? (asr_method as "Shafi" | "Hanafi") : inferAsrMethod(lat, lon);
      locName = `${lat}°, ${lon}°`;
    } else {
      return { content: [{ type: "text", text: `Please provide location (city name or 'latitude,longitude'), or both latitude and longitude coordinates.` }] };
    }

    const { date: targetDate, parsedFrom } = parseDate(date);
    const finalTimezone = timezone || detectedTimezone || "UTC";
    const finalMethod = method || detectedMethod || "MWL";
    const finalAsr = asr_method === "Hanafi" ? "Hanafi" : (asr_method === "Shafi" ? "Shafi" : detectedAsr || "Shafi");

    const prayerTimes = calculatePrayerTimes(lat, lon, targetDate, 0, finalMethod, finalAsr);

    const methodDescriptions: Record<string, string> = {
      MWL: "Muslim World League (Fajr: 18°, Isha: 17°)",
      ISNA: "Islamic Society of North America (Fajr: 15°, Isha: 15°)",
      Egypt: "Egyptian General Authority (Fajr: 19.5°, Isha: 17.5°)",
      Makkah: "Umm al-Qura, Makkah (Fajr: 18.5°, Isha: 19°)",
      Karachi: "University of Islamic Sciences, Karachi (Fajr: 18°, Isha: 18°)",
    };

    const result = [
      `**Islamic Prayer Times**`,
      `Location: ${locName}`,
      `Coordinates: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`,
      `Date: ${formatDate(targetDate, finalTimezone)} (parsed: ${parsedFrom})`,
      `Method: ${finalMethod} — ${methodDescriptions[finalMethod] || "auto-detected"}`,
      `Asr Method: ${finalAsr}`,
      `Timezone: ${finalTimezone}`,
      ``,
      `  Fajr:      ${formatTime(prayerTimes.Fajr, finalTimezone)}`,
      `  Sunrise:   ${formatTime(prayerTimes.Sunrise, finalTimezone)}`,
      `  Dhuhr:     ${formatTime(prayerTimes.Dhuhr, finalTimezone)}`,
      `  Asr:       ${formatTime(prayerTimes.Asr, finalTimezone)} (${finalAsr})`,
      `  Maghrib:   ${formatTime(prayerTimes.Maghrib, finalTimezone)}`,
      `  Isha:      ${formatTime(prayerTimes.Isha, finalTimezone)}`,
    ].join("\n");

    return { content: [{ type: "text", text: result }] };
  }
);

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
      `Right Ascension: ${eq.ra.toFixed(4)} hours (${(eq.ra * 15).toFixed(2)}°)`,
      `Declination: ${eq.dec.toFixed(4)}°`,
      `Ecliptic Longitude: ${sp.elon.toFixed(4)}°`,
      `Distance from Earth: ${eq.dist.toFixed(6)} AU (${(eq.dist * 149597870.7).toFixed(0)} km)`,
      `Observer: ${latitude}°N, ${longitude}°E`,
      `Time (UTC): ${now.toISOString()}`,
    ].join("\n");

    return { content: [{ type: "text", text: result }] };
  }
);

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
        return `  [${e.type}] ${e.name} — ${e.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} (${daysUntil} days away)`;
      }),
    ].join("\n");

    return { content: [{ type: "text", text: result }] };
  }
);

function getHijriMonthFromDate(date: Date): { year: number; month: number; day: number } {
  const now = new Date();
  let newMoon = Astro.SearchMoonPhase(0, new Date(now.getFullYear(), 0, 1), 400);
  const targetTime = date.getTime();
  
  while (newMoon.date.getTime() < targetTime - 30 * 24 * 60 * 60 * 1000) {
    newMoon = Astro.SearchMoonPhase(0, new Date(newMoon.date.getTime() + 25 * 24 * 60 * 60 * 1000), 30);
  }
  
  while (newMoon.date.getTime() < targetTime) {
    newMoon = Astro.SearchMoonPhase(0, new Date(newMoon.date.getTime() + 25 * 24 * 60 * 60 * 1000), 30);
  }
  
  const firstDayOfMuharram = newMoon.date;
  const daysSinceMuharram = Math.floor((targetTime - firstDayOfMuharram.getTime()) / (24 * 60 * 60 * 1000));
  const hijriYear = Math.floor(daysSinceMuharram / 29.53) + 1;
  const daysInYear = daysSinceMuharram % (29.53 * 12);
  const hijriMonth = Math.floor(daysInYear / 29.53) + 1;
  const hijriDay = Math.floor(daysInYear % 29.53) + 1;
  
  return { year: hijriYear, month: hijriMonth, day: hijriDay };
}

function getGregorianFromHijri(hijriYear: number, hijriMonth: number, hijriDay: number, referenceDate: Date): Date {
  const now = new Date();
  let newMoon = Astro.SearchMoonPhase(0, new Date(now.getFullYear() - 1, 0, 1), 400);
  
  const targetDays = (hijriYear - 1) * 354.36 + (hijriMonth - 1) * 29.53 + hijriDay - 1;
  
  while (newMoon.date.getTime() < now.getTime() - 365 * 24 * 60 * 60 * 1000 * 2) {
    newMoon = Astro.SearchMoonPhase(0, new Date(newMoon.date.getTime() + 25 * 24 * 60 * 60 * 1000), 30);
  }
  
  const targetTime = newMoon.date.getTime() + targetDays * 24 * 60 * 60 * 1000;
  return new Date(targetTime);
}

server.tool(
  "get_islamic_events",
  "Get upcoming Islamic events (Eid al-Fitr, Eid al-Adha, Ramadan, Ashura, Laylat al-Qadr, Hijri New Year, etc.) with both Hijri and Gregorian dates calculated using actual moon phases.",
  {
    year: z.number().optional().describe("Hijri year (default: current)"),
  },
  async ({ year }) => {
    const now = new Date();
    const currentHijri = getHijriMonthFromDate(now);
    const hijriYear = year || currentHijri.year;

    const islamicEvents: { name: string; hijriMonth: number; hijriDay: number; description: string }[] = [
      { name: "Hijri New Year (1 Muharram)", hijriMonth: 1, hijriDay: 1, description: "Start of the new Hijri year" },
      { name: "Ashura (10 Muharram)", hijriMonth: 1, hijriDay: 10, description: "Day of remembrance (10th of Muharram)" },
      { name: "Mawlid al-Nabi (12 Rabi al-Awwal)", hijriMonth: 3, hijriDay: 12, description: "Prophet's birthday" },
      { name: "Laylat al-Mi'raj (27 Rajab)", hijriMonth: 7, hijriDay: 27, description: "Night Journey and Ascension" },
      { name: "Laylat al-Qadr (27 Ramadan)", hijriMonth: 9, hijriDay: 27, description: "Night of Power - most likely 27th" },
      { name: "Eid al-Fitr (1 Shawwal)", hijriMonth: 10, hijriDay: 1, description: "Festival of Breaking Fast" },
      { name: "Day of Tarwiyah (8 Dhu al-Hijjah)", hijriMonth: 12, hijriDay: 8, description: "Day of饮水 before Hajj" },
      { name: "Arafat Day (9 Dhu al-Hijjah)", hijriMonth: 12, hijriDay: 9, description: "Day at Arafat" },
      { name: "Eid al-Adha (10 Dhu al-Hijjah)", hijriMonth: 12, hijriDay: 10, description: "Festival of Sacrifice" },
    ];

    const results: string[] = [
      `**Islamic Calendar Events**`,
      `Current Date: ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
      `Current Hijri: ${currentHijri.year} AH, ${HIJRI_MONTH_NAMES[currentHijri.month - 1]} ${currentHijri.day}`,
      ``,
      `Showing Hijri Year ${hijriYear} AH:`,
      ``,
    ];

    for (const evt of islamicEvents) {
      const baseRef = new Date(now.getFullYear(), 6, 1);
      let gregDate = getGregorianFromHijri(hijriYear, evt.hijriMonth, evt.hijriDay, baseRef);
      
      const computedHijri = getHijriMonthFromDate(gregDate);
      
      const isPast = gregDate < now;
      const daysUntil = Math.ceil((gregDate.getTime() - now.getTime()) / 86400000);

      results.push(
        `${isPast ? "✓" : "○"} ${evt.name}`,
        `   Hijri: ${computedHijri.year} AH, ${HIJRI_MONTH_NAMES[computedHijri.month - 1]} ${computedHijri.day}`,
        `   Gregorian: ${gregDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}`,
        `   ${daysUntil < 0 ? Math.abs(daysUntil) + " days ago" : daysUntil === 0 ? "TODAY" : daysUntil + " days away"}`,
        `   ${evt.description}`,
        ``,
      );
    }

    return { content: [{ type: "text", text: results.join("\n") }] };
  }
);

server.tool(
  "get_eid_dates",
  "Get exact dates for Eid al-Fitr and Eid al-Adha for multiple years. Uses astronomical new moon calculations for accurate Hijri-to-Gregorian conversion.",
  {
    year: z.number().optional().describe("Start Gregorian year (default: current)"),
    count: z.number().optional().describe("Number of years to show (default: 3, max: 10)"),
  },
  async ({ year, count }) => {
    const now = new Date();
    const currentYear = year || now.getFullYear();
    const yearCount = Math.min(count || 3, 10);

    const results: string[] = [
      `**Eid Calendar Dates (Astronomically Calculated)**`,
      `Generated: ${now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
      ``,
    ];

    for (let y = currentYear; y < currentYear + yearCount; y++) {
      const summerRef = new Date(y, 6, 1);
      
      const eidFitrGreg = getGregorianFromHijri(y, 10, 1, summerRef);
      const eidFitrHijri = getHijriMonthFromDate(eidFitrGreg);
      
      const eidAdhaGreg = getGregorianFromHijri(y, 12, 10, new Date(y, 11, 1));
      const eidAdhaHijri = getHijriMonthFromDate(eidAdhaGreg);

      results.push(
        `=== ${y} ===`,
        ``,
        `Eid al-Fitr (عيدالفطر):`,
        `   Gregorian: ${eidFitrGreg.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
        `   Hijri: ${eidFitrHijri.year} AH, ${HIJRI_MONTH_NAMES[eidFitrHijri.month - 1]} ${eidFitrHijri.day}`,
        ``,
        `Eid al-Adha (عيدالأضحى):`,
        `   Gregorian: ${eidAdhaGreg.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
        `   Hijri: ${eidAdhaHijri.year} AH, ${HIJRI_MONTH_NAMES[eidAdhaHijri.month - 1]} ${eidAdhaHijri.day}`,
        ``,
      );
    }

    return { content: [{ type: "text", text: results.join("\n") }] };
  }
);

server.tool(
  "get_holidays_worldwide",
  "Get popular holidays and observances worldwide by region/country. Includes religious, cultural, and national holidays.",
  {
    region: z.enum(["all", "middle_east", "europe", "asia", "americas", "oceania"]).default("all"),
    year: z.number().optional().describe("Gregorian year (default: current)"),
  },
  async ({ region, year }) => {
    const currentYear = year || new Date().getFullYear();
    const now = moment();

    const holidays: { name: string; date: string; regions: string[]; type: string }[] = [
      { name: "New Year's Day", date: "01-01", regions: ["all"], type: "Cultural" },
      { name: "Valentine's Day", date: "02-14", regions: ["all", "europe", "americas", "asia"], type: "Cultural" },
      { name: "Nowruz", date: "03-20", regions: ["middle_east", "asia"], type: "Persian New Year" },
      { name: "Holi", date: "03-14", regions: ["asia"], type: "Hindu Festival" },
      { name: "Easter Sunday", date: "04-20", regions: ["europe", "americas", "oceania"], type: "Christian" },
      { name: "Good Friday", date: "04-18", regions: ["europe", "americas", "oceania"], type: "Christian" },
      { name: "Easter Monday", date: "04-21", regions: ["europe"], type: "Christian" },
      { name: "Ramadan Start", date: "03-01", regions: ["middle_east", "asia", "europe"], type: "Islamic" },
      { name: "Eid al-Fitr", date: "04-01", regions: ["middle_east", "asia", "europe", "americas"], type: "Islamic" },
      { name: "Eid al-Adha", date: "06-07", regions: ["middle_east", "asia", "europe", "americas"], type: "Islamic" },
      { name: "Diwali", date: "11-01", regions: ["asia"], type: "Hindu Festival" },
      { name: "Christmas Day", date: "12-25", regions: ["all", "europe", "americas", "oceania"], type: "Christian" },
      { name: "Boxing Day", date: "12-26", regions: ["europe", "oceania"], type: "Cultural" },
      { name: "Independence Day (Pakistan)", date: "08-14", regions: ["middle_east"], type: "National" },
      { name: "National Day (Saudi Arabia)", date: "09-23", regions: ["middle_east"], type: "National" },
      { name: "UAE National Day", date: "12-02", regions: ["middle_east"], type: "National" },
      { name: "Qatar National Day", date: "12-18", regions: ["middle_east"], type: "National" },
      { name: "Bastille Day", date: "07-14", regions: ["europe"], type: "National" },
      { name: "German Unity Day", date: "10-03", regions: ["europe"], type: "National" },
      { name: "Thanksgiving", date: "11-27", regions: ["americas"], type: "Cultural" },
      { name: "Independence Day (US)", date: "07-04", regions: ["americas"], type: "National" },
      { name: "Independence Day (India)", date: "08-15", regions: ["asia"], type: "National" },
      { name: "Australia Day", date: "01-26", regions: ["oceania"], type: "National" },
      { name: "Waitangi Day", date: "02-06", regions: ["oceania"], type: "National" },
      { name: "Chinese New Year", date: "01-29", regions: ["asia"], type: "Cultural" },
      { name: "Songkran", date: "04-13", regions: ["asia"], type: "Cultural" },
      { name: "Thaipusam", date: "01-25", regions: ["asia"], type: "Hindu Festival" },
      { name: "Vaisakhi", date: "04-13", regions: ["asia"], type: "Sikh Festival" },
      { name: "Buddha Purnima", date: "05-23", regions: ["asia"], type: "Buddhist" },
      { name: "Wesak", date: "05-23", regions: ["asia", "oceania"], type: "Buddhist" },
      { name: "Laba Festival", date: "01-15", regions: ["asia"], type: "Cultural" },
      { name: "Lantern Festival", date: "02-12", regions: ["asia"], type: "Cultural" },
      { name: "Day of the Dead", date: "11-02", regions: ["americas"], type: "Cultural" },
      { name: "Daylight Saving Start", date: "03-09", regions: ["americas", "oceania"], type: "Seasonal" },
      { name: "Daylight Saving End", date: "11-02", regions: ["americas", "oceania"], type: "Seasonal" },
    ];

    const selected = region === "all" ? holidays : holidays.filter(h => h.regions.includes("all") || h.regions.includes(region));

    const results: string[] = [
      `**Worldwide Holidays & Events ${currentYear}**`,
      `Region: ${region === "all" ? "All Regions" : region.replace("_", " ").toUpperCase()}`,
      ``,
    ];

    for (const holiday of selected) {
      const [month, day] = holiday.date.split("-").map(Number);
      const date = new Date(currentYear, month - 1, day);
      const isPast = date < now.toDate();
      const daysUntil = Math.ceil((date.getTime() - now.toDate().getTime()) / 86400000);

      results.push(
        `${isPast ? "✓" : "○"} ${holiday.name}`,
        `   Date: ${date.toLocaleDateString("en-US", { month: "long", day: "numeric", weekday: "short" })}`,
        `   Type: ${holiday.type}`,
        `   ${daysUntil < 0 ? Math.abs(daysUntil) + " days ago" : daysUntil === 0 ? "Today!" : daysUntil + " days away"}`,
        ``,
      );
    }

    return { content: [{ type: "text", text: results.join("\n") }] };
  }
);

server.tool(
  "get_ramadan_times",
  "Get Ramadan period (start and end dates) for a specific year with both Hijri and Gregorian dates calculated using astronomical moon phases. Also returns Laylat al-Qadr estimates.",
  {
    year: z.number().optional().describe("Gregorian year (default: current)"),
  },
  async ({ year }) => {
    const now = new Date();
    const currentYear = year || now.getFullYear();
    const currentHijri = getHijriMonthFromDate(now);

    const results: string[] = [
      `**Ramadan Calendar ${currentYear}**`,
      `Current Date: ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
      `Current Hijri: ${currentHijri.year} AH, ${HIJRI_MONTH_NAMES[currentHijri.month - 1]} ${currentHijri.day}`,
      ``,
    ];

    const summerRef = new Date(currentYear, 5, 1);
    
    const ramadanStartGreg = getGregorianFromHijri(currentYear, 9, 1, summerRef);
    const ramadanEndGreg = getGregorianFromHijri(currentYear, 10, 1, new Date(currentYear, 6, 1));
    
    const ramadanStartHijri = getHijriMonthFromDate(ramadanStartGreg);
    const ramadanEndHijri = getHijriMonthFromDate(ramadanEndGreg);

    const laylatQadrPossible = [21, 23, 25, 27, 29];
    const laylatQadrDates = laylatQadrPossible.map(d => 
      getGregorianFromHijri(currentYear, 9, d, summerRef)
    );

    const fastingDays = Math.ceil((ramadanEndGreg.getTime() - ramadanStartGreg.getTime()) / (24 * 60 * 60 * 1000));

    results.push(
      `Ramadan ${ramadanStartHijri.year} AH:`,
      ``,
      ` Start (1 Ramadan):`,
      `   Gregorian: ${ramadanStartGreg.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
      `   Hijri: ${ramadanStartHijri.year} AH, ${HIJRI_MONTH_NAMES[ramadanStartHijri.month - 1]} ${ramadanStartHijri.day}`,
      ``,
      ` End (1 Shawwal - Eid al-Fitr):`,
      `   Gregorian: ${ramadanEndGreg.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
      `   Hijri: ${ramadanEndHijri.year} AH, ${HIJRI_MONTH_NAMES[ramadanEndHijri.month - 1]} ${ramadanEndHijri.day}`,
      ``,
      ` Laylat al-Qadr (Night of Power):`,
      `   Most likely: ${laylatQadrDates[3].toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} (27th night)`,
      `   Could be any odd night: ${laylatQadrDates.map(d => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })).join(", ")}`,
      ``,
      ` Duration: ${fastingDays} days`,
    );

    const daysUntilStart = Math.ceil((ramadanStartGreg.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    if (daysUntilStart > 0) {
      results.push(` ⏳ ${daysUntilStart} days until Ramadan ${ramadanStartHijri.year} AH!`);
    } else if (daysUntilStart > -fastingDays) {
      results.push(` 🕐 Ramadan ${ramadanStartHijri.year} AH is in progress!`);
    } else {
      const nextHijriYear = currentHijri.year + 1;
      const nextRamadan = getGregorianFromHijri(currentYear + 1, 9, 1, summerRef);
      const daysUntilNext = Math.ceil((nextRamadan.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      results.push(` ✓ Last Ramadan was ${ramadanStartGreg.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`);
      results.push(` Next Ramadan: ${daysUntilNext} days away`);
    }

    return { content: [{ type: "text", text: results.join("\n") }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error starting MCP server:", error);
  process.exit(1);
});