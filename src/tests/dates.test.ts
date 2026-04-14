import { describe, it, expect } from "bun:test";
import { gregorianToHijri, hijriToGregorian, getHijriYear, getHijriMonthName, gregorianToPersian, getChineseZodiac, getMoonPhaseName } from "../lib/dates";

describe("Date Conversions", () => {
  it("should convert Gregorian to Hijri", () => {
    const date = new Date(2024, 0, 1);
    const hijri = gregorianToHijri(date);
    expect(hijri.year).toBeGreaterThan(1440);
    expect(hijri.month).toBeGreaterThanOrEqual(1);
    expect(hijri.month).toBeLessThanOrEqual(12);
    expect(hijri.day).toBeGreaterThanOrEqual(1);
    expect(hijri.day).toBeLessThanOrEqual(30);
  });

  it("should convert Hijri to Gregorian", () => {
    const greg = hijriToGregorian(1445, 1, 1);
    expect(greg.getTime()).toBeFinite();
    expect(greg.getFullYear()).toBeGreaterThan(2022);
  });

  it("should get current Hijri year", () => {
    const year = getHijriYear();
    expect(year).toBeGreaterThanOrEqual(1445);
  });

  it("should get Hijri month name", () => {
    expect(getHijriMonthName(1)).toBe("Muharram");
    expect(getHijriMonthName(9)).toBe("Ramadan");
    expect(getHijriMonthName(12)).toBe("Dhu al-Hijjah");
  });

  it("should convert Gregorian to Persian", () => {
    const [py, pm, pd] = gregorianToPersian(2024, 6, 14);
    expect(py).toBeGreaterThan(1400);
    expect(pm).toBeGreaterThanOrEqual(1);
    expect(pm).toBeLessThanOrEqual(12);
  });

  it("should get Chinese zodiac", () => {
    const result = getChineseZodiac(2024);
    expect(result).toContain("Dragon");
  });
});

describe("Moon Phase", () => {
  it("should get moon phase name", () => {
    expect(getMoonPhaseName(0)).toBe("Full Moon");
    expect(getMoonPhaseName(180)).toBe("New Moon");
    expect(getMoonPhaseName(90)).toBe("First Quarter");
    expect(getMoonPhaseName(270)).toBe("Last Quarter");
  });
});