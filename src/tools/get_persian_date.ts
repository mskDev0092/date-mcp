import { z } from "zod";
import { gregorianToPersian } from "../lib/dates.js";

const toolSchema = {};

export const description = "Get current Persian/Solar Hijri (Jalali) calendar date";

const PERSIAN_MONTHS = [
  "Farvardin", "Ordibehesht", "Khordad", "Tir",
  "Mordad", "Shahrivar", "Mehr", "Aban",
  "Azar", "Dey", "Bahman", "Esfand",
];

export async function execute() {
  const now = new Date();
  const [py, pm, pd] = gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const PERSIAN_WEEKDAYS = ["Yekshanbeh", "Doshanbeh", "Seshanbeh", "Chaharshanbeh", "Panjshanbeh", "Jomeh", "Shanbeh"];

  const lines = [
    `**Persian (Jalali) Calendar Date**`,
    `Date: ${py}/${String(pm).padStart(2, "0")}/${String(pd).padStart(2, "0")}`,
    `Format: ${PERSIAN_WEEKDAYS[now.getDay()]}, ${pd} ${PERSIAN_MONTHS[pm - 1]} ${py} SH`,
    `Gregorian Equivalent: ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
    ``,
    `Nowruz (Persian New Year): March 20-21 (spring equinox)`,
  ];

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };