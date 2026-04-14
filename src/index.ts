#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import * as getGregorianDate from "./tools/get_gregorian_date.js";
import * as getHijriDate from "./tools/get_hijri_date.js";
import * as getPersianDate from "./tools/get_persian_date.js";
import * as getChineseDate from "./tools/get_chinese_date.js";
import * as convertDate from "./tools/convert_date.js";
import * as getEidDates from "./tools/get_eid_dates.js";
import * as getIslamicEvents from "./tools/get_islamic_events.js";
import * as getRamadanTimes from "./tools/get_ramadan_times.js";
import * as getPrayerTimes from "./tools/get_prayer_times.js";
import * as getMoonPhase from "./tools/get_moon_phase.js";
import * as getSunPosition from "./tools/get_sun_position.js";
import * as getUpcomingEvents from "./tools/get_upcoming_events.js";
import * as getHolidaysWorldwide from "./tools/get_holidays_worldwide.js";

const server = new McpServer({ name: "date-mcp", version: "1.0.0" });

server.tool("get_gregorian_date", getGregorianDate.description, getGregorianDate.schema, async p => getGregorianDate.execute(p));
server.tool("get_hijri_date", getHijriDate.description, getHijriDate.schema, async p => getHijriDate.execute(p));
server.tool("get_persian_date", getPersianDate.description, getPersianDate.schema, async () => getPersianDate.execute());
server.tool("get_chinese_date", getChineseDate.description, getChineseDate.schema, async () => getChineseDate.execute());
server.tool("convert_date", convertDate.description, convertDate.schema, async p => convertDate.execute(p));
server.tool("get_eid_dates", getEidDates.description, getEidDates.schema, async p => getEidDates.execute(p));
server.tool("get_islamic_events", getIslamicEvents.description, getIslamicEvents.schema, async p => getIslamicEvents.execute(p));
server.tool("get_ramadan_times", getRamadanTimes.description, getRamadanTimes.schema, async p => getRamadanTimes.execute(p));
server.tool("get_prayer_times", getPrayerTimes.description, getPrayerTimes.schema, async p => getPrayerTimes.execute(p));
server.tool("get_moon_phase", getMoonPhase.description, getMoonPhase.schema, async () => getMoonPhase.execute());
server.tool("get_sun_position", getSunPosition.description, getSunPosition.schema, async () => getSunPosition.execute());
server.tool("get_upcoming_events", getUpcomingEvents.description, getUpcomingEvents.schema, async () => getUpcomingEvents.execute());
server.tool("get_holidays_worldwide", getHolidaysWorldwide.description, getHolidaysWorldwide.schema, async p => getHolidaysWorldwide.execute(p));

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});