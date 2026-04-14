import moment from "moment-hijri";
import { z } from "zod";

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
    `**Eid Calendar Dates (predicted — subject to moon sighting)**`,
    ``,
  ];

  for (let y = currentYear; y < currentYear + yearCount; y++) {
    const hijriBase = moment().iYear();
    const offset = y - now.getFullYear();

    const fitrHijri = moment(`${hijriBase + offset}-10-01`, "iYYYY-iMM-iDD");
    const adhaHijri = moment(`${hijriBase + offset}-12-10`, "iYYYY-iMM-iDD");

    lines.push(
      `=== ${y} ===`,
      `Eid al-Fitr: ${fitrHijri.format("dddd, MMMM D, YYYY")} (1 Shawwal ${fitrHijri.iYear()} AH)`,
      `Eid al-Adha: ${adhaHijri.format("dddd, MMMM D, YYYY")} (10 Dhu al-Hijjah ${adhaHijri.iYear()} AH)`,
      ``,
    );
  }

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };