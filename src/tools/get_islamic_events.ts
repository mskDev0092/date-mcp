import moment from "moment-hijri";
import { z } from "zod";

const toolSchema = {
  year: z.number().optional().describe("Hijri year (default: current)"),
};

export const description = "Get Islamic events (Eid, Ramadan, Ashura, etc.) with Hijri & Gregorian dates";

const ISLAMIC_EVENTS = [
  { name: "Hijri New Year", hMonth: 1, hDay: 1, desc: "Start of new Hijri year" },
  { name: "Ashura", hMonth: 1, hDay: 10, desc: "Day of remembrance" },
  { name: "Mawlid al-Nabi", hMonth: 3, hDay: 12, desc: "Prophet's birthday" },
  { name: "Laylat al-Mi'raj", hMonth: 7, hDay: 27, desc: "Night Journey" },
  { name: "Laylat al-Qadr", hMonth: 9, hDay: 27, desc: "Night of Power" },
  { name: "Eid al-Fitr", hMonth: 10, hDay: 1, desc: "Festival of Breaking Fast" },
  { name: "Day of Tarwiyah", hMonth: 12, hDay: 8, desc: "Before Hajj" },
  { name: "Arafat Day", hMonth: 12, hDay: 9, desc: "Day at Arafat" },
  { name: "Eid al-Adha", hMonth: 12, hDay: 10, desc: "Festival of Sacrifice" },
];

export async function execute(params: { year?: number }) {
  const now = new Date();
  const m = moment(now);
  const currentHijri = { year: m.iYear(), month: m.iMonth() + 1, day: m.iDate() };
  const hijriYear = params.year || currentHijri.year;

  const lines = [
    `**Islamic Calendar Events**`,
    `Current: ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
    `Current Hijri: ${currentHijri.year} AH, ${m.format("iMMMM")} ${currentHijri.day}`,
    ``,
    `Hijri Year ${hijriYear} AH:`,
    ``,
  ];

  for (const evt of ISLAMIC_EVENTS) {
    const hijriDate = moment(`${hijriYear}-${evt.hMonth.toString().padStart(2, "0")}-${evt.hDay.toString().padStart(2, "0")}`, "iYYYY-iMM-iDD");
    const gregDate = hijriDate.toDate();
    const isPast = gregDate < now;
    const daysUntil = Math.ceil((gregDate.getTime() - now.getTime()) / 86400000);

    lines.push(
      `${isPast ? "✓" : "○"} ${evt.name}`,
      `   Hijri: ${hijriDate.format("iYYYY")} AH, ${hijriDate.format("iMMMM")} ${hijriDate.format("iDD")}`,
      `   Gregorian: ${hijriDate.format("dddd, MMMM D, YYYY")}`,
      `   ${daysUntil < 0 ? Math.abs(daysUntil) + " days ago" : daysUntil === 0 ? "TODAY!" : daysUntil + " days away"}`,
      ``,
    );
  }

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };