import { z } from "zod";
import { parseLocation, inferMethod, inferAsrMethod } from "../lib/geo.js";
import { calculatePrayerTimes, formatPrayerTime } from "../lib/prayer.js";

const toolSchema = {
  location: z.string().optional().describe("City name or lat,lon"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  date: z.string().optional().describe("YYYY-MM-DD or 'today'"),
  method: z.enum(["MWL", "ISNA", "Egypt", "Makkah", "Karachi"]).optional(),
  timezone: z.string().optional(),
  asr_method: z.enum(["Shafi", "Hanafi"]).optional(),
};

export const description = "Get Islamic prayer times (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha) for a location";

const METHOD_DESCS: Record<string, string> = {
  MWL: "Muslim World League (Fajr: 18°, Isha: 17°)",
  ISNA: "Islamic Society of NA (Fajr: 15°, Isha: 15°)",
  Egypt: "Egyptian Authority (Fajr: 19.5°, Isha: 17.5°)",
  Makkah: "Umm al-Qura (Fajr: 18.5°, Isha: 19°)",
  Karachi: "Uni of Islamic Sciences (Fajr: 18°, Isha: 18°)",
};

export async function execute(params: {
  location?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
  method?: string;
  timezone?: string;
  asr_method?: string;
}) {
  let lat: number, lon: number, tz: string, method: string, asr: "Shafi" | "Hanafi";

  if (!params.location && !params.latitude && !params.longitude) {
    params.location = "Makkah";
  }

  if (params.location) {
    const loc = parseLocation(params.location);
    if (!loc) return { content: [{ type: "text", text: `Unknown location: ${params.location}` }] };
    lat = loc.lat; lon = loc.lon; tz = loc.timezone;
    method = params.method || loc.method || inferMethod(lat, lon);
    asr = (params.asr_method as "Shafi" | "Hanafi") || inferAsrMethod(lat, lon);
  } else if (params.latitude !== undefined && params.longitude !== undefined) {
    lat = params.latitude; lon = params.longitude;
    tz = params.timezone || "UTC";
    method = params.method || inferMethod(lat, lon);
    asr = (params.asr_method as "Shafi" | "Hanafi") || inferAsrMethod(lat, lon);
  } else {
    return { content: [{ type: "text", text: "Provide location (city name or lat,lon) or latitude+longitude" }] };
  }

  const targetDate = params.date && params.date !== "today"
    ? new Date(params.date + "T12:00:00Z")
    : new Date();

  const prayers = calculatePrayerTimes(lat, lon, targetDate, method, asr);
  tz = tz || params.timezone || "UTC";

  const lines = [
    `**Prayer Times**`,
    `Location: ${params.location || `${lat}°, ${lon}°`}`,
    `Coordinates: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`,
    `Date: ${targetDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
    `Method: ${method} — ${METHOD_DESCS[method]}`,
    `Asr: ${asr}`,
    `Timezone: ${tz}`,
    ``,
    `  Fajr:    ${formatPrayerTime(prayers.Fajr, tz)}`,
    `  Sunrise: ${formatPrayerTime(prayers.Sunrise, tz)}`,
    `  Dhuhr:   ${formatPrayerTime(prayers.Dhuhr, tz)}`,
    `  Asr:    ${formatPrayerTime(prayers.Asr, tz)} (${asr})`,
    `  Maghrib: ${formatPrayerTime(prayers.Maghrib, tz)}`,
    `  Isha:    ${formatPrayerTime(prayers.Isha, tz)}`,
  ];

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };