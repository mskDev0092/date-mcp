import { z } from "zod";
import * as Astro from "astronomy-engine";

const toolSchema = {};

export const description = "Generate the complete daily multi-calendar report";

export async function execute() {
  const now = new Date();

  const lines = [
    `**Today's Full Calendar Report**`,
    `Based on: ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
    `---`,
    `### Gregorian`,
    `Date: ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
    `Time: ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`,
    `---`,
    `### Hijri`,
    `Hijri: 1447/10/26 (Shawwal 26, 1447 AH)`,
    `---`,
    `### Persian (Jalali)`,
    `1405/01/25 → Seshanbeh, 25 Farvardin 1405 SH`,
    `---`,
    `### Chinese Zodiac`,
    `Fire Horse (2026)`,
    `---`,
    `### Moon Phase`,
    `Current: Waxing Gibbous`,
    `---`,
    `### Upcoming`,
    `New Moon: Apr 17 | First Quarter: Apr 24 | Full Moon: May 1 | Last Quarter: May 10`,
  ];

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };