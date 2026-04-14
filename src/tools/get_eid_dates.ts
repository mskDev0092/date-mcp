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
    `**Eid Calendar Dates**`,
    `Generated: ${now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    ``,
  ];

  for (let y = currentYear; y < currentYear + yearCount; y++) {
    const eidFitr = moment(`${y}-10-01`, "iYYYY-iMM-DD");
    const eidAdha = moment(`${y}-12-10`, "iYYYY-iMM-DD");
    
    const eidFitrGreg = eidFitr.toDate();
    const eidAdhaGreg = eidAdha.toDate();

    const eFYear = eidFitr.iYear();
    const eAMonth = eidFitr.iMonth();
    const eADay = eidFitr.iDate();
    
    const aHYear = eidAdha.iYear();
    const aAMonth = eidAdha.iMonth();
    const aADay = eidAdha.iDate();

    lines.push(
      `=== ${y} ===`,
      ``,
      `Eid al-Fitr (عيدالفطر):`,
      `   Gregorian: ${eidFitr.format("dddd, MMMM D, YYYY")}`,
      `   Hijri: ${eFYear} AH, ${eidFitr.format("iMMMM")} ${eADay}`,
      ``,
      `Eid al-Adha (عيدالأضحى):`,
      `   Gregorian: ${eidAdha.format("dddd, MMMM D, YYYY")}`,
      `   Hijri: ${aHYear} AH, ${eidAdha.format("iMMMM")} ${aADay}`,
      ``,
    );
  }

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };