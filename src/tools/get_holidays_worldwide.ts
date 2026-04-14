import { z } from "zod";

const toolSchema = {
  region: z.enum(["all", "middle_east", "europe", "asia", "americas", "oceania"]).default("all"),
  year: z.number().optional().describe("Gregorian year (default: current)"),
};

export const description = "Get popular worldwide holidays by region";

const HOLIDAYS = [
  { name: "New Year's Day", date: "01-01", regions: ["all"], type: "Cultural" },
  { name: "Valentine's Day", date: "02-14", regions: ["all"], type: "Cultural" },
  { name: "Nowruz", date: "03-20", regions: ["middle_east", "asia"], type: "Persian" },
  { name: "Holi", date: "03-14", regions: ["asia"], type: "Hindu" },
  { name: "Easter", date: "04-20", regions: ["europe", "americas", "oceania"], type: "Christian" },
  { name: "Ramadan Start", date: "03-01", regions: ["middle_east", "asia"], type: "Islamic" },
  { name: "Eid al-Fitr", date: "04-01", regions: ["middle_east", "asia"], type: "Islamic" },
  { name: "Eid al-Adha", date: "06-07", regions: ["middle_east", "asia"], type: "Islamic" },
  { name: "Diwali", date: "11-01", regions: ["asia"], type: "Hindu" },
  { name: "Christmas", date: "12-25", regions: ["all"], type: "Christian" },
  { name: "Independence Day (Pakistan)", date: "08-14", regions: ["asia"], type: "National" },
  { name: "Independence Day (US)", date: "07-04", regions: ["americas"], type: "National" },
  { name: "Independence Day (India)", date: "08-15", regions: ["asia"], type: "National" },
  { name: "Bastille Day", date: "07-14", regions: ["europe"], type: "National" },
  { name: "German Unity Day", date: "10-03", regions: ["europe"], type: "National" },
  { name: "Australia Day", date: "01-26", regions: ["oceania"], type: "National" },
  { name: "CNY", date: "01-29", regions: ["asia"], type: "Cultural" },
];

export async function execute(params: { region?: string; year?: number }) {
  const region = params.region || "all";
  const year = params.year || new Date().getFullYear();
  const now = new Date();

  const filtered = HOLIDAYS.filter(h => h.regions.includes("all") || h.regions.includes(region));

  const lines = [
    `**Worldwide Holidays ${year}**`,
    `Region: ${region === "all" ? "All" : region.replace("_", " ").toUpperCase()}`,
    ``,
  ];

  for (const h of filtered) {
    const [m, d] = h.date.split("-").map(Number);
    const date = new Date(year, m - 1, d);
    if (date < now) date.setFullYear(year + 1);
    const days = Math.ceil((date.getTime() - now.getTime()) / 86400000);
    lines.push(`${days < 0 ? "✓" : "○"} ${h.name} (${h.type}) - ${days < 0 ? Math.abs(days) + "d ago" : days === 0 ? "TODAY" : days + "d"}`);
  }

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

export { toolSchema as schema };