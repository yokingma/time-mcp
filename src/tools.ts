import { z } from 'zod/v4';

export const CURRENT_TIME = {
  name: 'current_time',
  description: 'Get the current date and time.',
  schema: z.object({
    format: z.enum([
      'h:mm A',
      'h:mm:ss A',
      'YYYY-MM-DD HH:mm:ss',
      'YYYY-MM-DD',
      'YYYY-MM',
      'MM/DD/YYYY',
      'MM/DD/YY',
      'YYYY/MM/DD',
      'YYYY/MM',
    ]).describe('The format of the time').default('YYYY-MM-DD HH:mm:ss'),
    timezone: z.string()
      .describe('The timezone of the time, IANA timezone name, e.g. Asia/Shanghai')
      .optional(),
  }),
} as const;

export const RELATIVE_TIME = {
  name: 'relative_time',
  description: 'Get the relative time from now.',
  schema: z.object({
    time: z.string()
      .describe('The time to get the relative time from now. Format: YYYY-MM-DD HH:mm:ss'),
  }),
} as const;

export const DAYS_IN_MONTH = {
  name: 'days_in_month',
  description: 'Get the number of days in a month. If no date is provided, get the number of days in the current month.',
  schema: z.object({
    date: z.string()
      .describe('The date to get the days in month. Format: YYYY-MM-DD')
      .optional(),
  }),
} as const;

export const GET_TIMESTAMP = {
  name: 'get_timestamp',
  description: 'Get the timestamp for the time.',
  schema: z.object({
    time: z.string()
      .describe('The time to get the timestamp. Format: YYYY-MM-DD HH:mm:ss.SSS')
      .optional(),
  }),
} as const;

export const CONVERT_TIME = {
  name: 'convert_time',
  description: 'Convert time between timezones.',
  schema: z.object({
    sourceTimezone: z.string()
      .describe('The source timezone. IANA timezone name, e.g. Asia/Shanghai'),
    targetTimezone: z.string()
      .describe('The target timezone. IANA timezone name, e.g. Europe/London'),
    time: z.string()
      .describe('Date and time in 24-hour format. e.g. 2025-03-23 12:30:00'),
  }),
} as const;

export const GET_WEEK_YEAR = {
  name: 'get_week_year',
  description: 'Get the week and isoWeek of the year.',
  schema: z.object({
    date: z.string()
      .describe('The date to get the week and isoWeek of the year. e.g. 2025-03-23')
      .optional(),
  }),
} as const;
