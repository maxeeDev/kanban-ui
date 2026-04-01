import { Injectable, computed, effect, inject, signal } from '@angular/core';

import {
  BOARD_COLUMN_ORDER,
  BoardColumnId,
  BoardColumnView,
  KanbanCard,
  KanbanBoardState
} from '../models/kanban.models';
import { BoardI18nService } from './board-i18n.service';
import { BoardFileStorageService } from './board-file-storage.service';
import { createEmptyBoardState, isKanbanBoardState } from '../utils/board-state.utils';

const BOARD_STORAGE_KEY = 'kanban-ui.board.v1';

@Injectable({ providedIn: 'root' })
export class BoardStateService {
  private readonly i18n = inject(BoardI18nService);
  private readonly fileStorage = inject(BoardFileStorageService);
  private readonly boardState = signal<KanbanBoardState>(createEmptyBoardState());
  private readonly hasHydrated = signal(false);

  readonly state = this.boardState.asReadonly();
  readonly supportsFilePersistence = this.fileStorage.supportsFilePersistence.asReadonly();
  readonly linkedFileName = this.fileStorage.linkedFileName.asReadonly();
  readonly columns = computed<BoardColumnView[]>(() => {
    const board = this.boardState();
    const copy = this.i18n.copy();

    return BOARD_COLUMN_ORDER.map((columnId) => {
      const column = board.columns[columnId];

      return {
        id: column.id,
        title: copy.columnTitles[column.id],
        cards: column.cardIds
          .map((cardId) => board.cards[cardId])
          .filter((card) => card !== undefined)
      };
    });
  });

  readonly cardCount = computed(() => Object.keys(this.boardState().cards).length);
  readonly closedCardCount = computed(() => this.boardState().columns.done.cardIds.length);

  constructor() {
    void this.restoreBoard();

    effect(() => {
      const board = this.boardState();

      if (!this.hasHydrated()) {
        return;
      }

      this.persistBoard(board);
    });
  }

  async connectBoardFile(): Promise<boolean> {
    const connected = await this.fileStorage.connectBoardFile(this.boardState());

    if (connected) {
      this.persistLocalBackup(this.boardState());
    }

    return connected;
  }

  async reloadFromFile(): Promise<boolean> {
    const fileBoard = await this.fileStorage.loadBoardFromLinkedFile();

    if (!fileBoard) {
      return false;
    }

    this.boardState.set(fileBoard);
    this.persistLocalBackup(fileBoard);
    return true;
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

  clearClosedCards(): number {
    const closedCardIds = this.boardState().columns.done.cardIds;

    if (closedCardIds.length === 0) {
      return 0;
    }

    this.boardState.update((board) => {
      const cards = { ...board.cards };

      for (const cardId of board.columns.done.cardIds) {
        delete cards[cardId];
      }

      return {
        ...board,
        cards,
        columns: {
          ...board.columns,
          done: {
            ...board.columns.done,
            cardIds: []
          }
        },
        lastUpdatedAt: new Date().toISOString()
      };
    });

    return closedCardIds.length;
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

  private async restoreBoard(): Promise<void> {
    const fileBoard = await this.fileStorage.loadBoardFromLinkedFile();

    if (fileBoard) {
      this.boardState.set(fileBoard);
      this.persistLocalBackup(fileBoard);
      this.hasHydrated.set(true);
      return;
    }

    const storedState = globalThis.localStorage?.getItem(BOARD_STORAGE_KEY);

    if (!storedState) {
      this.hasHydrated.set(true);
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

    this.hasHydrated.set(true);
  }

  private persistBoard(board: KanbanBoardState): void {
    this.persistLocalBackup(board);
    void this.fileStorage.saveBoard(board);
  }

  private persistLocalBackup(board: KanbanBoardState): void {
    globalThis.localStorage?.setItem(BOARD_STORAGE_KEY, JSON.stringify(board));
  }
}