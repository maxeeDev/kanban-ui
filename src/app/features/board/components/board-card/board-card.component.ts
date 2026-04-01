import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { KanbanCard } from '../../models/kanban.models';
import { BoardI18nService } from '../../services/board-i18n.service';

@Component({
  selector: 'app-board-card',
  templateUrl: './board-card.component.html',
  styleUrl: './board-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardCardComponent {
  private readonly i18n = inject(BoardI18nService);

  readonly card = input.required<KanbanCard>();
  readonly editCard = output<void>();

  protected readonly copy = this.i18n.copy;
  protected readonly updatedLabel = computed(() => this.copy().updatedOn(this.card().updatedAt));
}