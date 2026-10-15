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
