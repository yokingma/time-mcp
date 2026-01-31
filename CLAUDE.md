# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Time MCP Server is a Model Context Protocol (MCP) server implementation that provides time awareness capabilities to LLMs. It exposes 6 time-related tools through the MCP protocol: current_time, relative_time, get_timestamp, days_in_month, convert_time, and get_week_year.

## Development Commands

```bash
# Development (run server locally)
npm run dev

# Build (creates dist/ with both CJS and ESM formats)
npm run build

# Lint
npm run lint
npm run lint:fix
```

## Architecture

### Core Structure

The codebase consists of two main files:

- **[src/tools.ts](src/tools.ts)**: Tool definitions exported as cohesive objects. Each tool object contains:
  - `name`: Tool identifier
  - `description`: Tool description
  - `schema`: Zod schema for input validation
- **[src/index.ts](src/index.ts)**: MCP server implementation that:
  1. Initializes the McpServer with stdio transport
  2. Registers tools using `server.registerTool()` with Zod schemas
  3. Implements business logic for each tool using dayjs
  4. Uses Zod for automatic runtime validation (no manual type guards needed)

### MCP Server Pattern

The server uses the modern MCP SDK pattern (v1.25+):
1. Create a `McpServer` instance from `@modelcontextprotocol/sdk/server/mcp.js`
2. Register tools using `server.registerTool(name, config, handler)`
3. Connect to stdio transport for communication with MCP clients
4. Zod schemas provide automatic validation and type safety

### Tool Implementation Pattern

Each tool follows this pattern:

1. Tool definition in [tools.ts](src/tools.ts) as a cohesive object with Zod schema:

   ```typescript
   export const TOOL_NAME = {
     name: 'tool_name',
     description: 'Tool description',
     schema: z.object({ /* Zod schema */ }),
   } as const;
   ```

2. Business logic function in [index.ts](src/index.ts) (e.g., `getCurrentTime`)
3. Tool registration using `server.registerTool()` with inline handler:

   ```typescript
   server.registerTool(
     TOOL_NAME.name,
     { description: TOOL_NAME.description, inputSchema: TOOL_NAME.schema },
     (args) => { /* handler logic */ }
   );
   ```

### Time Handling

All time operations use dayjs with these plugins:
- `relativeTime`: For relative time calculations
- `utc`: For UTC time handling
- `timezone`: For timezone conversions
- `weekOfYear` and `isoWeek`: For week calculations

Important: `get_timestamp` parses input times as UTC when a time string is provided.

## Code Style

The project uses ESLint with TypeScript:
- Single quotes (with escape avoidance)
- Semicolons required
- 2-space indentation with SwitchCase: 1
- Trailing commas in multiline structures
- Unused vars prefixed with `_` are allowed
- `@typescript-eslint/no-explicit-any` is a warning, not an error

## Build Configuration

- **tsup**: Builds both CJS (`dist/index.cjs`) and ESM (`dist/index.js`) formats
- **TypeScript**: Targets ES2022 with NodeNext module resolution
- **Executable**: The build script makes `dist/index.js` executable (chmod 755)
- **Entry point**: The package is published with a bin entry pointing to `dist/index.js`

## Testing the Server

To test the server locally, run `npm run dev`. The server communicates via stdio and expects MCP protocol messages on stdin. For integration testing, configure it in an MCP client like Claude Desktop, Cursor, or Windsurf using:

```json
{
  "mcpServers": {
    "time-mcp": {
      "command": "npx",
      "args": ["-y", "time-mcp"]
    }
  }
}
```
