import { z } from "zod";

const toolSchema = {};

export const description = "Get current Chinese (Lunar) calendar date and zodiac";

const ZODIAC_ANIMALS = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
const ELEMENTS = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"];

function getChineseDateString(date: Date): { month: number; day: number; zodiac: string; cnY: Date } {
  const year = date.getFullYear();
  const cnyDate = getChineseNewYear(year);
  const diffDays = Math.floor((date.getTime() - cnyDate.getTime()) / 86400000);
  
  if (diffDays < 0) {
    return getChineseDateString(new Date(year - 1, 11, 31));
  }
  
  const lunarMonth = Math.floor(diffDays / 29.53) + 1;
  const lunarDay = (diffDays % 29) + 1;
  const stemBranch = getStemBranch(year);
  
  return {
    month: lunarMonth,
    day: lunarDay,
    zodiac: `${ELEMENTS[stemBranch]} ${ZODIAC_ANIMALS[stemBranch % 12]}`,
    cnY: cnyDate,
  };
}

function getChineseNewYear(gregorianYear: number): Date {
  const candidates = [
    new Date(gregorianYear, 0, 21),
    new Date(gregorianYear, 0, 22),
    new Date(gregorianYear, 1, 4),
    new Date(gregorianYear, 1, 8),
    new Date(gregorianYear, 1, 19),
  ];
  
  let minDiff = Infinity;
  let cny = candidates[0];
  
  for (const d of candidates) {
    const moonAge = Math.abs(calculateMoonAge(d));
    if (moonAge < minDiff) {
      minDiff = moonAge;
      cny = d;
    }
  }
  
  return cny;
}

function calculateMoonAge(date: Date): number {
  const synodic = 29.530588853;
  const knownNew = new Date(2000, 0, 6, 18, 14);
  const days = (date.getTime() - knownNew.getTime()) / 86400000;
  return days % synodic;
}

function getStemBranch(year: number): number {
  const animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
  const elements = ["Metal", "Metal", "Water", "Water", "Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal"];
  
  const branch = (year - 1900) % 12;
  const stem = Math.floor((year - 1900) / 10) % 10;
  
  return stem;
}

export async function execute() {
  const now = new Date();
  const chinese = getChineseDateString(now);
  const year = now.getFullYear();

  const lines = [
    `**Chinese (Lunar) Calendar**`,
    `Lunar: Month ${chinese.month}, Day ${chinese.day}`,
    `Zodiac: ${chinese.zodiac}`,
    `Gregorian: ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
    `Chinese New Year ${year}: ${chinese.cnY.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
    ``,
    `Cycle: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig`,
    `Previous Years:`,
    `  2024: Wood Dragon | 2025: Wood Snake | 2026: Fire Horse`,
  ];

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };