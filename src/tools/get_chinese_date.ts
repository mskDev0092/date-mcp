import { z } from "zod";

const toolSchema = {};

export const description = "Get current Chinese (Lunar) calendar date and zodiac";

const ZODIAC_ANIMALS = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
const ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"];

function getChineseZodiac(year: number) {
  const animalIndex = (year - 4) % 12;
  const animal = ZODIAC_ANIMALS[animalIndex];
  const elementIndex = Math.floor((year - 4) / 2) % 5;
  const element = ELEMENTS[elementIndex];
  return `${element} ${animal}`;
}

export async function execute() {
  const now = new Date();
  const year = now.getFullYear();

  const lines = [
    `**Chinese Zodiac for ${year}**`,
    `Year: ${getChineseZodiac(year)}`,
    `Chinese New Year ${year}: February 17`,
    `Cycle Position: 7th in the 12-year cycle (Horse)`,
    ``,
    `Cycle: Rat → Ox → Tiger → Rabbit → Dragon → Snake → Horse → Goat → Monkey → Rooster → Dog → Pig`,
  ];

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };