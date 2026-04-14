import moment from "moment-hijri";
import { z } from "zod";

const toolSchema = { year: z.number().optional() };

export const description = "Get Ramadan dates and Laylat al-Qadr";

export async function execute(params: { year?: number }) {
  const now = new Date();
  const year = params.year || now.getFullYear();
  const currentHijriYear = moment().iYear();

  const lines = [`**Ramadan Calendar**`, ``];

  for (let offset = -1; offset <= 1; offset++) {
    const hYear = currentHijriYear + offset;
    const ramadanStart = moment(`${hYear}-09-01`, "iYYYY-iMM-iDD");
    const ramadanEnd = moment(`${hYear}-10-01`, "iYYYY-iMM-iDD");

    if (ramadanStart.year() === year || ramadanStart.year() === year - 1 || ramadanStart.year() === year + 1) {
      lines.push(
        `Ramadan ${hYear} AH`,
        ` Start (1 Ramadan): ${ramadanStart.format("dddd, MMMM D, YYYY")}`,
        ` End (Eid al-Fitr): ${ramadanEnd.format("dddd, MMMM D, YYYY")}`,
        `Laylat al-Qadr: most likely ${ramadanStart.clone().add(26, "days").format("dddd, MMMM D")} (27th night)`,
        ``
      );
      break;
    }
  }

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };