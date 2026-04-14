export interface CityCoords {
  lat: number;
  lon: number;
  country: string;
  timezone: string;
  method?: string;
}

const CITIES: Record<string, CityCoords> = {
  Makkah: { lat: 21.3891, lon: 39.8579, country: "Saudi Arabia", timezone: "Asia/Riyadh", method: "Makkah" },
  Mecca: { lat: 21.3891, lon: 39.8579, country: "Saudi Arabia", timezone: "Asia/Riyadh", method: "Makkah" },
  Madinah: { lat: 24.5247, lon: 39.5692, country: "Saudi Arabia", timezone: "Asia/Riyadh", method: "Makkah" },
  Medina: { lat: 24.5247, lon: 39.5692, country: "Saudi Arabia", timezone: "Asia/Riyadh", method: "Makkah" },
  Riyadh: { lat: 24.7136, lon: 46.6753, country: "Saudi Arabia", timezone: "Asia/Riyadh" },
  Jeddah: { lat: 21.4858, lon: 39.1925, country: "Saudi Arabia", timezone: "Asia/Riyadh" },
  Dubai: { lat: 25.2048, lon: 55.2708, country: "UAE", timezone: "Asia/Dubai" },
  "Abu Dhabi": { lat: 24.4539, lon: 54.3773, country: "UAE", timezone: "Asia/Dubai" },
  Doha: { lat: 25.2854, lon: 51.531, country: "Qatar", timezone: "Asia/Qatar" },
  "Kuwait City": { lat: 29.3759, lon: 47.9774, country: "Kuwait", timezone: "Asia/Kuwait" },
  Manama: { lat: 26.2285, lon: 50.586, country: "Bahrain", timezone: "Asia/Bahrain" },
  Muscat: { lat: 23.588, lon: 58.3829, country: "Oman", timezone: "Asia/Muscat" },
  Karachi: { lat: 24.8607, lon: 67.0011, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  Lahore: { lat: 31.5204, lon: 74.3587, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  Islamabad: { lat: 33.6844, lon: 73.0479, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  Peshawar: { lat: 34.0151, lon: 71.5245, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  Quetta: { lat: 30.1798, lon: 66.975, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  Faisalabad: { lat: 31.4504, lon: 73.065, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  Multan: { lat: 30.1575, lon: 71.5245, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  Hyderabad: { lat: 25.3278, lon: 68.6694, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  Sialkot: { lat: 32.4949, lon: 74.5379, country: "Pakistan", timezone: "Asia/Karachi", method: "Karachi" },
  Mumbai: { lat: 19.076, lon: 72.8777, country: "India", timezone: "Asia/Kolkata" },
  Delhi: { lat: 28.7041, lon: 77.1025, country: "India", timezone: "Asia/Kolkata" },
  Kolkata: { lat: 22.5726, lon: 88.3639, country: "India", timezone: "Asia/Kolkata" },
  Chennai: { lat: 13.0827, lon: 80.2707, country: "India", timezone: "Asia/Kolkata" },
  Bangalore: { lat: 12.9716, lon: 77.5946, country: "India", timezone: "Asia/Kolkata" },
  Dhaka: { lat: 23.8103, lon: 90.4125, country: "Bangladesh", timezone: "Asia/Dhaka" },
  Jakarta: { lat: -6.2088, lon: 106.8456, country: "Indonesia", timezone: "Asia/Jakarta" },
  Surabaya: { lat: -7.2575, lon: 112.7521, country: "Indonesia", timezone: "Asia/Jakarta" },
  "Kuala Lumpur": { lat: 3.139, lon: 101.6869, country: "Malaysia", timezone: "Asia/Kuala_Lumpur" },
  Singapore: { lat: 1.3521, lon: 103.8198, country: "Singapore", timezone: "Asia/Singapore" },
  Bangkok: { lat: 13.7563, lon: 100.5018, country: "Thailand", timezone: "Asia/Bangkok" },
  Tokyo: { lat: 35.6762, lon: 139.6503, country: "Japan", timezone: "Asia/Tokyo" },
  Seoul: { lat: 37.5665, lon: 126.978, country: "South Korea", timezone: "Asia/Seoul" },
  Beijing: { lat: 39.9042, lon: 116.4074, country: "China", timezone: "Asia/Shanghai" },
  Shanghai: { lat: 31.2304, lon: 121.4737, country: "China", timezone: "Asia/Shanghai" },
  "Hong Kong": { lat: 22.3193, lon: 114.1694, country: "Hong Kong", timezone: "Asia/Hong_Kong" },
  London: { lat: 51.5074, lon: -0.1278, country: "UK", timezone: "Europe/London" },
  Paris: { lat: 48.8566, lon: 2.3522, country: "France", timezone: "Europe/Paris" },
  Berlin: { lat: 52.52, lon: 13.405, country: "Germany", timezone: "Europe/Berlin" },
  Rome: { lat: 41.9028, lon: 12.4964, country: "Italy", timezone: "Europe/Rome" },
  Madrid: { lat: 40.4168, lon: -3.7038, country: "Spain", timezone: "Europe/Madrid" },
  Toronto: { lat: 43.6532, lon: -79.3832, country: "Canada", timezone: "America/Toronto" },
  Vancouver: { lat: 49.2827, lon: -123.1207, country: "Canada", timezone: "America/Vancouver" },
  "New York": { lat: 40.7128, lon: -74.006, country: "USA", timezone: "America/New_York" },
  "Los Angeles": { lat: 34.0522, lon: -118.2437, country: "USA", timezone: "America/Los_Angeles" },
  Chicago: { lat: 41.8781, lon: -87.6298, country: "USA", timezone: "America/Chicago" },
  Houston: { lat: 29.7604, lon: -95.3698, country: "USA", timezone: "America/Chicago" },
  Phoenix: { lat: 33.4484, lon: -112.074, country: "USA", timezone: "America/Phoenix" },
  "San Francisco": { lat: 37.7749, lon: -122.4194, country: "USA", timezone: "America/Los_Angeles" },
  Sydney: { lat: -33.8688, lon: 151.2093, country: "Australia", timezone: "Australia/Sydney" },
  Melbourne: { lat: -37.8136, lon: 144.9631, country: "Australia", timezone: "Australia/Melbourne" },
  Cairo: { lat: 30.0444, lon: 31.2357, country: "Egypt", timezone: "Africa/Cairo", method: "Egypt" },
  Alexandria: { lat: 31.2001, lon: 29.9187, country: "Egypt", timezone: "Africa/Cairo", method: "Egypt" },
  Istanbul: { lat: 41.0082, lon: 28.9784, country: "Turkey", timezone: "Europe/Istanbul" },
  Tehran: { lat: 35.6892, lon: 51.389, country: "Iran", timezone: "Asia/Tehran" },
  Baghdad: { lat: 33.3152, lon: 44.3661, country: "Iraq", timezone: "Asia/Baghdad" },
  Amman: { lat: 31.9454, lon: 35.9284, country: "Jordan", timezone: "Asia/Amman" },
  Beirut: { lat: 33.8938, lon: 35.5018, country: "Lebanon", timezone: "Asia/Beirut" },
  Moscow: { lat: 55.7558, lon: 37.6173, country: "Russia", timezone: "Europe/Moscow" },
};

export function getCityCoords(cityName: string): CityCoords | null {
  if (!cityName) return null;
  const normalized = cityName.trim();
  if (CITIES[normalized]) return CITIES[normalized];
  const lower = normalized.toLowerCase();
  for (const [name, coords] of Object.entries(CITIES)) {
    if (name.toLowerCase() === lower || name.toLowerCase().includes(lower) || lower.includes(name.toLowerCase())) {
      return coords;
    }
  }
  return null;
}

export function parseLocation(location: string): { lat: number; lon: number; timezone: string; method?: string } | null {
  const cityData = getCityCoords(location);
  if (cityData) {
    return {
      lat: cityData.lat,
      lon: cityData.lon,
      timezone: cityData.timezone,
      method: cityData.method,
    };
  }
  if (location.includes(",") || /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(location)) {
    const parts = location.split(",").map((s: string) => s.trim());
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0]);
      const lon = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lon)) {
        return { lat, lon, timezone: "UTC" };
      }
    }
  }
  return null;
}

export function inferMethod(lat: number, lon: number): string {
  if (lat >= 23 && lat <= 37 && lon >= 60 && lon <= 79) return "Karachi";
  if (lat >= 16 && lat <= 32 && lon >= 34 && lon <= 56) return "Makkah";
  if (lat >= 20 && lat <= 32 && lon >= 25 && lon <= 35) return "Egypt";
  if (lat >= 10 && lat <= 30 && lon >= 40 && lon <= 60) return "Makkah";
  if (lat >= -10 && lat <= 5 && lon >= 95 && lon <= 141) return "Egypt";
  return "MWL";
}

export function inferAsrMethod(lat: number, lon: number): "Shafi" | "Hanafi" {
  if (lat >= 23 && lat <= 37 && lon >= 60 && lon <= 79) return "Hanafi";
  if (lat >= 6 && lat <= 36 && lon >= 68 && lon <= 98) return "Hanafi";
  if (lat >= 35 && lat <= 42 && lon >= 26 && lon <= 45) return "Hanafi";
  if (lat >= 29 && lat <= 39 && lon >= 60 && lon <= 75) return "Hanafi";
  if (lat >= 25 && lat <= 40 && lon >= 44 && lon <= 64) return "Hanafi";
  return "Shafi";
}