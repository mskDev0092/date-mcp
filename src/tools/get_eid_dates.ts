import moment from "moment-hijri";
import { z } from "zod";

const toolSchema = { year: z.number().optional(), count: z.number().optional() };

export const description = "Get Eid al-Fitr and Eid al-Adha dates";

export async function execute(params: { year?: number; count?: number }) {
  const now = new Date();
  const currentYear = params.year || now.getFullYear();
  const yearCount = Math.min(params.count || 3, 10);
  const currentHijriYear = moment().iYear();

  const lines = [`**Eid Calendar Dates (predicted — subject to moon sighting)**`, ``];

  for (let i = 0; i < yearCount; i++) {
    const y = currentYear + i;
    const offset = y - currentYear;
    const hijriYear = currentHijriYear + offset;

    const fitr = moment(`${hijriYear}-10-01`, "iYYYY-iMM-iDD");
    const adha = moment(`${hijriYear}-12-10`, "iYYYY-iMM-iDD");

    lines.push(
      `=== ${y} ===`,
      `Eid al-Fitr : ${fitr.format("dddd, MMMM D, YYYY")} (1 Shawwal ${fitr.iYear()} AH)`,
      `Eid al-Adha : ${adha.format("dddd, MMMM D, YYYY")} (10 Dhu al-Hijjah ${adha.iYear()} AH)`,
      ``
    );
  }

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };