# Array Diff Component - Manual Test Plan

## Test Environment
- Component: `/src/app/tools/array-diff/page.tsx`
- Test Date: 2025-10-22
- Recent Changes: Performance optimizations with useCallback hooks

## Critical Functionality Tests

### 1. Input Parsing Tests

#### Test 1.1: JSON Array Input
**Input**:
```
First Array: [1, 2, 3, 4, 5]
Second Array: [3, 4, 5, 6, 7]
```
**Expected**: Arrays parsed correctly, diff computed
**Validation**: No parse errors

#### Test 1.2: Comma-Separated Input
**Input**:
```
First Array: 1, 2, 3, 4, 5
Second Array: 3, 4, 5, 6, 7
```
**Expected**: Auto-wrapped in brackets, parsed correctly
**Validation**: Same result as Test 1.1

#### Test 1.3: Line-Separated Input
**Input**:
```
First Array:
1
2
3
Second Array:
2
3
4
```
**Expected**: Parsed as separate items
**Validation**: Diff shows [1] vs [4]

#### Test 1.4: Large Numbers (Precision Test)
**Input**:
```
First Array: [9007199254740991, 9007199254740992]
Second Array: [9007199254740992, 9007199254740993]
```
**Expected**: Numbers preserved as strings, no precision loss
**Validation**: Output shows exact numbers without scientific notation

#### Test 1.5: String Values
**Input**:
```
First Array: ["apple", "banana", "cherry"]
Second Array: ["banana", "cherry", "date"]
```
**Expected**: String comparison works correctly
**Validation**: Shows ["apple"] vs ["date"]

#### Test 1.6: Mixed Types
**Input**:
```
First Array: [1, "2", 3]
Second Array: ["1", 2, "3"]
```
**Expected**: Type-aware comparison (1 !== "1")
**Validation**: All items treated as different

### 2. Diff Mode Tests

#### Test 2.1: Only in First Array
**Setup**:
```
First: [1, 2, 3, 4]
Second: [3, 4, 5, 6]
Mode: "僅顯示第一個陣列獨有元素"
```
**Expected Output**: `[1, 2]`
**Validation**: Only items unique to first array

#### Test 2.2: Only in Second Array
**Setup**: Same arrays, Mode: "僅顯示第二個陣列獨有元素"
**Expected Output**: `[5, 6]`
**Validation**: Only items unique to second array

#### Test 2.3: Both Different
**Setup**: Same arrays, Mode: "顯示兩者不同的元素"
**Expected Output**: `[1, 2, 5, 6]`
**Validation**: Combines both unique sets

### 3. Output Format Tests

#### Test 3.1: Auto Format (Numbers)
**Input**: Numeric arrays
**Output Mode**: "自動判斷"
**Expected**: Number format (no quotes)
```json
[
  1,
  2
]
```

#### Test 3.2: Auto Format (Strings)
**Input**: String arrays
**Output Mode**: "自動判斷"
**Expected**: String format (with quotes)
```json
[
  "apple",
  "banana"
]
```

#### Test 3.3: Force Number Format
**Input**: Mixed content
**Output Mode**: "數字格式"
**Expected**: No quotes regardless of content

#### Test 3.4: Force String Format
**Input**: Numeric arrays
**Output Mode**: "字串格式"
**Expected**: Quotes added to all items

### 4. Edge Cases

#### Test 4.1: Empty Arrays
**Input**: Both arrays empty
**Expected**: `[]`
**Validation**: No errors, empty result

#### Test 4.2: One Empty Array
**Input**: First array has items, second is empty
**Expected**: All items from first array (mode dependent)
**Validation**: Handles asymmetric comparison

#### Test 4.3: Identical Arrays
**Input**: Both arrays identical
**Expected**: `[]` for all modes
**Validation**: Correctly identifies no differences

#### Test 4.4: Duplicate Items in Single Array
**Input**:
```
First: [1, 1, 2, 2]
Second: [2, 3]
```
**Expected**: Deduplication via Set logic
**Validation**: [1] shown once, not twice

#### Test 4.5: Special Characters
**Input**: Arrays with special characters (emoji, unicode)
**Expected**: Preserved correctly
**Validation**: No encoding issues

#### Test 4.6: Very Large Arrays
**Input**: 1000+ items in each array
**Expected**: Computation completes within 2 seconds
**Validation**: Performance acceptable, no browser freeze

### 5. UI Interaction Tests

#### Test 5.1: Real-time Updates
**Action**: Type in first array editor
**Expected**: Result updates automatically via useEffect
**Validation**: No manual "calculate" click needed

#### Test 5.2: Mode Switching
**Action**: Change diff mode dropdown
**Expected**: Result recalculates immediately
**Validation**: Instant feedback

#### Test 5.3: Output Format Switching
**Action**: Change output format dropdown
**Expected**: Result reformats without recalculation
**Validation**: Format changes only, not logic

#### Test 5.4: Copy to Clipboard
**Action**: Click "複製結果" button
**Expected**: Clipboard contains result, "已複製！" shows for 2s
**Validation**: Toast feedback, clipboard verification

#### Test 5.5: Download File
**Action**: Click "下載結果" button
**Expected**: File downloads with custom filename
**Validation**: File contains exact result text

#### Test 5.6: Custom Filename
**Action**: Edit filename field, then download
**Expected**: Downloaded file uses custom name
**Validation**: Filename field functional

#### Test 5.7: Help Toggle
**Action**: Click help icon (?)
**Expected**: Help section expands/collapses
**Validation**: Instructions visible

#### Test 5.8: Back Navigation
**Action**: Click back arrow
**Expected**: Navigate to home page
**Validation**: Link functional

### 6. Performance Tests (Post-Optimization)

#### Test 6.1: Re-render Count
**Setup**: React DevTools Profiler
**Action**: Type single character in first array
**Expected**: Minimal re-renders (only affected components)
**Validation**: useCallback prevents unnecessary renders

#### Test 6.2: Memory Leak Test
**Action**: Download 10 files consecutively
**Setup**: Chrome DevTools Memory tab
**Expected**: No memory accumulation
**Validation**: URL.revokeObjectURL working

#### Test 6.3: Large Number Processing
**Input**: 10,000 items in each array
**Expected**: < 1 second processing time
**Validation**: Set-based algorithm efficiency

### 7. Error Handling Tests

#### Test 7.1: Invalid JSON
**Input**: Malformed JSON like `[1, 2, 3`
**Expected**: Falls back to comma-separated parsing
**Validation**: No error message, graceful degradation

#### Test 7.2: Unsupported Characters
**Input**: Control characters, null bytes
**Expected**: Handled or filtered appropriately
**Validation**: No crashes

#### Test 7.3: Copy Failure Simulation
**Setup**: Revoke clipboard permissions
**Action**: Click copy button
**Expected**: Error message displayed
**Validation**: User notified of failure

## Regression Tests (Compare with Previous Version)

### Regression 1: Functionality Parity
**Test**: All previous inputs produce identical outputs
**Validation**: No behavioral changes from refactoring

### Regression 2: UI Consistency
**Test**: All buttons, dropdowns, editors function identically
**Validation**: User experience unchanged

### Regression 3: Build Compatibility
**Test**: Production build succeeds
**Status**: ✅ Verified (build passed)

## Test Results Summary

### Execution Checklist
- [ ] Test 1: Input Parsing (6 tests)
- [ ] Test 2: Diff Modes (3 tests)
- [ ] Test 3: Output Formats (4 tests)
- [ ] Test 4: Edge Cases (6 tests)
- [ ] Test 5: UI Interactions (8 tests)
- [ ] Test 6: Performance (3 tests)
- [ ] Test 7: Error Handling (3 tests)
- [ ] Regression Tests (3 tests)

**Total Tests**: 36 test cases

### Pass/Fail Tracking
```
Test Suite: _______________
Passed: ___ / 36
Failed: ___ / 36
Blocked: ___ / 36
```

### Known Issues
(Document any failures here)

### Performance Metrics
- Average processing time (1000 items): _______ms
- Re-render count per keystroke: _______
- Memory usage after 10 downloads: _______MB

## Recommendations for Automated Testing

### Suggested Test Framework
**Jest + React Testing Library**

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### Priority Unit Tests
1. `parseInputArray()` - Input parsing logic
2. `computeDiff()` - Core diff algorithm
3. `formatOutput()` - Output formatting
4. `areAllNumbers()` - Type detection

### Priority Integration Tests
1. Complete user workflow: input → diff → copy
2. Mode switching with different inputs
3. Format switching preserving logic

### E2E Test Scenarios (Playwright)
1. Full tool usage from home page navigation
2. Large dataset performance
3. Cross-browser clipboard functionality
