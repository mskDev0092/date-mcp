import { describe, it, expect } from "bun:test";
import { calculatePrayerTimes, formatPrayerTime } from "../lib/prayer";

describe("Prayer Times", () => {
  const lat = 33.5;
  const lon = 73.0;
  const date = new Date();

  it("should calculate prayer times", () => {
    const prayers = calculatePrayerTimes(lat, lon, date, "MWL", "Hanafi");
    expect(prayers.Fajr.getTime()).toBeFinite();
    expect(prayers.Sunrise.getTime()).toBeFinite();
    expect(prayers.Dhuhr.getTime()).toBeFinite();
    expect(prayers.Asr.getTime()).toBeFinite();
    expect(prayers.Maghrib.getTime()).toBeFinite();
    expect(prayers.Isha.getTime()).toBeFinite();
  });

  it("should have valid times", () => {
    const prayers = calculatePrayerTimes(lat, lon, date);
    expect(prayers.Fajr.getTime()).toBeGreaterThan(0);
    expect(prayers.Sunrise.getTime()).toBeGreaterThan(0);
    expect(prayers.Dhuhr.getTime()).toBeGreaterThan(0);
    expect(prayers.Asr.getTime()).toBeGreaterThan(0);
    expect(prayers.Maghrib.getTime()).toBeGreaterThan(0);
    expect(prayers.Isha.getTime()).toBeGreaterThan(0);
  });

  it("should format time", () => {
    const time = new Date(2024, 0, 1, 5, 30, 45);
    const formatted = formatPrayerTime(time, "UTC");
    expect(formatted).toContain(":30");
    expect(formatted).toContain(":45");
  });
});