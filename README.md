# Cli based Notes app 

A minimal terminal-first notes app for experiments & thinking.

> This tool should feel like opening a notebook, not configuring a system.

## Philosophy

- **Writing should be instant and distraction-free**
- **Organization is chronological, not hierarchical**
- **Time is the primary index, search is secondary**
- **No tags, no folders, no configuration**

## Quick Start

```bash
pnpm install
pnpm dev
```

Launch the app → you're in today's note. That's it.

## Two Modes Only

| Mode | Purpose |
|------|---------|
| **NORMAL** | Navigate, issue commands, read |
| **INSERT** | Write and edit text |

No other modes exist. Views may change (editor, search results), but the mode does not.

## Commands

Commands are human-readable, verb-first, invoked with `:` from Normal mode.

### Navigation

| Command | Alias | Action |
|---------|-------|--------|
| `:next` | `:n` | Go to next day |
| `:prev` | `:p` | Go to previous day |
| `:today` | `:t` | Go to today |
| `:open <date>` | `:o` | Open specific date |
| `:open yesterday` | | Natural language works |
| `:open tomorrow` | | Natural language works |

### In-Note Navigation

| Command | Action |
|---------|--------|
| `:goto <heading>` | Jump to heading (e.g., `:goto Experiments`) |

### Search

| Command | Alias | Action |
|---------|-------|--------|
| `:search <query>` | `:s` | Full-text search all notes |

### File Operations

| Command | Alias | Action |
|---------|-------|--------|
| `:write` | `:w` | Save current note |
| `:quit` | `:q` | Quit (auto-saves) |
| `:wq` | | Save and quit |
| `:help` | `:?` | Show available commands |

## Quick Aliases (Optional Accelerators)

For power users, these shortcuts exist but are **not required**:

| Key | Action |
|-----|--------|
| `h` | Previous day (alias for `:prev`) |
| `l` | Next day (alias for `:next`) |
| `/` | Opens `:search ` prompt |
| `i` | Enter Insert mode |
| `Esc` | Return to Normal mode |
| `Ctrl+S` | Save |
| `Ctrl+C` | Quit |

A beginner can use the app without ever touching single-letter commands.

## Cursor Navigation (Normal Mode)

| Key | Action |
|-----|--------|
| `j` / `↓` | Move down |
| `k` / `↑` | Move up |
| `←` / `→` | Move left/right |
| `0` | Start of line |
| `$` | End of line |
| `g` | Start of file |
| `G` | End of file |

## Data Storage

Notes are stored as plain markdown files:

```
~/.memoir/notes/
├── 2025-12-15.md
├── 2025-12-16.md
└── 2025-12-17.md
```

One file per day. No database. No complexity.

## Daily Note Template

New notes start with:

```markdown
# 2025-12-17

## Thoughts


## Experiments


## Learnings


## Quotes

```

These sections are suggestions. Delete, reorder, or ignore them freely.

## Design Principles

- **Beginner-friendly first. Expert-efficient eventually.**
- Readable commands are the default
- Compact shortcuts are optional accelerators
- Vim inspiration, not Vim cosplay
- Views may change, modes do not
- Clarity beats cleverness

## What This App Doesn't Have

By design:

- ❌ Tags
- ❌ Folders
- ❌ Dashboards
- ❌ Graph views
- ❌ Task management
- ❌ Sync
- ❌ Configuration

Any feature that increases setup, maintenance, or decision-making is a failure.

## License

MIT
