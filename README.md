# Date MCP Server

A multi-tool MCP (Model Context Protocol) server for dates, calendars, prayer times, moon phases, and astronomical calculations. Works with **LM Studio**, **Claude Desktop**, **Ollama**, **Cursor**, and any MCP-compatible client.

## Features

- **Gregorian Calendar** — Full date/time with timezone support, week numbers, day of year, quarters, leap year info
- **Hijri (Islamic) Calendar** — Accurate Hijri date with Arabic/English month names and weekday names
- **Chinese (Lunar) Calendar** — Lunar date with zodiac animal, element, and Chinese New Year info
- **Persian (Jalali) Calendar** — Solar Hijri date with Persian month names and Nowruz info
- **Date Conversion** — Convert between Gregorian, Hijri, Persian, and Chinese calendars
- **Prayer Times** — Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha with 5 calculation methods (MWL, ISNA, Egypt, Makkah, Karachi)
- **Moon Phases** — Current phase, illumination %, distance, and upcoming new/full/quarter moons
- **Sun Position** — Right ascension, declination, ecliptic longitude, distance in AU/km
- **Upcoming Events** — Next 60 days of moon phases, equinoxes, and solstices

## Prerequisites

- [Bun](https://bun.sh/) v1.0.0 or later

## Install

```bash
git clone <your-repo-url> date-mcp
cd date-mcp
bun install
```

## Quick Start

```bash
bun run dev
```

This starts the MCP server using **stdio transport** (JSON-RPC over stdin/stdout). The server waits for MCP client connections — it does not print anything to stdout.

---

## Setup with Clients

### LM Studio

1. Open LM Studio
2. Go to the **Chat** tab
3. Click the **plug icon** (MCP) in the right sidebar
4. Click **Program** → **Install** → **Edit mcp.json**
5. Add the following:

```json
{
  "mcpServers": {
    "date-mcp": {
      "command": "bun",
      "args": ["/absolute/path/to/date-mcp/src/index.ts"]
    }
  }
}
```

> **Replace** `/absolute/path/to/date-mcp/src/index.ts` with the full path to your `src/index.ts` file. For example: `"args": ["/home/user/date-mcp/src/index.ts"]`

6. **Save** the file
7. Back in chat, click the plug icon and **enable** `date-mcp`
8. Start chatting — the model can now use all date/calendar tools!

#### One-Click Install (Deep Link)

You can share a one-click install link. Base64-encode your config and use:

```
https://lmstudio.ai/install-mcp?name=date-mcp&config=<base64-config>
```

Example: The config `{"command":"bun","args":["/path/to/date-mcp/src/index.ts"]}` base64-encoded becomes `eyJjb21tYW5kIjoiYnVuIiwiYXJncyI6WyIvcGF0aC90by9kYXRlLW1jcC9zcmMvaW5kZXgudHMiXX0=`.

---

### Claude Desktop

1. Open Claude Desktop settings
2. Find and open your Claude config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
3. Add:

```json
{
  "mcpServers": {
    "date-mcp": {
      "command": "bun",
      "args": ["/absolute/path/to/date-mcp/src/index.ts"]
    }
  }
}
```

4. Restart Claude Desktop

---

### Cursor

1. Open Cursor settings
2. Go to **MCP** section
3. Add a new MCP server:
   - **Name**: `date-mcp`
   - **Command**: `bun`
   - **Args**: `/absolute/path/to/date-mcp/src/index.ts`

---

### Ollama / Other MCP Clients

For any MCP-compatible client that supports stdio transport, use:

```json
{
  "command": "bun",
  "args": ["/absolute/path/to/date-mcp/src/index.ts"]
}
```

If your client uses a different config format, adapt accordingly. The server speaks standard MCP protocol (JSON-RPC 2.0 over stdin/stdout).

---

### Make it Executable (Alternative)

You can also make the script executable directly:

```bash
chmod +x src/index.ts
```

Then in your MCP config:

```json
{
  "mcpServers": {
    "date-mcp": {
      "command": "/absolute/path/to/date-mcp/src/index.ts"
    }
  }
}
```

---

## Available Tools (14 total)

| Tool | Description | Example Parameters |
|------|-------------|-------------------|
| `get_gregorian_date` | Current Gregorian date/time | `{"timezone": "UTC"}` |
| `get_hijri_date` | Current Hijri (Islamic) date | `{"locale": "en"}` |
| `get_persian_date` | Current Persian (Jalali) date | `{}` |
| `get_chinese_date` | Current Chinese (Lunar) calendar | `{}` |
| `convert_date` | Convert between calendars | `{"calendar": "gregorian", "year": 2024, "month": 3, "day": 10}` |
| `get_eid_dates` | Eid al-Fitr & Eid al-Adha dates | `{"year": 2024, "count": 3}` |
| `get_islamic_events` | Islamic events for Hijri year | `{"year": 1446}` |
| `get_ramadan_times` | Ramadan dates & Laylat al-Qadr | `{"year": 2024}` |
| `get_prayer_times` | Prayer times for location | `{"location": "Karachi"}` or `{"latitude": 33.5, "longitude": 73.0}` |
| `get_moon_phase` | Current moon phase | `{}` |
| `get_sun_position` | Sun position | `{}` |
| `get_upcoming_events` | Astronomical events | `{}` |
| `get_holidays_worldwide` | Holidays by region | `{"region": "middle_east"}` |
| `get_todays_full_report` | Complete daily report | `{}` |

### Prayer Times Methods

| Method | Fajr Angle | Isha Angle |
|--------|-----------|------------|
| MWL (default) | 18° | 17° |
| ISNA | 15° | 15° |
| Egypt | 19.5° | 17.5° |
| Makkah | 18.5° | 19° |
| Karachi | 18° | 18° |

## Example Usage in Chat

Once configured, ask your model things like:

- "What is today's Hijri date?"
- "What time is Fajr in Makkah right now?"
- "Convert 1447/09/01 Hijri to Gregorian"
- "When is the next full moon?"
- "What is the current moon phase?"
- "What is the Chinese zodiac for this year?"
- "What is today's Persian date?"

---

## Stress Test Questions

Test all tools with these comprehensive questions:

### Gregorian & Basic Dates
```
- What is today's date and time in UTC?
- What is the current date in America/New_York timezone?
- What day of the week is it? What week number is this?
- Is this a leap year?
- What is the Unix timestamp right now?
```

### Hijri (Islamic) Calendar
```
- What is today's Hijri date?
- What month is it in the Islamic calendar?
- What is the weekday name in Arabic?
- Convert Gregorian April 14, 2026 to Hijri
- What is 1 Ramadan 1447 AH in Gregorian?
```

### Persian (Jalali) Calendar
```
- What is today's Persian date?
- What is the Persian weekday name?
- Convert today's Gregorian date to Persian
- When is Nowruz this year?
- What month is Farvardin?
```

### Chinese & Zodiac
```
- What is the Chinese zodiac for this year?
- When is Chinese New Year this year?
- What animal comes after Horse in the cycle?
- What element is 2026?
- Show the full 12-year Chinese zodiac cycle
```

### Prayer Times
```
- What are the prayer times for Makkah today?
- What is Fajr time in Karachi?
- Get prayer times for Lahore
- What is Asr time in Dubai?
- Get Fajr for 33.5, 73.0 (coordinates)
- Show prayer times for Istanbul
- What method is used for Pakistan?
- Get Fajr with Hanafi Asr method
```

### Islamic Events
```
- When is Eid al-Fitr this year?
- When is Eid al-Adha?
- When does Ramadan start?
- What is Laylat al-Qadr?
- Show all Islamic events for 1447 AH
- When is Ashura?
- What is Mawlid al-Nabi?
```

### Moon & Astronomy
```
- What is the current moon phase?
- What is the moon illumination percentage?
- When is the next New Moon?
- When is the next Full Moon?
- Show upcoming moon phases
- What is the moon's age?
- Get the sun's current position
```

### Date Conversion
```
- Convert 2024-03-10 to Hijri
- Convert 1445/01/01 AH to Gregorian
- What is 1405/01/01 in Gregorian?
- Show today's date in all calendars
```

### Holidays
```
- What holidays are in December?
- Show national holidays for Pakistan
- What holidays are in the Middle East?
- Any cultural holidays in Asia?
```

### Edge Cases & Combinations
```
- Get prayer times for an unknown city - what happens?
- Convert an invalid date - does it handle gracefully?
- Request prayer times without location - does it default?
- Get Eid dates for 10 years ahead
- Show Ramadan for a past year
- What happens with extreme coordinates (90°N)?
```

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **MCP SDK**: [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk)
- **Hijri Calendar**: [moment-hijri](https://github.com/xsoh/moment-hijri)
- **Astronomy**: [astronomy-engine](https://github.com/cosinekitty/astronomy-engine)
- **Validation**: [Zod](https://zod.dev)

## License

MIT
