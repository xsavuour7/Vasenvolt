# Running Tests

## Installation

First, install the test dependencies:

```bash
npm install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Structure

Tests are organized as follows:

- `src/api/__tests__/` - API client tests
- `src/hooks/__tests__/` - React hooks tests
- `src/components/__tests__/` - Component tests
- `src/pages/__tests__/` - Page/Integration tests

## Test Coverage

The test suite covers:

1. **API Tests** (`meters.test.ts`)
   - Successful API calls
   - Error handling
   - Empty responses
   - Data structure validation

2. **Hook Tests** (`useMeters.test.ts`)
   - Data fetching
   - Site extraction logic
   - Loading states
   - Error handling
   - Data transformation

3. **Component Tests** (`SiteMeterFilters.test.tsx`)
   - Rendering states (loading, error, success)
   - User interactions
   - Filter logic
   - Meter filtering by site
   - Reset behavior

4. **Integration Tests** (`Dashboard.test.tsx`)
   - URL parameter reading
   - URL parameter updates
   - Filter synchronization
   - Metrics fetching
   - State management

## Manual Testing

See `TESTING.md` for detailed manual testing instructions.

## Troubleshooting

If tests fail:

1. Ensure all dependencies are installed: `npm install`
2. Check that the test environment is set up correctly
3. Verify mocks are properly configured
4. Check browser console for errors in component tests

