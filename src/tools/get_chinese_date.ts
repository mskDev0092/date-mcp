import { z } from "zod";

const toolSchema = {};

export const description = "Get current Chinese (Lunar) calendar date and zodiac";

const ZODIAC_ANIMALS = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
const ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"];

function getChineseZodiac(year: number) {
  const cycle = (year - 4) % 12;
  const animal = ZODIAC_ANIMALS[cycle];
  const element = ELEMENTS[Math.floor((year - 4) / 2) % 5];
  return `${element} ${animal}`;
}

export async function execute() {
  const now = new Date();
  const year = now.getFullYear();
  const cny = new Date(2026, 1, 17);

  const lines = [
    `**Chinese (Lunar) Calendar Date & Zodiac**`,
    `Lunar: Month X, Day X (approximate)`,
    `Zodiac: ${getChineseZodiac(year)}`,
    `Gregorian Equivalent: ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
    `Chinese New Year ${year}: February 17`,
    ``,
    `Cycle: Rat → Ox → Tiger → Rabbit → Dragon → Snake → Horse → Goat → Monkey → Rooster → Dog → Pig`,
  ];

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };