import * as Astro from "astronomy-engine";
import { z } from "zod";

const toolSchema = {};

export const description = "Get upcoming astronomical events (moon phases, equinoxes, solstices)";

export async function execute() {
  const now = new Date();
  const events: { name: string; date: Date; type: string }[] = [];

  for (const lon of [0, 90, 180, 270]) {
    const r = Astro.SearchMoonPhase(lon, now, 60);
    if (r.date > now) {
      const name = lon === 0 ? "New Moon" : lon === 90 ? "First Quarter" : lon === 180 ? "Full Moon" : "Last Quarter";
      events.push({ name, date: r.date, type: "Moon" });
    }
  }

  const seasons = Astro.Seasons(now.getFullYear());
  const seasonEvents = [
    { name: "March Equinox", date: seasons.mar_equinox },
    { name: "June Solstice", date: seasons.jun_solstice },
    { name: "Sept Equinox", date: seasons.sep_equinox },
    { name: "Dec Solstice", date: seasons.dec_solstice },
  ];
  for (const se of seasonEvents) if (se.date > now) events.push(se);

  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  const lines = [
    `**Upcoming Astronomical Events**`,
    `Showing next ${Math.min(events.length, 10)}:`,
    ``,
    ...events.slice(0, 10).map(e => {
      const days = Math.ceil((e.date.getTime() - now.getTime()) / 86400000);
      return `  [${e.type}] ${e.name} — ${e.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} (${days}d)`;
    }),
  ];

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };