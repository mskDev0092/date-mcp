import moment from "moment-hijri";
import { z } from "zod";

const toolSchema = {
  timezone: z.string().describe("IANA timezone, e.g. 'America/New_York', 'UTC'").default("UTC"),
};

export const description = "Get current Gregorian date & time in specified timezone";

export async function execute(params: { timezone?: string }) {
  const timezone = params.timezone || "UTC";
  const now = new Date();
  const m = moment(now);

  const result = [
    `**Gregorian Date & Time**`,
    `Date: ${now.toLocaleDateString("en-US", { timeZone: timezone, weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
    `Time: ${now.toLocaleTimeString("en-US", { timeZone: timezone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}`,
    `Timezone: ${timezone}`,
    `ISO 8601: ${now.toISOString()}`,
    `Day of Year: ${m.dayOfYear()}`,
    `Week Number (ISO): ${m.isoWeek()}`,
    `Quarter: Q${m.quarter()}`,
    `Unix Timestamp: ${now.getTime()}`,
    `Is Leap Year: ${m.isLeapYear()}`,
  ].join("\n");

  return { content: [{ type: "text", text: result }] };
}

export { toolSchema as schema };