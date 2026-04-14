import { describe, it, expect } from "bun:test";
import { execute as getEidDates } from "../tools/get_eid_dates";
import { execute as getIslamicEvents } from "../tools/get_islamic_events";
import { execute as getMoonPhase } from "../tools/get_moon_phase";

describe("Tool - get_eid_dates", () => {
  it("should return eid dates", async () => {
    const result = await getEidDates({ year: 2024, count: 2 });
    expect(result.content).toBeDefined();
    expect(result.content[0].text).toContain("Eid al-Fitr");
    expect(result.content[0].text).toContain("Eid al-Adha");
    expect(result.content[0].text).toContain("2024");
  });
});

describe("Tool - get_islamic_events", () => {
  it("should return islamic events", async () => {
    const result = await getIslamicEvents({});
    expect(result.content).toBeDefined();
    expect(result.content[0].text).toContain("Eid al-Fitr");
    expect(result.content[0].text).toMatch(/Ramadan|رمضان/);
  });
});

describe("Tool - get_moon_phase", () => {
  it("should return moon phase", async () => {
    const result = await getMoonPhase();
    expect(result.content).toBeDefined();
    expect(result.content[0].text).toContain("Moon");
  });
});