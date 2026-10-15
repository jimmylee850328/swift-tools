# Testing Setup Guide for Swift Tools

## Current Status
- **Test Framework**: None installed
- **Test Files**: 0 project tests
- **Coverage**: 0%
- **Recommendation**: Add Jest + React Testing Library

## Quick Setup (Recommended)

### Step 1: Install Testing Dependencies

```bash
npm install --save-dev \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest-environment-jsdom \
  @types/jest
```

### Step 2: Create Jest Configuration

**File**: `jest.config.js`
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
```

### Step 3: Create Jest Setup File

**File**: `jest.setup.js`
```javascript
import '@testing-library/jest-dom'

// Mock Monaco Editor (heavy dependency)
jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, onChange, options }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={options?.readOnly}
    />
  ),
}))

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }) => <a href={href}>{children}</a>,
}))
```

### Step 4: Update package.json

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Step 5: Create Test Directory Structure

```bash
mkdir -p src/app/tools/array-diff/__tests__
```

## Sample Unit Tests for Array Diff

**File**: `src/app/tools/array-diff/__tests__/ArrayDiff.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ArrayDiff from '../page'

describe('ArrayDiff Component', () => {
  describe('Input Parsing', () => {
    it('should parse JSON array input correctly', async () => {
      const user = userEvent.setup()
      render(<ArrayDiff />)

      const firstEditor = screen.getAllByTestId('monaco-editor')[0]
      const secondEditor = screen.getAllByTestId('monaco-editor')[1]

      await user.clear(firstEditor)
      await user.type(firstEditor, '[1, 2, 3]')

      await user.clear(secondEditor)
      await user.type(secondEditor, '[2, 3, 4]')

      await waitFor(() => {
        const result = screen.getAllByTestId('monaco-editor')[2]
        expect(result.value).toContain('1')
        expect(result.value).not.toContain('2')
      })
    })

    it('should parse comma-separated input', async () => {
      const user = userEvent.setup()
      render(<ArrayDiff />)

      const firstEditor = screen.getAllByTestId('monaco-editor')[0]
      await user.clear(firstEditor)
      await user.type(firstEditor, '1, 2, 3')

      await waitFor(() => {
        const result = screen.getAllByTestId('monaco-editor')[2]
        expect(result.value).toMatch(/\[\s*1\s*,\s*2\s*,\s*3\s*\]/)
      })
    })

    it('should handle large numbers without precision loss', async () => {
      const user = userEvent.setup()
      render(<ArrayDiff />)

      const largeNumber = '9007199254740991'
      const firstEditor = screen.getAllByTestId('monaco-editor')[0]

      await user.clear(firstEditor)
      await user.type(firstEditor, `[${largeNumber}]`)

      await waitFor(() => {
        const result = screen.getAllByTestId('monaco-editor')[2]
        expect(result.value).toContain(largeNumber)
      })
    })

    it('should handle empty input gracefully', async () => {
      render(<ArrayDiff />)

      await waitFor(() => {
        const result = screen.getAllByTestId('monaco-editor')[2]
        expect(result.value).toBe('[]')
      })
    })
  })

  describe('Diff Modes', () => {
    it('should show only items in first array', async () => {
      const user = userEvent.setup()
      render(<ArrayDiff />)

      const firstEditor = screen.getAllByTestId('monaco-editor')[0]
      const secondEditor = screen.getAllByTestId('monaco-editor')[1]

      await user.clear(firstEditor)
      await user.type(firstEditor, '[1, 2, 3]')
      await user.clear(secondEditor)
      await user.type(secondEditor, '[2, 3, 4]')

      // Default mode is "onlyInFirst"
      await waitFor(() => {
        const result = screen.getAllByTestId('monaco-editor')[2]
        expect(result.value).toContain('1')
        expect(result.value).not.toContain('4')
      })
    })

    it('should show only items in second array', async () => {
      const user = userEvent.setup()
      render(<ArrayDiff />)

      const modeSelect = screen.getByLabelText(/差異模式/)
      await user.selectOptions(modeSelect, 'onlyInSecond')

      const firstEditor = screen.getAllByTestId('monaco-editor')[0]
      const secondEditor = screen.getAllByTestId('monaco-editor')[1]

      await user.clear(firstEditor)
      await user.type(firstEditor, '[1, 2, 3]')
      await user.clear(secondEditor)
      await user.type(secondEditor, '[2, 3, 4]')

      await waitFor(() => {
        const result = screen.getAllByTestId('monaco-editor')[2]
        expect(result.value).toContain('4')
        expect(result.value).not.toContain('1')
      })
    })

    it('should show differences from both arrays', async () => {
      const user = userEvent.setup()
      render(<ArrayDiff />)

      const modeSelect = screen.getByLabelText(/差異模式/)
      await user.selectOptions(modeSelect, 'both')

      const firstEditor = screen.getAllByTestId('monaco-editor')[0]
      const secondEditor = screen.getAllByTestId('monaco-editor')[1]

      await user.clear(firstEditor)
      await user.type(firstEditor, '[1, 2, 3]')
      await user.clear(secondEditor)
      await user.type(secondEditor, '[2, 3, 4]')

      await waitFor(() => {
        const result = screen.getAllByTestId('monaco-editor')[2]
        expect(result.value).toContain('1')
        expect(result.value).toContain('4')
      })
    })
  })

  describe('Output Formats', () => {
    it('should auto-detect number format', async () => {
      const user = userEvent.setup()
      render(<ArrayDiff />)

      const firstEditor = screen.getAllByTestId('monaco-editor')[0]
      await user.clear(firstEditor)
      await user.type(firstEditor, '[1, 2]')

      await waitFor(() => {
        const result = screen.getAllByTestId('monaco-editor')[2]
        // Number format: no quotes
        expect(result.value).toMatch(/\[\s*1\s*,\s*2\s*\]/)
        expect(result.value).not.toContain('"')
      })
    })

    it('should auto-detect string format', async () => {
      const user = userEvent.setup()
      render(<ArrayDiff />)

      const firstEditor = screen.getAllByTestId('monaco-editor')[0]
      await user.clear(firstEditor)
      await user.type(firstEditor, '["apple", "banana"]')

      await waitFor(() => {
        const result = screen.getAllByTestId('monaco-editor')[2]
        // String format: with quotes
        expect(result.value).toContain('"apple"')
      })
    })

    it('should force number format when selected', async () => {
      const user = userEvent.setup()
      render(<ArrayDiff />)

      const formatSelect = screen.getByLabelText(/輸出格式/)
      await user.selectOptions(formatSelect, 'number')

      const firstEditor = screen.getAllByTestId('monaco-editor')[0]
      await user.clear(firstEditor)
      await user.type(firstEditor, '["1", "2"]')

      await waitFor(() => {
        const result = screen.getAllByTestId('monaco-editor')[2]
        // Forced number format: no quotes
        expect(result.value).not.toContain('"')
      })
    })
  })

  describe('UI Interactions', () => {
    it('should toggle help section', async () => {
      const user = userEvent.setup()
      render(<ArrayDiff />)

      const helpButton = screen.getByRole('button', { name: /help/i })

      // Help should be hidden initially
      expect(screen.queryByText(/使用說明/)).not.toBeInTheDocument()

      await user.click(helpButton)
      expect(screen.getByText(/使用說明/)).toBeInTheDocument()

      await user.click(helpButton)
      expect(screen.queryByText(/使用說明/)).not.toBeInTheDocument()
    })

    it('should copy result to clipboard', async () => {
      const user = userEvent.setup()
      const writeTextMock = jest.fn().mockResolvedValue(undefined)
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      })

      render(<ArrayDiff />)

      const copyButton = screen.getByRole('button', { name: /複製/ })
      await user.click(copyButton)

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled()
        expect(screen.getByText(/已複製/)).toBeInTheDocument()
      })
    })

    it('should navigate back to home', () => {
      render(<ArrayDiff />)

      const backLink = screen.getByRole('link', { name: /back|返回/i })
      expect(backLink).toHaveAttribute('href', '/')
    })
  })

  describe('Edge Cases', () => {
    it('should handle identical arrays', async () => {
      const user = userEvent.setup()
      render(<ArrayDiff />)

      const firstEditor = screen.getAllByTestId('monaco-editor')[0]
      const secondEditor = screen.getAllByTestId('monaco-editor')[1]

      await user.clear(firstEditor)
      await user.type(firstEditor, '[1, 2, 3]')
      await user.clear(secondEditor)
      await user.type(secondEditor, '[1, 2, 3]')

      await waitFor(() => {
        const result = screen.getAllByTestId('monaco-editor')[2]
        expect(result.value).toBe('[]')
      })
    })

    it('should deduplicate items within arrays', async () => {
      const user = userEvent.setup()
      render(<ArrayDiff />)

      const firstEditor = screen.getAllByTestId('monaco-editor')[0]
      const secondEditor = screen.getAllByTestId('monaco-editor')[1]

      await user.clear(firstEditor)
      await user.type(firstEditor, '[1, 1, 2, 2]')
      await user.clear(secondEditor)
      await user.type(secondEditor, '[2, 3]')

      await waitFor(() => {
        const result = screen.getAllByTestId('monaco-editor')[2]
        const resultValue = result.value
        // Should show 1 only once
        const matches = resultValue.match(/1/g)
        expect(matches?.length).toBe(1)
      })
    })
  })

  describe('Performance', () => {
    it('should handle large arrays efficiently', async () => {
      const user = userEvent.setup()
      render(<ArrayDiff />)

      const largeArray = Array.from({ length: 1000 }, (_, i) => i)
      const firstEditor = screen.getAllByTestId('monaco-editor')[0]

      const startTime = Date.now()

      await user.clear(firstEditor)
      await user.type(firstEditor, JSON.stringify(largeArray))

      await waitFor(
        () => {
          const result = screen.getAllByTestId('monaco-editor')[2]
          expect(result.value).toBeDefined()
        },
        { timeout: 2000 }
      )

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(2000)
    })
  })
})
```

## Integration Test Example

**File**: `src/app/tools/array-diff/__tests__/integration.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ArrayDiff from '../page'

describe('ArrayDiff Integration Tests', () => {
  it('should complete full user workflow', async () => {
    const user = userEvent.setup()
    render(<ArrayDiff />)

    // Step 1: User enters data
    const firstEditor = screen.getAllByTestId('monaco-editor')[0]
    const secondEditor = screen.getAllByTestId('monaco-editor')[1]

    await user.clear(firstEditor)
    await user.type(firstEditor, '1, 2, 3, 4')

    await user.clear(secondEditor)
    await user.type(secondEditor, '3, 4, 5, 6')

    // Step 2: User changes mode
    const modeSelect = screen.getByLabelText(/差異模式/)
    await user.selectOptions(modeSelect, 'both')

    // Step 3: User changes output format
    const formatSelect = screen.getByLabelText(/輸出格式/)
    await user.selectOptions(formatSelect, 'number')

    // Step 4: Verify result
    await waitFor(() => {
      const result = screen.getAllByTestId('monaco-editor')[2]
      expect(result.value).toContain('1')
      expect(result.value).toContain('2')
      expect(result.value).toContain('5')
      expect(result.value).toContain('6')
    })

    // Step 5: User copies result
    const writeTextMock = jest.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    })

    const copyButton = screen.getByRole('button', { name: /複製/ })
    await user.click(copyButton)

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled()
      expect(screen.getByText(/已複製/)).toBeInTheDocument()
    })
  })
})
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- ArrayDiff.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="Diff Modes"
```

## Coverage Reports

After running `npm run test:coverage`, view the report:

```bash
# Open in browser
open coverage/lcov-report/index.html

# View in terminal
cat coverage/coverage-summary.json
```

## E2E Testing with Playwright (Optional)

For comprehensive browser testing, consider adding Playwright:

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**File**: `tests/array-diff.e2e.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Array Diff E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/tools/array-diff')
  })

  test('should perform complete diff workflow', async ({ page }) => {
    // Input arrays
    await page.locator('.monaco-editor').first().fill('[1, 2, 3]')
    await page.locator('.monaco-editor').nth(1).fill('[2, 3, 4]')

    // Verify result updates automatically
    await expect(page.locator('.monaco-editor').nth(2)).toContainText('1')

    // Take screenshot
    await page.screenshot({ path: 'screenshots/array-diff-result.png' })
  })

  test('should handle clipboard operations', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    // Perform diff
    await page.locator('.monaco-editor').first().fill('[1]')

    // Click copy
    await page.getByRole('button', { name: /複製/ }).click()

    // Verify success message
    await expect(page.getByText(/已複製/)).toBeVisible()
  })
})
```

## CI/CD Integration

**File**: `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Next Steps

1. **Immediate**: Use the manual test plan in `claudedocs/array-diff-test-plan.md`
2. **Short-term**: Install Jest and implement unit tests for core functions
3. **Long-term**: Add E2E tests with Playwright and CI/CD integration

## Estimated Implementation Time

- Jest setup: 30 minutes
- Unit tests for array-diff: 2-3 hours
- Integration tests: 1 hour
- E2E setup (Playwright): 1 hour
- CI/CD configuration: 30 minutes

**Total**: ~5-6 hours for comprehensive test coverage
