import moment from "moment-hijri";
import { z } from "zod";

const toolSchema = {
  locale: z.enum(["en", "ar"]).describe("Output locale: 'en' English or 'ar' Arabic").default("en"),
};

export const description = "Get current Hijri/Islamic calendar date";

const HIJRI_WEEKDAYS = [
  "Yaum al-Ahad (Sunday)", "Yaum al-Ithnayn (Monday)", "Yaum ath-Thulatha (Tuesday)",
  "Yaum al-Arba'a (Wednesday)", "Yaum al-Khamis (Thursday)", "Yaum al-Jumu'a (Friday)",
  "Yaum as-Sabt (Saturday)",
];

const HIJRI_MONTH_NAMES = [
  "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
  "Jumada al-Ula", "Jumada al-Thania", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
];

export async function execute(params: { locale?: "en" | "ar" }) {
  const now = moment();
  const hijri = { year: now.iYear(), month: now.iMonth() + 1, day: now.iDate() };
  const dayOfWeek = now.day();

  const result = [
    `**Hijri (Islamic) Calendar Date**`,
    `Hijri Date: ${hijri.year}/${String(hijri.month).padStart(2, "0")}/${String(hijri.day).padStart(2, "0")}`,
    `Day: ${hijri.day}`,
    `Month: ${HIJRI_MONTH_NAMES[hijri.month - 1]} (${hijri.month})`,
    `Year: ${hijri.year} AH`,
    `Day of Week: ${HIJRI_WEEKDAYS[dayOfWeek]}`,
    `Gregorian Equivalent: ${now.format("dddd, YYYY-MM-DD")}`,
    `Locale: ${params.locale === "ar" ? "Arabic" : "English"}`,
  ].join("\n");

  return { content: [{ type: "text", text: result }] };
}

export { toolSchema as schema };