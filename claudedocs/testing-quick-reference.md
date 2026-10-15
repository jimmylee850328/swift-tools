# Testing Quick Reference

## Daily Commands

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Run specific test file
npm test -- ArrayDiff.test.tsx

# Run tests matching name pattern
npm test -- --testNamePattern="should parse"
```

## Test File Template

```typescript
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import YourComponent from '../page'

// Helper for Monaco Editor
const setEditorValue = (editor: HTMLElement, value: string) => {
  fireEvent.change(editor, { target: { value } })
}

describe('YourComponent', () => {
  describe('Feature Name', () => {
    it('should do something', async () => {
      render(<YourComponent />)

      // Arrange
      const element = screen.getByTestId('element-id')

      // Act
      setEditorValue(element, 'test value')

      // Assert
      await waitFor(() => {
        expect(element.value).toContain('expected')
      })
    })
  })
})
```

## Common Patterns

### Get Elements
```typescript
// By test ID (Monaco editors)
const editor = screen.getByTestId('monaco-editor')

// By text content
const button = screen.getByText(/Click Me/)

// By role
const link = screen.getByRole('link')

// By display value
const select = screen.getByDisplayValue(/Default Option/)

// Multiple elements
const editors = screen.getAllByTestId('monaco-editor')
```

### User Interactions
```typescript
const user = userEvent.setup()

// Click
await user.click(button)

// Select dropdown
await user.selectOptions(select, 'optionValue')

// Type (use setEditorValue for Monaco)
setEditorValue(editor, '[1, 2, 3]')
```

### Async Assertions
```typescript
// Wait for condition
await waitFor(() => {
  expect(element).toHaveValue('expected')
})

// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText(/Success/)).toBeInTheDocument()
})
```

### Mock Clipboard
```typescript
const writeTextMock = jest.fn().mockResolvedValue(undefined)

Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: writeTextMock },
  writable: true,
  configurable: true,
})

// Later verify
expect(writeTextMock).toHaveBeenCalledWith('expected text')
```

## Test Organization

### Directory Structure
```
src/app/tools/your-tool/
├── page.tsx
└── __tests__/
    ├── YourTool.test.tsx
    └── integration.test.tsx (optional)
```

### Test Suite Structure
```typescript
describe('ComponentName', () => {
  describe('Feature Group 1', () => {
    it('specific behavior 1', () => {})
    it('specific behavior 2', () => {})
  })

  describe('Feature Group 2', () => {
    it('specific behavior 3', () => {})
  })
})
```

## Coverage Thresholds

Current thresholds in `jest.config.js`:
```javascript
coverageThreshold: {
  './src/app/tools/array-diff/page.tsx': {
    branches: 75,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

Add new thresholds as you create tests for other components.

## Debugging Tests

### Run single test in watch mode
```bash
npm run test:watch -- ArrayDiff.test.tsx
```

### Focus on one test
```typescript
it.only('should test this one thing', () => {
  // Only this test runs
})
```

### Skip a test
```typescript
it.skip('should test this later', () => {
  // This test is skipped
})
```

### Debug output
```typescript
import { screen } from '@testing-library/react'

// See entire DOM
screen.debug()

// See specific element
screen.debug(element)
```

## Common Issues

### Issue: "Cannot find element"
**Solution**: Use `waitFor()` for elements that appear after async operations
```typescript
await waitFor(() => {
  expect(screen.getByText(/Text/)).toBeInTheDocument()
})
```

### Issue: "userEvent.type() fails with special chars"
**Solution**: Use `setEditorValue()` helper for Monaco editors
```typescript
setEditorValue(editor, '[1, 2, 3]')  // Works
```

### Issue: "Label not associated with form control"
**Solution**: Use `getByDisplayValue()` instead of `getByLabelText()`
```typescript
const select = screen.getByDisplayValue(/Current Value/)
```

### Issue: "Navigator clipboard not available"
**Solution**: Mock clipboard API properly
```typescript
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: jest.fn() },
  writable: true,
  configurable: true,
})
```

## CI/CD Integration

### GitHub Actions Example
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
      - run: npm test
      - run: npm run test:coverage
```

## Best Practices

1. ✅ **Test behavior, not implementation**
2. ✅ **Use accessible queries** (getByRole, getByLabelText when possible)
3. ✅ **Wait for async operations** with `waitFor()`
4. ✅ **Mock external dependencies** (APIs, heavy libraries)
5. ✅ **Keep tests focused** (one concept per test)
6. ✅ **Use descriptive test names** (should/when/given format)
7. ✅ **Arrange-Act-Assert pattern** (setup → action → verification)

## Resources

- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [User Event Docs](https://testing-library.com/docs/user-event/intro)
- Project: `claudedocs/testing-setup-guide.md` (full setup)
- Project: `claudedocs/testing-implementation-summary.md` (implementation details)
