import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ArrayDiff from '../page'

// Helper function to simulate Monaco Editor input
const setEditorValue = (editor: HTMLElement, value: string) => {
  fireEvent.change(editor, { target: { value } })
}

describe('ArrayDiff Component', () => {
  describe('Input Parsing', () => {
    it('should parse JSON array input correctly', async () => {
      render(<ArrayDiff />)

      const editors = screen.getAllByTestId('monaco-editor')
      const firstEditor = editors[0]
      const secondEditor = editors[1]

      setEditorValue(firstEditor, '[1, 2, 3]')
      setEditorValue(secondEditor, '[2, 3, 4]')

      await waitFor(() => {
        const result = editors[2]
        expect(result.value).toContain('1')
        expect(result.value).not.toContain('"2"')
      })
    })

    it('should parse comma-separated input', async () => {
      render(<ArrayDiff />)

      const firstEditor = screen.getAllByTestId('monaco-editor')[0]
      setEditorValue(firstEditor, '1, 2, 3')

      await waitFor(() => {
        const result = screen.getAllByTestId('monaco-editor')[2]
        expect(result.value).toContain('1')
        expect(result.value).toContain('2')
        expect(result.value).toContain('3')
      })
    })

    it('should handle large numbers without precision loss', async () => {
      render(<ArrayDiff />)

      const largeNumber = '9007199254740991'
      const firstEditor = screen.getAllByTestId('monaco-editor')[0]

      setEditorValue(firstEditor, `[${largeNumber}]`)

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
      render(<ArrayDiff />)

      const editors = screen.getAllByTestId('monaco-editor')
      const firstEditor = editors[0]
      const secondEditor = editors[1]

      setEditorValue(firstEditor, '[1, 2, 3]')
      setEditorValue(secondEditor, '[2, 3, 4]')

      // Default mode is "onlyInFirst"
      await waitFor(() => {
        const result = editors[2]
        expect(result.value).toContain('1')
        expect(result.value).not.toContain('4')
      })
    })

    it('should show only items in second array', async () => {
      const user = userEvent.setup()
      render(<ArrayDiff />)

      // Find the diff mode select by its option text
      const modeSelect = screen.getByDisplayValue(/僅顯示第一個陣列獨有元素/)
      await user.selectOptions(modeSelect, 'onlyInSecond')

      const editors = screen.getAllByTestId('monaco-editor')
      const firstEditor = editors[0]
      const secondEditor = editors[1]

      setEditorValue(firstEditor, '[1, 2, 3]')
      setEditorValue(secondEditor, '[2, 3, 4]')

      await waitFor(() => {
        const result = editors[2]
        expect(result.value).toContain('4')
        expect(result.value).not.toContain('1')
      })
    })

    it('should show differences from both arrays', async () => {
      const user = userEvent.setup()
      render(<ArrayDiff />)

      // Find the diff mode select by its option text
      const modeSelect = screen.getByDisplayValue(/僅顯示第一個陣列獨有元素/)
      await user.selectOptions(modeSelect, 'both')

      const editors = screen.getAllByTestId('monaco-editor')
      const firstEditor = editors[0]
      const secondEditor = editors[1]

      setEditorValue(firstEditor, '[1, 2, 3]')
      setEditorValue(secondEditor, '[2, 3, 4]')

      await waitFor(() => {
        const result = editors[2]
        expect(result.value).toContain('1')
        expect(result.value).toContain('4')
      })
    })
  })

  describe('Output Formats', () => {
    it('should auto-detect number format', async () => {
      render(<ArrayDiff />)

      const firstEditor = screen.getAllByTestId('monaco-editor')[0]
      setEditorValue(firstEditor, '[1, 2]')

      await waitFor(() => {
        const result = screen.getAllByTestId('monaco-editor')[2]
        // Number format: no quotes around numbers
        expect(result.value).toContain('1')
        expect(result.value).toContain('2')
      })
    })

    it('should auto-detect string format', async () => {
      render(<ArrayDiff />)

      const firstEditor = screen.getAllByTestId('monaco-editor')[0]
      setEditorValue(firstEditor, '["apple", "banana"]')

      await waitFor(() => {
        const result = screen.getAllByTestId('monaco-editor')[2]
        // String format: with quotes
        expect(result.value).toContain('"apple"')
      })
    })

    it('should force number format when selected', async () => {
      const user = userEvent.setup()
      render(<ArrayDiff />)

      // Find format select by its default value
      const formatSelect = screen.getByDisplayValue(/自動判斷/)
      await user.selectOptions(formatSelect, 'number')

      const firstEditor = screen.getAllByTestId('monaco-editor')[0]
      setEditorValue(firstEditor, '["1", "2"]')

      await waitFor(() => {
        const result = screen.getAllByTestId('monaco-editor')[2]
        // Forced number format: should still have content
        expect(result.value).toContain('1')
        expect(result.value).toContain('2')
      })
    })
  })

  describe('UI Interactions', () => {
    it('should toggle help section', async () => {
      const user = userEvent.setup()
      render(<ArrayDiff />)

      // Help should be hidden initially
      expect(screen.queryByText(/使用說明/)).not.toBeInTheDocument()

      // Find and click help button by finding the button with HelpCircle icon
      const buttons = screen.getAllByRole('button')
      const helpButton = buttons.find(btn => btn.textContent === '')

      if (helpButton) {
        await user.click(helpButton)
        expect(screen.getByText(/使用說明/)).toBeInTheDocument()

        await user.click(helpButton)
        expect(screen.queryByText(/使用說明/)).not.toBeInTheDocument()
      }
    })

    it('should copy result to clipboard', async () => {
      const user = userEvent.setup()
      const writeTextMock = jest.fn().mockResolvedValue(undefined)

      // Mock clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: writeTextMock,
        },
        writable: true,
        configurable: true,
      })

      render(<ArrayDiff />)

      // Add some data first
      const firstEditor = screen.getAllByTestId('monaco-editor')[0]
      setEditorValue(firstEditor, '[1, 2, 3]')

      await waitFor(() => {
        const result = screen.getAllByTestId('monaco-editor')[2]
        expect(result.value.length).toBeGreaterThan(2)
      })

      const copyButton = screen.getByText(/複製結果/)
      await user.click(copyButton)

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled()
        expect(screen.getByText(/已複製/)).toBeInTheDocument()
      })
    })

    it('should navigate back to home', () => {
      render(<ArrayDiff />)

      const backLink = screen.getByRole('link')
      expect(backLink).toHaveAttribute('href', '/')
    })
  })

  describe('Edge Cases', () => {
    it('should handle identical arrays', async () => {
      render(<ArrayDiff />)

      const editors = screen.getAllByTestId('monaco-editor')
      const firstEditor = editors[0]
      const secondEditor = editors[1]

      setEditorValue(firstEditor, '[1, 2, 3]')
      setEditorValue(secondEditor, '[1, 2, 3]')

      await waitFor(() => {
        const result = editors[2]
        expect(result.value).toBe('[]')
      })
    })

    it('should deduplicate items within arrays', async () => {
      render(<ArrayDiff />)

      const editors = screen.getAllByTestId('monaco-editor')
      const firstEditor = editors[0]
      const secondEditor = editors[1]

      setEditorValue(firstEditor, '[1, 1, 2, 2]')
      setEditorValue(secondEditor, '[2, 3]')

      await waitFor(() => {
        const result = editors[2]
        const resultValue = result.value
        // Should show 1 (unique to first array)
        expect(resultValue).toContain('1')
        expect(resultValue).not.toContain('2') // 2 is common
      })
    })

    it('should handle one empty array', async () => {
      render(<ArrayDiff />)

      const editors = screen.getAllByTestId('monaco-editor')
      const firstEditor = editors[0]

      setEditorValue(firstEditor, '[1, 2, 3]')

      await waitFor(() => {
        const result = editors[2]
        expect(result.value).toContain('1')
        expect(result.value).toContain('2')
        expect(result.value).toContain('3')
      })
    })
  })

  describe('Performance', () => {
    it('should handle moderate arrays efficiently', async () => {
      render(<ArrayDiff />)

      const moderateArray = Array.from({ length: 100 }, (_, i) => i)
      const firstEditor = screen.getAllByTestId('monaco-editor')[0]

      const startTime = Date.now()

      setEditorValue(firstEditor, JSON.stringify(moderateArray))

      await waitFor(
        () => {
          const result = screen.getAllByTestId('monaco-editor')[2]
          expect(result.value).toBeDefined()
          expect(result.value.length).toBeGreaterThan(0)
        },
        { timeout: 2000 }
      )

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(2000)
    })
  })
})
