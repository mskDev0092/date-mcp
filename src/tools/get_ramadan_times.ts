import moment from "moment-hijri";
import { z } from "zod";

const toolSchema = {
  year: z.number().optional().describe("Gregorian year (default: current)"),
};

export const description = "Get Ramadan dates and Laylat al-Qadr estimates";

export async function execute(params: { year?: number }) {
  const now = new Date();
  const year = params.year || now.getFullYear();
  const currentHijri = { year: moment(now).iYear(), month: moment(now).iMonth() + 1 };

  const lines = [
    `**Ramadan Calendar ${year}**`,
    ``,
  ];

  for (let hYear = currentHijri.year - 1; hYear <= currentHijri.year + 1; hYear++) {
    const ramadanStart = moment(`${hYear}-09-01`, "iYYYY-iMM-DD");
    const ramadanEnd = moment(`${hYear}-10-01`, "iYYYY-iMM-DD");
    
    if (ramadanStart.year() === year || ramadanStart.year() === year - 1 || ramadanStart.year() === year + 1) {
      const startGreg = ramadanStart.toDate();
      const endGreg = ramadanEnd.toDate();
      
      const isPast = startGreg < now;
      const daysUntil = Math.ceil((startGreg.getTime() - now.getTime()) / 86400000);
      const fastingDays = Math.ceil((endGreg.getTime() - startGreg.getTime()) / 86400000);

      lines.push(
        `Ramadan ${ramadanStart.iYear()} AH:`,
        ``,
        ` Start (1 Ramadan):`,
        `   Gregorian: ${ramadanStart.format("dddd, MMMM D, YYYY")}`,
        `   Hijri: ${ramadanStart.format("iMMMM")} ${ramadanStart.iDate()}, ${ramadanStart.iYear()} AH`,
        ``,
        ` End (1 Shawwal - Eid):`,
        `   Gregorian: ${ramadanEnd.format("dddd, MMMM D, YYYY")}`,
        `   Hijri: ${ramadanEnd.format("iMMMM")} ${ramadanEnd.iDate()}, ${ramadanEnd.iYear()} AH`,
        ``,
        `Laylat al-Qadr (Night of Power):`,
        `  Most likely: ${ramadanStart.clone().add(26, "days").format("dddd, MMMM D")} (27th night)`,
        `  Could be any odd night: 21st, 23rd, 25th, 27th, or 29th`,
        ``,
        `Duration: ${fastingDays} days`,
      );

      if (daysUntil > 0) lines.push(` ⏳ ${daysUntil} days until Ramadan!`);
      else if (daysUntil > -fastingDays) lines.push(` 🕐 Ramadan in progress!`);
      else lines.push(` ✓ Last Ramadan: ${ramadanStart.format("MMM D, YYYY")}`);
      
      lines.push(``);
      break;
    }
  }

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };