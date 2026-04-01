import { Injectable, computed, effect, signal } from '@angular/core';

import {
  BOARD_COLUMN_ORDER,
  BoardColumnId,
  BoardColumnView,
  KanbanCard,
  KanbanBoardState
} from '../models/kanban.models';
import { createEmptyBoardState, isKanbanBoardState } from '../utils/board-state.utils';

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

  createCard(input: { title: string; description: string; columnId: BoardColumnId }): void {
    const now = new Date().toISOString();
    const cardId = globalThis.crypto?.randomUUID?.() ?? `card-${Date.now()}`;

    this.boardState.update((board) => ({
      ...board,
      cards: {
        ...board.cards,
        [cardId]: {
          id: cardId,
          title: input.title.trim(),
          description: input.description.trim(),
          createdAt: now,
          updatedAt: now
        }
      },
      columns: {
        ...board.columns,
        [input.columnId]: {
          ...board.columns[input.columnId],
          cardIds: [...board.columns[input.columnId].cardIds, cardId]
        }
      },
      lastUpdatedAt: now
    }));
  }

  updateCard(cardId: string, input: { title: string; description: string }): void {
    const existingCard = this.boardState().cards[cardId];

    if (!existingCard) {
      return;
    }

    this.boardState.update((board) => ({
      ...board,
      cards: {
        ...board.cards,
        [cardId]: {
          ...existingCard,
          title: input.title.trim(),
          description: input.description.trim(),
          updatedAt: new Date().toISOString()
        }
      },
      lastUpdatedAt: new Date().toISOString()
    }));
  }

  deleteCard(cardId: string): void {
    const columnId = this.findCardColumnId(cardId);

    if (!columnId) {
      return;
    }

    this.boardState.update((board) => {
      const cards = { ...board.cards };
      delete cards[cardId];

      return {
        ...board,
        cards,
        columns: {
          ...board.columns,
          [columnId]: {
            ...board.columns[columnId],
            cardIds: board.columns[columnId].cardIds.filter((existingCardId) => existingCardId !== cardId)
          }
        },
        lastUpdatedAt: new Date().toISOString()
      };
    });
  }

  moveCard(
    previousColumnId: BoardColumnId,
    currentColumnId: BoardColumnId,
    previousIndex: number,
    currentIndex: number
  ): void {
    this.boardState.update((board) => {
      const previousCardIds = [...board.columns[previousColumnId].cardIds];
      const [movedCardId] = previousCardIds.splice(previousIndex, 1);

      if (!movedCardId) {
        return board;
      }

      if (previousColumnId === currentColumnId) {
        previousCardIds.splice(currentIndex, 0, movedCardId);

        return {
          ...board,
          columns: {
            ...board.columns,
            [currentColumnId]: {
              ...board.columns[currentColumnId],
              cardIds: previousCardIds
            }
          },
          lastUpdatedAt: new Date().toISOString()
        };
      }

      const currentCardIds = [...board.columns[currentColumnId].cardIds];
      currentCardIds.splice(currentIndex, 0, movedCardId);

      return {
        ...board,
        columns: {
          ...board.columns,
          [previousColumnId]: {
            ...board.columns[previousColumnId],
            cardIds: previousCardIds
          },
          [currentColumnId]: {
            ...board.columns[currentColumnId],
            cardIds: currentCardIds
          }
        },
        lastUpdatedAt: new Date().toISOString()
      };
    });
  }

  getCard(cardId: string): KanbanCard | null {
    return this.boardState().cards[cardId] ?? null;
  }

  findCardColumnId(cardId: string): BoardColumnId | null {
    const board = this.boardState();

    for (const columnId of BOARD_COLUMN_ORDER) {
      if (board.columns[columnId].cardIds.includes(cardId)) {
        return columnId;
      }
    }

    return null;
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