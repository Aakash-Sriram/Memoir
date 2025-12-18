# Contributing to Memoir

Thank you for your interest in contributing to Memoir! This document provides guidelines and instructions for contributing.

## Philosophy

Before contributing, please understand Memoir's core principles:

- **Zero configuration** - No config files, no setup wizards
- **Two modes only** - NORMAL and INSERT, nothing else
- **Chronological organization** - Time is the index, not folders or tags
- **Plain text storage** - Markdown files, human-readable, portable

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm

### Getting Started

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/memoir.git
cd memoir

# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build the project
pnpm build

# Link globally for testing
pnpm link --global
```

## Project Structure

```text
src/
├── index.tsx          # Entry point, CLI argument handling
├── app.tsx            # Main React component, state management
├── types.ts           # TypeScript types and interfaces
├── components/
│   ├── AutocompleteList.tsx  # Command autocomplete dropdown
│   ├── Editor.tsx     # Text editor display
│   ├── SearchResults.tsx  # Search results view
│   └── StatusBar.tsx  # Mode and command display
├── hooks/
│   └── useKeyboard.ts # Keyboard input handling
└── lib/
    ├── autocomplete.ts    # Command/argument autocomplete logic
    ├── autocomplete.test.ts
    ├── clipboard.ts   # System clipboard with fallback
    ├── commands.ts    # Command parsing and execution
    ├── commands.test.ts
    ├── dates.ts       # Date utilities (date-fns)
    ├── dates.test.ts
    └── storage.ts     # File I/O operations
```

## Making Changes

### Code Style

- TypeScript strict mode
- ESM modules (`.js` extensions in imports)
- Functional React components with hooks
- Descriptive variable and function names

### Commit Messages

Use clear, descriptive commit messages:

```text
feat: add :open command with natural language dates
fix: correct cursor position after line deletion
docs: update README with new commands
refactor: simplify keyboard handling logic
```

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run `pnpm build` to ensure it compiles
5. Test your changes manually
6. Commit with a clear message
7. Push and open a Pull Request

## What We're Looking For

### Good Contributions

- Bug fixes with clear reproduction steps
- Performance improvements
- Accessibility enhancements
- Documentation improvements
- New commands that fit the philosophy

### What We'll Likely Reject

- Configuration options (we have none by design)
- Additional modes beyond NORMAL/INSERT
- Complex organizational features (tags, folders, categories)
- External service integrations
- Features that require onboarding

## Testing

Memoir has automated tests using Vitest:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch
```

Manual testing is also recommended:

```bash
# Build and run the app
pnpm build
node dist/index.js

# Test commands
:next, :prev, :today
:goto <heading>          # Tab for autocomplete
:search <query>
:copy, :cut, :paste, :delete
:write, :quit
```

### Pull Request Checklist

1. Run `pnpm test` - all tests should pass
2. Run `pnpm build` - should compile without errors
3. Manually test any new features

## Questions?

Open an issue for discussion before starting major work. This helps ensure your contribution aligns with the project's direction.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
