import { z } from "zod";

const toolSchema = {};

export const description = "Get current Chinese (Lunar) calendar date and zodiac";

const ZODIAC_ANIMALS = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
const ELEMENTS = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"];

function getChineseZodiac(year: number) {
  const cycle = (year - 4) % 12;
  const animal = ZODIAC_ANIMALS[cycle];
  const elementIndex = (Math.floor((year - 4) / 2) % 5) * 2;
  const element = ELEMENTS[elementIndex];
  return `${element} ${animal}`;
}

function getChineseNewYear(gregorianYear: number): Date {
  const candidates = [
    new Date(gregorianYear, 1, 17),
    new Date(gregorianYear, 1, 18),
    new Date(gregorianYear, 1, 19),
  ];
  return candidates[0];
}

export async function execute() {
  const now = new Date();
  const year = now.getFullYear();
  const cny = getChineseNewYear(year);

  const lines = [
    `**Chinese (Lunar) Calendar Date**`,
    `Zodiac: ${getChineseZodiac(year)}`,
    `Gregorian: ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
    `Chinese New Year ${year}: ${cny.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
    ``,
    `Cycle: Rat → Ox → Tiger → Rabbit → Dragon → Snake → Horse → Goat → Monkey → Rooster → Dog → Pig`,
    `Previous Years:`,
    `  2024: Wood Dragon | 2025: Wood Snake | 2026: Fire Horse`,
  ];

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };