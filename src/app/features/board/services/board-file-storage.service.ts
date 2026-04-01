import { Injectable, signal } from '@angular/core';

import { KanbanBoardState } from '../models/kanban.models';
import { isKanbanBoardState } from '../utils/board-state.utils';

const DB_NAME = 'kanban-ui.persistence';
const STORE_NAME = 'handles';
const BOARD_FILE_KEY = 'board-file';

type FilePermissionMode = 'read' | 'readwrite';

interface SavePickerOptions {
  suggestedName?: string;
  types?: Array<{
    description?: string;
    accept: Record<string, string[]>;
  }>;
}

interface BoardFileHandle extends FileSystemFileHandle {
  queryPermission: (descriptor: { mode: FilePermissionMode }) => Promise<PermissionState>;
  requestPermission: (descriptor: { mode: FilePermissionMode }) => Promise<PermissionState>;
}

interface PickerWindow {
  indexedDB?: IDBFactory;
  showSaveFilePicker?: (options?: SavePickerOptions) => Promise<BoardFileHandle>;
}

@Injectable({ providedIn: 'root' })
export class BoardFileStorageService {
  private readonly browserWindow = globalThis as unknown as PickerWindow;

  readonly supportsFilePersistence = signal(this.checkSupport());
  readonly linkedFileName = signal<string | null>(null);

  async loadBoardFromLinkedFile(): Promise<KanbanBoardState | null> {
    const handle = await this.getStoredHandle();

    if (!handle) {
      this.linkedFileName.set(null);
      return null;
    }

    this.linkedFileName.set(handle.name);

    if (!(await this.hasPermission(handle, 'read'))) {
      return null;
    }

    try {
      const file = await handle.getFile();

      if (file.size === 0) {
        return null;
      }

      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;

      return isKanbanBoardState(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  async connectBoardFile(board: KanbanBoardState): Promise<boolean> {
    if (!this.supportsFilePersistence()) {
      return false;
    }

    const handle = await this.browserWindow.showSaveFilePicker?.({
      suggestedName: 'kanban-board.json',
      types: [
        {
          description: 'Kanban board backup',
          accept: {
            'application/json': ['.json']
          }
        }
      ]
    });

    if (!handle) {
      return false;
    }

    await this.storeHandle(handle);
    this.linkedFileName.set(handle.name);

    if (!(await this.ensurePermission(handle, 'readwrite'))) {
      return false;
    }

    await this.writeBoard(handle, board);
    return true;
  }

  async saveBoard(board: KanbanBoardState): Promise<void> {
    const handle = await this.getStoredHandle();

    if (!handle) {
      return;
    }

    this.linkedFileName.set(handle.name);

    if (!(await this.hasPermission(handle, 'readwrite'))) {
      return;
    }

    await this.writeBoard(handle, board);
  }

  private async writeBoard(handle: FileSystemFileHandle, board: KanbanBoardState): Promise<void> {
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(board, null, 2));
    await writable.close();
  }

  private checkSupport(): boolean {
    return typeof this.browserWindow.showSaveFilePicker === 'function' && typeof indexedDB !== 'undefined';
  }

  private async hasPermission(handle: BoardFileHandle, mode: FilePermissionMode): Promise<boolean> {
    const permission = await handle.queryPermission({ mode });
    return permission === 'granted';
  }

  private async ensurePermission(handle: BoardFileHandle, mode: FilePermissionMode): Promise<boolean> {
    if (await this.hasPermission(handle, mode)) {
      return true;
    }

    const permission = await handle.requestPermission({ mode });
    return permission === 'granted';
  }

  private async getStoredHandle(): Promise<BoardFileHandle | null> {
    if (!this.supportsFilePersistence()) {
      return null;
    }

    const database = await this.openDatabase();

    return await new Promise<BoardFileHandle | null>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).get(BOARD_FILE_KEY);

      request.onsuccess = () => resolve((request.result as BoardFileHandle | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  private async storeHandle(handle: BoardFileHandle): Promise<void> {
    const database = await this.openDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const request = transaction.objectStore(STORE_NAME).put(handle, BOARD_FILE_KEY);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async openDatabase(): Promise<IDBDatabase> {
    return await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}