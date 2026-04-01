import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { BoardColumnId, BoardColumnView, KanbanCard } from '../../models/kanban.models';
import { BoardCardComponent } from '../board-card/board-card.component';

@Component({
  selector: 'app-board-column',
  imports: [BoardCardComponent, DragDropModule],
  templateUrl: './board-column.component.html',
  styleUrl: './board-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardColumnComponent {
  readonly column = input.required<BoardColumnView>();
  readonly addCard = output<BoardColumnId>();
  readonly editCard = output<string>();
  readonly cardDropped = output<CdkDragDrop<KanbanCard[]>>();

  protected openCreateCard(): void {
    this.addCard.emit(this.column().id);
  }
}