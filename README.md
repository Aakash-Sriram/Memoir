# labbook

A minimal terminal-first notes app for experiments & thinking.

> This tool should feel like opening a notebook, not configuring a system.

## Philosophy

- **Writing should be instant and distraction-free**
- **Organization is chronological, not hierarchical**
- **Time is the primary index, search is secondary**
- **No tags, no folders, no configuration**

## Quick Start

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Or build and run
pnpm build
pnpm start
```

## Usage

Launch the app and you're immediately in today's note. That's it.

### Keyboard Controls

#### Normal Mode
| Key | Action |
|-----|--------|
| `i` | Enter insert mode |
| `a` | Enter insert mode after cursor |
| `o` | Insert new line below and enter insert mode |
| `/` | Search all notes |
| `h` | Go to previous day |
| `l` | Go to next day |
| `t` | Go to today |
| `g` | Go to specific date |
| `j` / `↓` | Move cursor down |
| `k` / `↑` | Move cursor up |
| `0` | Go to start of line |
| `$` | Go to end of line |
| `G` | Go to end of file |
| `w` | Save note |
| `q` | Quit (auto-saves) |

#### Insert Mode
| Key | Action |
|-----|--------|
| `Esc` | Return to normal mode |
| `Ctrl+S` | Save note |
| Arrow keys | Move cursor |

#### Search Mode
| Key | Action |
|-----|--------|
| `Enter` | Execute search |
| `Esc` | Cancel |

#### Results Mode
| Key | Action |
|-----|--------|
| `j` / `k` | Navigate results |
| `Enter` | Open selected result |
| `Esc` | Back to search |

## Data Storage

Notes are stored as plain markdown files in `~/.labbook/notes/`:

```
~/.labbook/notes/
├── 2025-12-15.md
├── 2025-12-16.md
└── 2025-12-17.md
```

Each day has exactly one file. No databases, no sync conflicts, no complexity.

## Daily Note Template

When you create a new day's note, it starts with:

```markdown
# 2025-12-17

## Thoughts


## Experiments


## Learnings


## Quotes

```

These sections are suggestions, not rules. Delete, reorder, or ignore them freely.

## Documenting Experiments

The tool naturally supports documenting experiments:

```markdown
## Experiments

EXP-003: Minimal Notes App
Hypothesis:
If I reduce friction in note-taking, I will write daily.

Status:
Building

Outcome:
TBD
```

## What This App Doesn't Have

By design, labbook does NOT include:

- Tags
- Folders
- Dashboards
- Graph views
- Task management
- Reminders
- Sync
- Accounts

Any feature that increases setup, maintenance, or decision-making is a failure.

## License

MIT
