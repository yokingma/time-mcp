#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';

import {
  CONVERT_TIME,
  CURRENT_TIME,
  DAYS_IN_MONTH,
  GET_TIMESTAMP,
  GET_WEEK_YEAR,
  RELATIVE_TIME,
} from './tools.js';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

// Helper functions
function getCurrentTime(format: string, timezone?: string) {
  const utcTime = dayjs.utc();
  const localTimezone = timezone ?? dayjs.tz.guess();
  const localTime = dayjs().tz(localTimezone);
  return {
    utc: utcTime.format(format),
    local: localTime.format(format),
    timezone: localTimezone,
  };
}

function getRelativeTime(time: string) {
  return dayjs(time).fromNow();
}

function getTimestamp(time?: string) {
  return time ? dayjs.utc(time).valueOf() : dayjs().valueOf();
}

function getDaysInMonth(date?: string) {
  return date ? dayjs(date).daysInMonth() : dayjs().daysInMonth();
}

function getWeekOfYear(date?: string) {
  const week = date ? dayjs(date).week() : dayjs().week();
  const isoWeek = date ? dayjs(date).isoWeek() : dayjs().isoWeek();
  return {
    week,
    isoWeek,
  };
}

function convertTime(sourceTimezone: string, targetTimezone: string, time?: string) {
  const sourceTime = time ? dayjs(time).tz(sourceTimezone) : dayjs().tz(sourceTimezone);
  const targetTime = sourceTime.tz(targetTimezone);
  const formatString = 'YYYY-MM-DD HH:mm:ss';
  return {
    sourceTime: sourceTime.format(formatString),
    targetTime: targetTime.format(formatString),
    timeDiff: dayjs(targetTime).diff(dayjs(sourceTime), 'hours'),
  };
}

const server = new McpServer({
  name: 'time-mcp',
  version: '0.0.1',
}, {
  capabilities: {
    tools: {},
    logging: {},
  },
});

// Register current_time tool
server.registerTool(
  CURRENT_TIME.name,
  {
    description: CURRENT_TIME.description,
    inputSchema: CURRENT_TIME.schema,
  },
  (args) => {
    const result = getCurrentTime(args.format, args.timezone);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Current UTC time is ${result.utc}, and the time in ${result.timezone} is ${result.local}.`,
        },
      ],
    };
  },
);

// Register relative_time tool
server.registerTool(
  RELATIVE_TIME.name,
  {
    description: RELATIVE_TIME.description,
    inputSchema: RELATIVE_TIME.schema,
  },
  (args) => {
    const result = getRelativeTime(args.time);
    return {
      content: [
        {
          type: 'text' as const,
          text: result,
        },
      ],
    };
  },
);

// Register days_in_month tool
server.registerTool(
  DAYS_IN_MONTH.name,
  {
    description: DAYS_IN_MONTH.description,
    inputSchema: DAYS_IN_MONTH.schema,
  },
  (args) => {
    const result = getDaysInMonth(args.date);
    return {
      content: [
        {
          type: 'text' as const,
          text: `The number of days in month is ${result}.`,
        },
      ],
    };
  },
);

// Register get_timestamp tool
server.registerTool(
  GET_TIMESTAMP.name,
  {
    description: GET_TIMESTAMP.description,
    inputSchema: GET_TIMESTAMP.schema,
  },
  (args) => {
    const result = getTimestamp(args.time);
    return {
      content: [
        {
          type: 'text' as const,
          text: args.time
            ? `The timestamp of ${args.time} (parsed as UTC) is ${result} ms.`
            : `The current timestamp is ${result} ms.`,
        },
      ],
    };
  },
);

// Register convert_time tool
server.registerTool(
  CONVERT_TIME.name,
  {
    description: CONVERT_TIME.description,
    inputSchema: CONVERT_TIME.schema,
  },
  (args) => {
    const { sourceTime, targetTime, timeDiff } = convertTime(args.sourceTimezone, args.targetTimezone, args.time);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Current time in ${args.sourceTimezone} is ${sourceTime}, and the time in ${args.targetTimezone} is ${targetTime}. The time difference is ${timeDiff} hours.`,
        },
      ],
    };
  },
);

// Register get_week_year tool
server.registerTool(
  GET_WEEK_YEAR.name,
  {
    description: GET_WEEK_YEAR.description,
    inputSchema: GET_WEEK_YEAR.schema,
  },
  (args) => {
    const { week, isoWeek } = getWeekOfYear(args.date);
    return {
      content: [
        {
          type: 'text' as const,
          text: `The week of the year is ${week}, and the isoWeek of the year is ${isoWeek}.`,
        },
      ],
    };
  },
);

async function runServer() {
  try {
    process.stdout.write('Starting Time MCP server...\n');
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error starting Time MCP server: ${message}\n`);
    process.exit(1);
  }
}

runServer().catch(error => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Error running Time MCP server: ${errorMessage}\n`);
  process.exit(1);
});
