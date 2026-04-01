# Kanban UI

Private, classical Kanban board built with Angular 21.

The app keeps a fixed four-column flow:

- Backlog
- Waiting
- In Progress
- Done

It is designed for personal use, stays visually restrained, supports drag and drop, persists board state across reloads, and can optionally save to a user-linked JSON file on disk while still keeping a local browser backup.

## Features

- Classical Kanban workflow with four fixed columns.
- Create, edit, delete, and reorder cards.
- Drag cards within a column and between columns.
- Local persistence through `localStorage`.
- Optional file persistence through a linked JSON file on your machine.
- Automatic local backup even when a board file is linked.
- English and German UI.
- Responsive layout with restrained neutral styling.

## Tech Stack

- Angular 21
- TypeScript
- Angular CDK drag and drop
- SCSS
- Signals and computed state
- IndexedDB for storing the linked file handle

## Storage Model

The board uses two persistence layers:

1. Browser-local backup in `localStorage` under `kanban-ui.board.v1`.
2. Optional JSON file persistence through the browser File System Access API.

If you link a board file from the UI, the app writes updates to that file and also keeps the browser-local backup in sync. On startup, the app tries to restore from the linked file first and falls back to the local backup if no readable linked file is available.

The JSON file is not written to a hardcoded folder. It is saved wherever you choose it in the browser file picker when you use `Link board file`.

## Browser Support

The local backup works in any modern browser with `localStorage` support.

File-based persistence depends on the File System Access API, which is primarily available in Chromium-based browsers and works reliably on `localhost` during development. If the API is unavailable or file permission is not granted, the app continues to use the browser-local backup.

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm 11 or newer

### Install

```bash
npm install
```

### Run the app

```bash
npm start
```

The development server runs on [http://localhost:4300](http://localhost:4300).

## Available Scripts

```bash
npm start
npm run build
npm run lint
npm run format
npm run test
```

Notes:

- `npm run build` creates the production build in `dist/kanban-ui`.
- `npm run lint` uses `oxlint`.
- `npm run format` runs Prettier over the repository.
- `npm run test` is available from the Angular scaffold, but unit testing is not part of the required validation flow for this project.

## Project Structure

```text
src/
	app/
		app.routes.ts
		features/
			board/
				board.page.*
				components/
					board-card/
					board-column/
					task-editor/
				models/
				services/
				utils/
```

## Architecture Notes

- Board state is centralized in a single feature-owned service.
- Presentational components stay focused on rendering and emitting user actions.
- Persistence is coordinated in the state layer, not inside the column or card components.
- Translation is handled through a small board-specific i18n service.

More detail is available in [docs/architecture.md](docs/architecture.md).

## Validation

The current working validation flow is:

```bash
npm run build
npm run lint
```

## Roadmap Ideas

- Import an existing board JSON without relinking.
- Confirmation flow for destructive bulk actions.
- Card labels, due dates, or filtering.
- Optional export history or board snapshots.

## License

No license has been added to this repository yet.
