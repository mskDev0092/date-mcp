import { describe, it, expect } from "bun:test";
import { getCityCoords, parseLocation, inferMethod, inferAsrMethod } from "../lib/geo";

describe("Geo - City Lookup", () => {
  it("should find Makkah coordinates", () => {
    const coords = getCityCoords("Makkah");
    expect(coords).not.toBeNull();
    expect(coords!.lat).toBeCloseTo(21.3891);
    expect(coords!.lon).toBeCloseTo(39.8579);
  });

  it("should find Karachi coordinates", () => {
    const coords = getCityCoords("Karachi");
    expect(coords).not.toBeNull();
    expect(coords!.method).toBe("Karachi");
  });

  it("should be case insensitive", () => {
    expect(getCityCoords("makkah")).not.toBeNull();
    expect(getCityCoords("KARACHI")).not.toBeNull();
  });

  it("should return null for unknown city", () => {
    expect(getCityCoords("NonexistentCity123")).toBeNull();
  });
});

describe("Geo - Location Parse", () => {
  it("should parse city name", () => {
    const loc = parseLocation("Lahore");
    expect(loc).not.toBeNull();
    expect(loc!.lat).toBeCloseTo(31.5204);
    expect(loc!.lon).toBeCloseTo(74.3587);
    expect(loc!.timezone).toBe("Asia/Karachi");
  });

  it("should parse lat,lon string", () => {
    const loc = parseLocation("33.5,73.0");
    expect(loc).not.toBeNull();
    expect(loc!.lat).toBeCloseTo(33.5);
    expect(loc!.lon).toBeCloseTo(73.0);
  });

  it("should return null for invalid", () => {
    expect(parseLocation("")).toBeNull();
  });
});

describe("Geo - Method Inference", () => {
  it("should infer Karachi for Pakistan", () => {
    expect(inferMethod(24.8607, 67.0011)).toBe("Karachi");
  });

  it("should infer Makkah for Saudi Arabia", () => {
    expect(inferMethod(21.3891, 39.8579)).toBe("Makkah");
  });

  it("should default to MWL", () => {
    expect(inferMethod(40.7128, -74.006)).toBe("MWL");
  });
});

describe("Geo - Asr Method Inference", () => {
  it("should infer Hanafi for Pakistan", () => {
    expect(inferAsrMethod(24.8607, 67.0011)).toBe("Hanafi");
  });

  it("should infer Hanafi for India", () => {
    expect(inferAsrMethod(28.7041, 77.1025)).toBe("Hanafi");
  });

  it("should infer Shafi for default", () => {
    expect(inferAsrMethod(40.7128, -74.006)).toBe("Shafi");
  });
});