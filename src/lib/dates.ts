import moment from "moment-hijri";
import * as Astro from "astronomy-engine";

const HIJRI_MONTH_NAMES = [
  "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
  "Jumada al-Ula", "Jumada al-Thania", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
];

function getHijriDateParts(date: moment.Moment): { year: number; month: number; day: number } {
  return {
    year: (date as any).iYear() as number,
    month: ((date as any).iMonth() as number) + 1,
    day: (date as any).iDate() as number,
  };
}

export function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  return getHijriDateParts(moment(date));
}

export function hijriToGregorian(hijriYear: number, hijriMonth: number, hijriDay: number): Date {
  const m = moment(
    `${hijriYear}-${String(hijriMonth).padStart(2, "0")}-${String(hijriDay).padStart(2, "0")}`,
    "iYYYY-iMM-iDD"
  );
  return m.toDate();
}

export function getHijriYear(): number {
  return moment().iYear();
}

export function getHijriMonthName(month: number): string {
  return HIJRI_MONTH_NAMES[month - 1] || "";
}

export function gregorianToPersian(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100)
    + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

export function getChineseZodiac(year: number): string {
  const animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
  const elements = ["Metal", "Water", "Wood", "Fire", "Earth"];
  const branch = ((year - 4) % 12 + 12) % 12;
  const elementIndex = Math.floor((year - 4) / 2) % 5;
  return `${elements[elementIndex]} ${animals[branch]}`;
}

export function getMoonPhaseName(phaseAngle: number): string {
  if (phaseAngle < 22.5 || phaseAngle >= 337.5) return "Full Moon";
  if (phaseAngle < 67.5) return "Waxing Gibbous";
  if (phaseAngle < 112.5) return "First Quarter";
  if (phaseAngle < 157.5) return "Waxing Crescent";
  if (phaseAngle < 202.5) return "New Moon";
  if (phaseAngle < 247.5) return "Waning Crescent";
  if (phaseAngle < 292.5) return "Last Quarter";
  return "Waning Gibbous";
}