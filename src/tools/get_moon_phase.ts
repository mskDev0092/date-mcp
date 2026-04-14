import * as Astro from "astronomy-engine";
import { z } from "zod";
import { getMoonPhaseName } from "../lib/dates.js";

const toolSchema = {};

export const description = "Get current moon phase, illumination, and upcoming moon events";

export async function execute() {
  const now = new Date();
  const illum = Astro.Illumination(Astro.Body.Moon, now);
  const phaseName = getMoonPhaseName(illum.phase_angle);
  const illumPercent = ((1 - illum.phase_angle / 180) * 100).toFixed(1);

  const events = [
    { name: "New Moon", lon: 0 },
    { name: "First Quarter", lon: 90 },
    { name: "Full Moon", lon: 180 },
    { name: "Last Quarter", lon: 270 },
  ].map(p => ({ ...p, date: Astro.SearchMoonPhase(p.lon, now, 30).date }))
    .filter(e => e.date > now)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const lines = [
    `**Moon Phase**`,
    `Current: ${phaseName}`,
    `Illumination: ${illumPercent}%`,
    `Phase Angle: ${illum.phase_angle.toFixed(2)}°`,
    `Age: ${((illum.phase_angle / 360) * 29.53).toFixed(1)} days`,
    `Distance: ${(illum.geo_dist * 149597870.7).toFixed(0)} km`,
    ``,
    `**Upcoming:**`,
    ...events.map(e => `  ${e.name}: ${e.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`),
  ];

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };