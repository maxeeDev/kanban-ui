import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { KanbanCard } from '../../models/kanban.models';

@Component({
  selector: 'app-board-card',
  imports: [DatePipe],
  templateUrl: './board-card.component.html',
  styleUrl: './board-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardCardComponent {
  readonly card = input.required<KanbanCard>();
  readonly editCard = output<void>();
}