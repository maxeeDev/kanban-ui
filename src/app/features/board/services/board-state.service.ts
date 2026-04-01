import { Injectable, computed, effect, signal } from '@angular/core';

import {
  BOARD_COLUMN_ORDER,
  BoardColumnView,
  KanbanBoardState,
  createEmptyBoardState,
  isKanbanBoardState
} from '../models/kanban.models';

const BOARD_STORAGE_KEY = 'kanban-ui.board.v1';

@Injectable({ providedIn: 'root' })
export class BoardStateService {
  private readonly boardState = signal<KanbanBoardState>(createEmptyBoardState());

  readonly state = this.boardState.asReadonly();
  readonly columns = computed<BoardColumnView[]>(() => {
    const board = this.boardState();

    return BOARD_COLUMN_ORDER.map((columnId) => {
      const column = board.columns[columnId];

      return {
        id: column.id,
        title: column.title,
        cards: column.cardIds
          .map((cardId) => board.cards[cardId])
          .filter((card) => card !== undefined)
      };
    });
  });

  readonly cardCount = computed(() => Object.keys(this.boardState().cards).length);

  constructor() {
    this.restoreBoard();

    effect(() => {
      this.persistBoard(this.boardState());
    });
  }

  private restoreBoard(): void {
    const storedState = globalThis.localStorage?.getItem(BOARD_STORAGE_KEY);

    if (!storedState) {
      return;
    }

    try {
      const parsedState = JSON.parse(storedState) as unknown;

      if (isKanbanBoardState(parsedState)) {
        this.boardState.set(parsedState);
      }
    } catch {
      this.boardState.set(createEmptyBoardState());
    }
  }

  private persistBoard(board: KanbanBoardState): void {
    globalThis.localStorage?.setItem(BOARD_STORAGE_KEY, JSON.stringify(board));
  }
}