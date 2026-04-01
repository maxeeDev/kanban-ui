# Kanban-UI Agent Instructions

## Scope

These instructions apply to work inside `kanban-ui`.

- Treat this repository as an Angular 21 application.
- Keep changes focused, minimal, and consistent with the existing architecture in the touched area.
- Do not perform unrelated refactors while implementing a feature or fixing a bug.

## Core Workflow

- Prefer extending existing feature state and UI components over adding parallel abstractions.
- Preserve public APIs unless the task explicitly requires changing them.
- Keep the Angular CLI scaffold shape unless the change has a clear product need.
- If a change affects repo-wide conventions, update this file in the same work.

## Definition Of Done

Validate meaningful code changes with:

1. `npm run build`
2. `npm run lint`

Run `npm run test` only when the task explicitly requires unit-test execution.

## Environment Expectations

- Respect the Angular CLI-generated workspace structure.
- Use npm as the package manager.
- The default development server port for this repo is 4300.
- Keep `package.json` and `angular.json` close to Angular CLI defaults unless the task requires documented changes.

## Angular 21 Practices

- Use standalone components, directives, and pipes.
- Do not add `standalone: true` to decorators; standalone is the default.
- Use `inject()` instead of constructor injection in new or materially changed code.
- Use signals for local UI state.
- Use `computed()` for derived state.
- Set `changeDetection: ChangeDetectionStrategy.OnPush` on new or materially reworked components.
- Use the `host` object in component metadata instead of `@HostBinding` or `@HostListener` in new code.

## State And Persistence

- Keep kanban board state centralized in one feature-owned service or store.
- Model board columns and cards with explicit types.
- Persist board state in `localStorage`.
- Validate persisted payloads defensively before using them.
- Keep persistence side effects out of presentational components.

## UI And Interaction

- This app is a private classical kanban board with four fixed columns: Backlog, Waiting, In Progress, and Done.
- Prefer small focused components such as board page, column, card, and task editor.
- Use `@angular/cdk/drag-drop` for card movement.
- Support keyboard access and visible focus states for interactive controls.
- Keep the visual design restrained: neutral palette, subtle contrast, and clear spacing instead of bright colors.

## Styling

- Use SCSS for component and global styles.
- Keep design tokens and shared theme values in `src/styles.scss` unless a feature-specific stylesheet is more appropriate.
- Avoid one-off inline styles when a component or shared SCSS rule is clearer.
- Preserve responsiveness for smaller laptop and tablet widths; mobile may stack or horizontally scroll the board if needed.

## Testing And Selectors

- Do not add unit tests unless the task explicitly calls for them.
- If tests are added later, use stable `data-testid` selectors for feature interactions.
- Do not use styling classes as the primary selector for tests.

## Routing And Structure

- Keep route definitions in `src/app/app.routes.ts` or close to the feature they load.
- Prefer feature-oriented folders under `src/app/features` once the board implementation expands.
- Keep reusable domain types and state logic close to the board feature unless they become intentionally shared.

## Change Management

- If you introduce or change a repo-wide convention, update this file in the same change.
- Do not leave this file stale after changing validation steps, project structure, persistence strategy, or interaction patterns.

## Reference Files

- `package.json` for scripts and dependency constraints.
- `angular.json` for workspace and dev-server configuration.
- `src/app/app.routes.ts` for route wiring.
- `src/styles.scss` for shared visual tokens and layout rules.