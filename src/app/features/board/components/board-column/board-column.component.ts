import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { BoardColumnId, BoardColumnView, KanbanCard } from '../../models/kanban.models';
import { BoardI18nService } from '../../services/board-i18n.service';
import { BoardCardComponent } from '../board-card/board-card.component';

@Component({
  selector: 'app-board-column',
  imports: [BoardCardComponent, DragDropModule],
  templateUrl: './board-column.component.html',
  styleUrl: './board-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardColumnComponent {
  private readonly i18n = inject(BoardI18nService);

  readonly column = input.required<BoardColumnView>();
  readonly connectedTo = input.required<string[]>();
  readonly addCard = output<BoardColumnId>();
  readonly editCard = output<string>();
  readonly cardDropped = output<CdkDragDrop<KanbanCard[]>>();

  protected readonly copy = this.i18n.copy;
  protected readonly cardCountLabel = computed(() => this.copy().cards(this.column().cards.length));

  protected openCreateCard(): void {
    this.addCard.emit(this.column().id);
  }
}