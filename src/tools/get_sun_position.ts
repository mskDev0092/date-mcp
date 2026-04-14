import * as Astro from "astronomy-engine";
import { z } from "zod";

const toolSchema = {};

export const description = "Get current sun position (right ascension, declination, distance)";

export async function execute() {
  const now = new Date();
  const sp = Astro.SunPosition(now);
  const sv = Astro.GeoVector(Astro.Body.Sun, now, true);
  const eq = Astro.EquatorFromVector(sv);

  const lines = [
    `**Sun Position**`,
    `Right Ascension: ${eq.ra.toFixed(4)}h (${(eq.ra * 15).toFixed(2)}°)`,
    `Declination: ${eq.dec.toFixed(4)}°`,
    `Ecliptic Longitude: ${sp.elon.toFixed(4)}°`,
    `Distance: ${eq.dist.toFixed(6)} AU (${(eq.dist * 149597870.7).toFixed(0)} km)`,
    `Time (UTC): ${now.toISOString()}`,
  ];

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };