import * as Astro from "astronomy-engine";

export interface PrayerTimes {
  Fajr: Date;
  Sunrise: Date;
  Dhuhr: Date;
  Asr: Date;
  Maghrib: Date;
  Isha: Date;
}

const METHOD_ANGLES: Record<string, { fajr: number; isha: number }> = {
  MWL: { fajr: -18, isha: -17 },
  ISNA: { fajr: -15, isha: -15 },
  Egypt: { fajr: -19.5, isha: -17.5 },
  Makkah: { fajr: -18.5, isha: -19 },
  Karachi: { fajr: -18, isha: -18 },
};

function getSunDeclination(date: Date): number {
  const sv = Astro.GeoVector(Astro.Body.Sun, date, true);
  const eq = Astro.EquatorFromVector(sv);
  return eq.dec;
}

export function calculatePrayerTimes(
  latitude: number,
  longitude: number,
  date: Date,
  method: string = "MWL",
  asrMethod: "Shafi" | "Hanafi" = "Shafi"
): PrayerTimes {
  const obs = new Astro.Observer(latitude, longitude, 0);
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

  const angles = METHOD_ANGLES[method] || METHOD_ANGLES.MWL;
  const fajrAngle = angles.fajr;
  const ishaAngle = angles.isha;

  const fajr = Astro.SearchAltitude(Astro.Body.Sun, obs, 1, dayStart, 1, fajrAngle);
  const sunrise = Astro.SearchAltitude(Astro.Body.Sun, obs, 1, dayStart, 1, -0.833);
  const sunset = Astro.SearchAltitude(Astro.Body.Sun, obs, -1, dayStart, 1, -0.833);
  const dhuhr = new Date((sunrise.date.getTime() + sunset.date.getTime()) / 2);

  const dec = getSunDeclination(dhuhr);
  const latRad = (latitude * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;
  const tanShadow = Math.tan(Math.abs(latRad - decRad));

  let asrAltDeg: number;
  if (asrMethod === "Hanafi") {
    asrAltDeg = (Math.atan(1 / (2 + tanShadow))) * 180 / Math.PI;
  } else {
    asrAltDeg = (Math.atan(1 / (1 + tanShadow))) * 180 / Math.PI;
  }

  const asr = Astro.SearchAltitude(Astro.Body.Sun, obs, -1, dhuhr, 0.5, asrAltDeg);
  const maghrib = sunset;
  const isha = ishaAngle > -90 
    ? Astro.SearchAltitude(Astro.Body.Sun, obs, -1, sunset.date, 1, ishaAngle)
    : { date: new Date(sunset.date.getTime() + 90 * 60 * 60 * 1000) };

  return {
    Fajr: fajr.date,
    Sunrise: sunrise.date,
    Dhuhr: dhuhr,
    Asr: asr.date,
    Maghrib: maghrib.date,
    Isha: isha.date || new Date(maghrib.date.getTime() + 90 * 60 * 60 * 1000),
  };
}

export function formatPrayerTime(date: Date, timezone: string): string {
  return date.toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}