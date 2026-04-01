import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { KanbanCard } from '../../models/kanban.models';

@Component({
  selector: 'app-board-card',
  templateUrl: './board-card.component.html',
  styleUrl: './board-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardCardComponent {
  readonly card = input.required<KanbanCard>();
}