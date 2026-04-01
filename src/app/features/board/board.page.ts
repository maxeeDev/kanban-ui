import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { BoardColumnComponent } from './components/board-column/board-column.component';
import { TaskEditorComponent, TaskEditorValue } from './components/task-editor/task-editor.component';
import { BoardColumnId, KanbanCard } from './models/kanban.models';
import { BoardStateService } from './services/board-state.service';

@Component({
  selector: 'app-board-page',
  imports: [BoardColumnComponent, TaskEditorComponent],
  templateUrl: './board.page.html',
  styleUrl: './board.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardPage {
  private readonly boardState = inject(BoardStateService);
  private readonly activeEditor = signal<{ mode: 'create' | 'edit'; columnId: BoardColumnId; cardId: string | null } | null>(null);

  protected readonly columns = this.boardState.columns;
  protected readonly cardCount = this.boardState.cardCount;
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
}