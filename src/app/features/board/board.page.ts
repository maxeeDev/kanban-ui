import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { BoardColumnComponent } from './components/board-column/board-column.component';
import { TaskEditorComponent, TaskEditorValue } from './components/task-editor/task-editor.component';
import { BoardColumnId, KanbanCard } from './models/kanban.models';
import { BoardI18nService, BoardLocale } from './services/board-i18n.service';
import { BoardStateService } from './services/board-state.service';

@Component({
  selector: 'app-board-page',
  imports: [BoardColumnComponent, TaskEditorComponent],
  templateUrl: './board.page.html',
  styleUrl: './board.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardPage {
  private readonly i18n = inject(BoardI18nService);
  private readonly boardState = inject(BoardStateService);
  private readonly activeEditor = signal<{ mode: 'create' | 'edit'; columnId: BoardColumnId; cardId: string | null } | null>(null);
  private readonly persistenceEvent = signal<
    { kind: 'idle' | 'connect-failed' | 'reload-failed' }
    | { kind: 'connected' | 'reloaded'; fileName?: string }
    | { kind: 'cleared-closed'; count: number }
    | { kind: 'clear-closed-empty' }
  >({ kind: 'idle' });

  protected readonly copy = this.i18n.copy;
  protected readonly locale = this.i18n.locale;
  protected readonly locales = this.i18n.locales;
  protected readonly columns = this.boardState.columns;
  protected readonly cardCount = this.boardState.cardCount;
  protected readonly closedCardCount = this.boardState.closedCardCount;
  protected readonly connectedColumnIds = computed(() => this.columns().map((column) => column.id));
  protected readonly supportsFilePersistence = this.boardState.supportsFilePersistence;
  protected readonly linkedFileName = this.boardState.linkedFileName;
  protected readonly persistenceStatus = computed(() => {
    const copy = this.copy();
    const event = this.persistenceEvent();

    switch (event.kind) {
      case 'connected':
        return copy.connectedToFile(event.fileName ?? 'board file');
      case 'connect-failed':
        return copy.connectFileFailed;
      case 'reloaded':
        return copy.reloadedFromFile(event.fileName ?? 'linked file');
      case 'reload-failed':
        return copy.reloadFailed;
      case 'cleared-closed':
        return copy.clearedClosedTickets(event.count);
      case 'clear-closed-empty':
        return copy.clearClosedTicketsEmpty;
      case 'idle':
      default:
        return copy.localBackupActive;
    }
  });
  protected readonly storageNote = computed(() => {
    const copy = this.copy();
    const fileName = this.linkedFileName();

    return fileName ? copy.linkedFileNote(fileName) : copy.savedLocally;
  });
  protected readonly editor = this.activeEditor.asReadonly();
  protected readonly editorCard = computed(() => {
    const editor = this.activeEditor();

    return editor?.cardId ? this.boardState.getCard(editor.cardId) : null;
  });

  protected openCreateCard(columnId: BoardColumnId = 'backlog'): void {
    this.activeEditor.set({ mode: 'create', columnId, cardId: null });
  }

  protected openEditCard(cardId: string): void {
    const columnId = this.boardState.findCardColumnId(cardId);

    if (!columnId) {
      return;
    }

    this.activeEditor.set({ mode: 'edit', columnId, cardId });
  }

  protected closeEditor(): void {
    this.activeEditor.set(null);
  }

  protected saveCard(value: TaskEditorValue): void {
    const editor = this.activeEditor();

    if (!editor) {
      return;
    }

    if (editor.mode === 'create') {
      this.boardState.createCard({
        title: value.title,
        description: value.description,
        columnId: editor.columnId
      });
    } else if (editor.cardId) {
      this.boardState.updateCard(editor.cardId, value);
    }

    this.closeEditor();
  }

  protected deleteCard(): void {
    const editor = this.activeEditor();

    if (!editor?.cardId) {
      return;
    }

    this.boardState.deleteCard(editor.cardId);
    this.closeEditor();
  }

  protected moveCard(event: CdkDragDrop<KanbanCard[]>): void {
    this.boardState.moveCard(
      event.previousContainer.id as BoardColumnId,
      event.container.id as BoardColumnId,
      event.previousIndex,
      event.currentIndex
    );
  }

  protected setLocale(locale: BoardLocale): void {
    this.i18n.setLocale(locale);
  }

  protected async connectBoardFile(): Promise<void> {
    const connected = await this.boardState.connectBoardFile();
    this.persistenceEvent.set(
      connected
        ? { kind: 'connected', fileName: this.linkedFileName() ?? undefined }
        : { kind: 'connect-failed' }
    );
  }

  protected async reloadFromFile(): Promise<void> {
    const reloaded = await this.boardState.reloadFromFile();
    this.persistenceEvent.set(
      reloaded
        ? { kind: 'reloaded', fileName: this.linkedFileName() ?? undefined }
        : { kind: 'reload-failed' }
    );
  }

  protected clearClosedTickets(): void {
    const clearedCount = this.boardState.clearClosedCards();

    this.persistenceEvent.set(
      clearedCount > 0
        ? { kind: 'cleared-closed', count: clearedCount }
        : { kind: 'clear-closed-empty' }
    );
  }
}