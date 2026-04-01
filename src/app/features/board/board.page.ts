import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { BoardColumnComponent } from './components/board-column/board-column.component';
import { BoardStateService } from './services/board-state.service';

@Component({
  selector: 'app-board-page',
  imports: [BoardColumnComponent],
  templateUrl: './board.page.html',
  styleUrl: './board.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardPage {
  private readonly boardState = inject(BoardStateService);

  protected readonly columns = this.boardState.columns;
  protected readonly cardCount = this.boardState.cardCount;
}