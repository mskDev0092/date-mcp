import moment from "moment-hijri";
import { z } from "zod";
import { gregorianToHijri, hijriToGregorian, getHijriMonthName, gregorianToPersian, getChineseZodiac } from "../lib/dates.js";

const toolSchema = {
  calendar: z.enum(["gregorian", "hijri"]).describe("Source calendar"),
  year: z.number().describe("Year"),
  month: z.number().min(1).max(12).describe("Month"),
  day: z.number().min(1).max(31).describe("Day"),
};

export const description = "Convert date between calendars (Gregorian <-> Hijri)";

export async function execute(params: { calendar: "gregorian" | "hijri"; year: number; month: number; day: number }) {
  const { calendar, year, month, day } = params;
  
  let date: moment.Moment;
  if (calendar === "gregorian") {
    date = moment([year, month - 1, day]);
  } else {
    date = moment(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`, "iYYYY-iMM-iDD");
  }

  if (!date.isValid()) {
    return { content: [{ type: "text", text: `Invalid ${calendar} date: ${year}-${month}-${day}` }] };
  }

  const hijri = gregorianToHijri(date.toDate());
  const [py, pm, pd] = gregorianToPersian(date.year(), date.month() + 1, date.date());

  const lines = [
    `**Date Conversion**`,
    `Source: ${calendar === "gregorian" ? `${year}-${month}-${day} (Gregorian)` : `${year}/${month}/${day} AH (Hijri)`}`,
    ``,
    `  Gregorian: ${date.format("YYYY-MM-DD")} (${date.format("dddd, MMMM D, YYYY")})`,
    `  Hijri:    ${hijri.year} AH, ${getHijriMonthName(hijri.month)} ${hijri.day}`,
    `  Persian:  ${py}/${pm}/${pd} SH`,
    `  Chinese:  ${getChineseZodiac(date.year())} Year`,
  ];

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };