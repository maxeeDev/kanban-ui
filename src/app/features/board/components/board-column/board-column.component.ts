import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { BoardColumnView } from '../../models/kanban.models';
import { BoardCardComponent } from '../board-card/board-card.component';

@Component({
  selector: 'app-board-column',
  imports: [BoardCardComponent],
  templateUrl: './board-column.component.html',
  styleUrl: './board-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardColumnComponent {
  readonly column = input.required<BoardColumnView>();
}