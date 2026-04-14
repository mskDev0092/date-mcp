#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import * as getGregorianDate from "./tools/get_gregorian_date.js";
import * as getHijriDate from "./tools/get_hijri_date.js";
import * as getEidDates from "./tools/get_eid_dates.js";
import * as getIslamicEvents from "./tools/get_islamic_events.js";
import * as getPrayerTimes from "./tools/get_prayer_times.js";
import * as getMoonPhase from "./tools/get_moon_phase.js";

const server = new McpServer({ name: "date-mcp", version: "1.0.0" });

server.tool("get_gregorian_date", getGregorianDate.description, getGregorianDate.schema, async ({ timezone }) => {
  return getGregorianDate.execute({ timezone });
});

server.tool("get_hijri_date", getHijriDate.description, getHijriDate.schema, async ({ locale }) => {
  return getHijriDate.execute({ locale });
});

server.tool("get_eid_dates", getEidDates.description, getEidDates.schema, async ({ year, count }) => {
  return getEidDates.execute({ year, count });
});

server.tool("get_islamic_events", getIslamicEvents.description, getIslamicEvents.schema, async ({ year }) => {
  return getIslamicEvents.execute({ year });
});

server.tool("get_prayer_times", getPrayerTimes.description, getPrayerTimes.schema, async (params) => {
  return getPrayerTimes.execute(params);
});

server.tool("get_moon_phase", getMoonPhase.description, getMoonPhase.schema, async () => {
  return getMoonPhase.execute();
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});