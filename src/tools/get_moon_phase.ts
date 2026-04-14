import * as Astro from "astronomy-engine";
import { z } from "zod";

const toolSchema = {};

export const description = "Get current moon phase, illumination, age, and upcoming events";

function getMoonPhaseName(phaseAngle: number): string {
  const pa = ((phaseAngle % 360) + 360) % 360;

  if (pa < 22.5 || pa > 337.5) return "Full Moon";
  if (pa < 67.5) return "Waning Gibbous";
  if (pa < 112.5) return "Last Quarter";
  if (pa < 157.5) return "Waning Crescent";
  if (pa < 202.5) return "New Moon";
  if (pa < 247.5) return "Waxing Crescent";
  if (pa < 292.5) return "First Quarter";
  return "Waxing Gibbous";
}

export async function execute() {
  const now = new Date();
  const illum = Astro.Illumination(Astro.Body.Moon, now);
  const phaseAngle = illum.phase_angle % 360;
  const illumPercent = Math.round(illum.illumination * 10) / 10;
  const age = ((phaseAngle / 360) * 29.53059).toFixed(1);

  const phaseName = getMoonPhaseName(phaseAngle);

  const events = [0, 90, 180, 270].map(lon => {
    const r = Astro.SearchMoonPhase(lon, now, 60);
    const name = lon === 0 ? "New Moon" : lon === 90 ? "First Quarter" : lon === 180 ? "Full Moon" : "Last Quarter";
    return { name, date: r.date };
  }).filter(e => e.date > now).sort((a, b) => a.date.getTime() - b.date.getTime());

  const lines = [
    `**Current Moon Phase & Upcoming Events**`,
    `| Item | Details |`,
    `|------|---------|`,
    `| **Current Phase** | ${phaseName} |`,
    `| **Illumination** | ${illumPercent}% |`,
    `| **Age** | ${age} days |`,
    `| **Upcoming New Moon** | ${events[0]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} |`,
    `| **First Quarter** | ${events[1]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} |`,
    `| **Full Moon** | ${events[2]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} |`,
    `| **Last Quarter** | ${events[3]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} |`,
  ];

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };