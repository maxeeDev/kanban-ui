# Architecture

## Overview

`kanban-ui` is a private Angular 21 single-page application for managing a personal Kanban board. The product scope is intentionally narrow: four fixed columns, low-friction card editing, and reliable local persistence without introducing a backend.

The board is optimized for personal use rather than team collaboration. That design choice keeps the implementation simple, removes authentication and sync concerns, and allows the app to run entirely in the browser.

## Functional Scope

The current implementation supports:

- Four fixed columns: Backlog, Waiting, In Progress, Done
- Create, edit, delete, and move cards
- Reordering cards inside the same column
- Moving cards between columns with drag and drop
- Clearing all closed cards from storage
- English and German UI copy
- Browser-local backup and optional linked-file persistence

## Architecture Decisions

### 1. Feature-owned state

Board state is centralized in `BoardStateService`.

Reasons:

- One place to manage card mutations
- One place to coordinate persistence
- Easier to keep presentational components small
- Clear separation between state, UI, and browser APIs

### 2. Fixed workflow instead of configurable columns

The board uses a fixed classical flow rather than user-defined columns.

Reasons:

- Matches the project goal exactly
- Keeps the data model simple
- Avoids additional settings, migration logic, and UI complexity

### 3. Dual persistence strategy

Persistence intentionally has two layers:

1. `localStorage` as the always-available local backup
2. Optional JSON file persistence through the File System Access API

Reasons:

- `localStorage` gives a zero-setup fallback
- A linked file gives the user explicit control over where the board is stored
- Keeping both avoids data loss when file access is unavailable later

## Key Modules

### `board.page.*`

The feature shell.

Responsibilities:

- Display board summary and actions
- Switch language
- Open and close the task editor
- Trigger file link and reload actions
- Trigger bulk cleanup for done cards

### `services/board-state.service.ts`

The state coordinator.

Responsibilities:

- Hold the board signal
- Expose computed column views and summary counts
- Create, update, delete, move, and clear cards
- Restore state on startup
- Persist changes to backup storage and linked file

### `services/board-file-storage.service.ts`

The browser file persistence adapter.

Responsibilities:

- Link a JSON file chosen by the user
- Read board data from the linked file
- Write the current board to that file
- Store the file handle in IndexedDB for reuse

Important detail:

- The JSON file path is chosen by the user through the browser save dialog.
- The app does not hardcode a filesystem path.
- IndexedDB stores the handle reference, not the board data itself.

### `services/board-i18n.service.ts`

Small app-specific translation layer.

Responsibilities:

- Track active locale
- Restore locale from `localStorage`
- Provide translated UI copy for English and German

### `components/board-column/*`

Column container and drop target.

Responsibilities:

- Render a translated column title and card count
- Accept drag and drop from all columns
- Emit add-card and edit-card actions upward

### `components/board-card/*`

Card presentation.

Responsibilities:

- Render title, description, and updated date
- Stay width-safe inside responsive columns

### `components/task-editor/*`

Card create and edit UI.

Responsibilities:

- Manage the reactive form for title and description
- Emit save, delete, and cancel actions

## Data Model

The board uses normalized state:

- `cards`: dictionary keyed by card id
- `columns`: each column stores ordered `cardIds`
- `lastUpdatedAt`: timestamp for persistence and diagnostics

This model keeps drag-and-drop updates straightforward and avoids duplicated card payloads across columns.

## Rendering Model

The UI is driven from signals and computed values.

Key consequences:

- Minimal manual subscription management
- Clear derivation of rendered column views from normalized state
- Low component complexity for a single-feature application

## Styling Approach

The visual direction is intentionally restrained:

- Neutral palette
- Soft surfaces and shadows
- Strong spacing and readable typography
- Responsive columns without aggressive color coding

This matches the product goal of a private, calm planning tool rather than a highly decorated collaboration dashboard.

## Validation Workflow

The repo-level validation flow for meaningful changes is:

```bash
npm run build
npm run lint
```

Unit tests are available through the Angular scaffold, but they are not part of the required completion flow for the project at this stage.

## Known Constraints

- File persistence depends on browser support for the File System Access API.
- The app has no backend sync, multi-user collaboration, or server-side storage.
- The current model assumes the four-column workflow is fixed.

## Future Extensions

Likely next improvements:

- Import board from an arbitrary JSON file
- Confirmation step before bulk deletion
- Card metadata such as tags or due dates
- Search and filtering
- Optional export and snapshot management
