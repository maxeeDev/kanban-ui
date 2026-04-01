export type BoardColumnId = 'backlog' | 'waiting' | 'in-progress' | 'done';

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardColumn {
  id: BoardColumnId;
  title: string;
  cardIds: string[];
}

export interface KanbanBoardState {
  columns: Record<BoardColumnId, BoardColumn>;
  cards: Record<string, KanbanCard>;
  columnOrder: BoardColumnId[];
  lastUpdatedAt: string;
}

export interface BoardColumnView {
  id: BoardColumnId;
  title: string;
  cards: KanbanCard[];
}

export const BOARD_COLUMN_ORDER: BoardColumnId[] = [
  'backlog',
  'waiting',
  'in-progress',
  'done'
];

export const BOARD_COLUMN_TITLES: Record<BoardColumnId, string> = {
  backlog: 'Backlog',
  waiting: 'Waiting',
  'in-progress': 'In Progress',
  done: 'Done'
};