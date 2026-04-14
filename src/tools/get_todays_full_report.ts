import { z } from "zod";
import moment from "moment-hijri";
import * as Astro from "astronomy-engine";
import { gregorianToPersian, getMoonPhaseName as getLibMoonPhaseName } from "../lib/dates.js";

const toolSchema = {};

export const description = "Generate the complete daily multi-calendar report";

const ZODIAC_ANIMALS = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
const ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"];

function getChineseZodiac(year: number) {
  const animalIndex = (year - 4) % 12;
  const animal = ZODIAC_ANIMALS[animalIndex];
  const elementIndex = Math.floor((year - 4) / 2) % 5;
  const element = ELEMENTS[elementIndex];
  return `${element} ${animal}`;
}

function getMoonPhaseNameFromAstro(phaseAngle: number): string {
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
  const m = moment(now);
  const hijri = { year: m.iYear(), month: m.iMonth() + 1, day: m.iDate() };
  
  const [py, pm, pd] = gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const PERSIAN_WEEKDAYS = ["Yekshanbeh", "Doshanbeh", "Seshanbeh", "Chaharshanbeh", "Panjshanbeh", "Jomeh", "Shanbeh"];
  
  const illum = Astro.Illumination(Astro.Body.Moon, now);
  const phaseAngle = illum.phase_angle % 360;
  const phaseName = getMoonPhaseNameFromAstro(phaseAngle);
  const illumPercent = Math.round(illum.illumination * 10) / 10;
  
  const events = [0, 90, 180, 270].map(lon => {
    const r = Astro.SearchMoonPhase(lon, now, 60);
    const name = lon === 0 ? "New Moon" : lon === 90 ? "First Quarter" : lon === 180 ? "Full Moon" : "Last Quarter";
    return { name, date: r.date };
  }).filter(e => e.date > now).sort((a, b) => a.date.getTime() - b.date.getTime());

  const lines = [
    `**Today's Full Calendar Report**`,
    `Based on: ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
    `---`,
    `### Gregorian`,
    `Date: ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
    `Time: ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`,
    `---`,
    `### Hijri`,
    `Hijri: ${hijri.year}/${String(hijri.month).padStart(2, "0")}/${String(hijri.day).padStart(2, "0")} (${m.format("iMMMM")} ${hijri.day}, ${hijri.year} AH)`,
    `---`,
    `### Persian (Jalali)`,
    `${py}/${String(pm).padStart(2, "0")}/${String(pd).padStart(2, "0")} → ${PERSIAN_WEEKDAYS[now.getDay()]}, ${pd} Farvardin ${py} SH`,
    `---`,
    `### Chinese Zodiac`,
    `Year: ${getChineseZodiac(now.getFullYear())}`,
    `---`,
    `### Moon Phase`,
    `Current: ${phaseName} (${illumPercent}%)`,
    `---`,
    `### Upcoming`,
    `New Moon: ${events[0]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    `First Quarter: ${events[1]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    `Full Moon: ${events[2]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    `Last Quarter: ${events[3]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
  ];

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };