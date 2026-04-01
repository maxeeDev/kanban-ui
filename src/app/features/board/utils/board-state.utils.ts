import {
  BOARD_COLUMN_ORDER,
  BOARD_COLUMN_TITLES,
  BoardColumn,
  BoardColumnId,
  KanbanBoardState,
  KanbanCard
} from '../models/kanban.models';

export function createEmptyBoardState(): KanbanBoardState {
  return {
    columns: {
      backlog: createEmptyColumn('backlog'),
      waiting: createEmptyColumn('waiting'),
      'in-progress': createEmptyColumn('in-progress'),
      done: createEmptyColumn('done')
    },
    cards: {},
    columnOrder: [...BOARD_COLUMN_ORDER],
    lastUpdatedAt: new Date().toISOString()
  };
}

export function isKanbanBoardState(value: unknown): value is KanbanBoardState {
  if (!isRecord(value)) {
    return false;
  }

  const { columns, cards, columnOrder, lastUpdatedAt } = value;

  if (!isRecord(columns) || !isRecord(cards) || !Array.isArray(columnOrder) || typeof lastUpdatedAt !== 'string') {
    return false;
  }

  const hasValidColumnOrder =
    columnOrder.length === BOARD_COLUMN_ORDER.length
    && BOARD_COLUMN_ORDER.every((columnId, index) => columnOrder[index] === columnId);

  if (!hasValidColumnOrder) {
    return false;
  }

  for (const columnId of BOARD_COLUMN_ORDER) {
    if (!isBoardColumn(columns[columnId], columnId)) {
      return false;
    }
  }

  return Object.values(cards).every(isKanbanCard);
}

function createEmptyColumn(id: BoardColumnId): BoardColumn {
  return {
    id,
    title: BOARD_COLUMN_TITLES[id],
    cardIds: []
  };
}

function isBoardColumn(value: unknown, expectedId: BoardColumnId): value is BoardColumn {
  if (!isRecord(value)) {
    return false;
  }

  return value['id'] === expectedId
    && value['title'] === BOARD_COLUMN_TITLES[expectedId]
    && Array.isArray(value['cardIds'])
    && value['cardIds'].every((cardId) => typeof cardId === 'string');
}

function isKanbanCard(value: unknown): value is KanbanCard {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value['id'] === 'string'
    && typeof value['title'] === 'string'
    && typeof value['description'] === 'string'
    && typeof value['createdAt'] === 'string'
    && typeof value['updatedAt'] === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}