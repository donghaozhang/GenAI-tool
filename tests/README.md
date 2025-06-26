# Tests Directory

This directory contains various test scripts for the GenAI-tool project, organized by purpose and type.

## Directory Structure

### `integration/`
Integration tests that verify the complete workflow between different components.

- **`test-integration.js`** - Jaaz Edge Functions integration test suite
  - Tests API endpoint mappings between frontend and backend
  - Verifies Edge Function file existence and configuration
  - Checks deployment readiness for Supabase integration
  - Run with: `node tests/integration/test-integration.js`

### `debugging/`
Debugging and troubleshooting scripts for specific issues.

- **`test-fk-error.cjs`** - Chat foreign key error reproduction script
  - Reproduces the `chat_messages_session_id_fkey` violation error
  - Tests multiple scenarios: concurrent requests, race conditions, direct DB insertion
  - Helps debug database constraint issues
  - Run with: `node tests/debugging/test-fk-error.cjs`

## Test Categories

### 🔗 Integration Tests
- **Purpose**: Verify end-to-end functionality between components
- **Scope**: API endpoints, Edge Functions, database integration
- **When to run**: Before deployment, after major changes

### 🐛 Debugging Tests
- **Purpose**: Reproduce and diagnose specific bugs or issues
- **Scope**: Database constraints, race conditions, error scenarios
- **When to run**: When investigating specific problems

## Running Tests

### Prerequisites
- Local Supabase instance running (for debugging tests)
- Node.js dependencies installed
- Environment variables configured

### Commands
```bash
# Run integration tests
node tests/integration/test-integration.js

# Run debugging tests (requires local Supabase)
node tests/debugging/test-fk-error.cjs
```

## Adding New Tests

### Integration Tests
Place new integration tests in `tests/integration/` with descriptive names:
- `test-api-endpoints.js` - API endpoint testing
- `test-edge-functions.js` - Edge Function testing
- `test-database-migration.js` - Database migration testing

### Debugging Tests
Place debugging scripts in `tests/debugging/` with issue-specific names:
- `test-websocket-connection.js` - WebSocket debugging
- `test-canvas-save-error.js` - Canvas save issue debugging
- `test-auth-flow.js` - Authentication flow debugging

## Best Practices

1. **Descriptive Names**: Use clear, descriptive file names
2. **Documentation**: Include purpose and usage in file headers
3. **Error Handling**: Implement proper error handling and reporting
4. **Cleanup**: Clean up test data after test completion
5. **Isolation**: Ensure tests don't interfere with each other 