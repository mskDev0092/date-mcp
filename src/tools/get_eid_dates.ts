import moment from "moment-hijri";
import { z } from "zod";
import { gregorianToHijri, hijriToGregorian, getHijriMonthName } from "../lib/dates.js";

const toolSchema = {
  year: z.number().optional().describe("Start Gregorian year (default: current)"),
  count: z.number().optional().describe("Years to show (default: 3, max: 10)"),
};

export const description = "Get Eid al-Fitr and Eid al-Adha dates for multiple years (both Hijri & Gregorian)";

export async function execute(params: { year?: number; count?: number }) {
  const now = new Date();
  const currentYear = params.year || now.getFullYear();
  const yearCount = Math.min(params.count || 3, 10);

  const lines = [
    `**Eid Calendar Dates**`,
    `Generated: ${now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    ``,
  ];

  for (let y = currentYear; y < currentYear + yearCount; y++) {
    const eidFitrGreg = hijriToGregorian(y, 10, 1);
    const eidFitrHijri = gregorianToHijri(eidFitrGreg);
    
    const eidAdhaGreg = hijriToGregorian(y, 12, 10);
    const eidAdhaHijri = gregorianToHijri(eidAdhaGreg);

    lines.push(
      `=== ${y} ===`,
      ``,
      `Eid al-Fitr:`,
      `   Gregorian: ${eidFitrGreg.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
      `   Hijri: ${eidFitrHijri.year} AH, ${getHijriMonthName(eidFitrHijri.month)} ${eidFitrHijri.day}`,
      ``,
      `Eid al-Adha:`,
      `   Gregorian: ${eidAdhaGreg.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
      `   Hijri: ${eidAdhaHijri.year} AH, ${getHijriMonthName(eidAdhaHijri.month)} ${eidAdhaHijri.day}`,
      ``,
    );
  }

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };