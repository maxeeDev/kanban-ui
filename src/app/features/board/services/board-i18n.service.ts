import { Injectable, computed, signal } from '@angular/core';

import { BoardColumnId } from '../models/kanban.models';

const LOCALE_STORAGE_KEY = 'kanban-ui.locale.v1';

export type BoardLocale = 'en' | 'de';

export const BOARD_LOCALES: BoardLocale[] = ['en', 'de'];

interface BoardCopy {
  privateBoard: string;
  boardTitle: string;
  boardLede: string;
  cardsOnBoard: string;
  savedLocally: string;
  linkedFileNote: (fileName: string) => string;
  localBackupActive: string;
  connectedToFile: (fileName: string) => string;
  connectFileFailed: string;
  reloadedFromFile: (fileName: string) => string;
  reloadFailed: string;
  clearClosedTickets: string;
  clearedClosedTickets: (count: number) => string;
  clearClosedTicketsEmpty: string;
  addTask: string;
  linkBoardFile: string;
  reconnectFile: string;
  reloadFile: string;
  kanbanColumns: string;
  language: string;
  languageNames: Record<BoardLocale, string>;
  columnTitles: Record<BoardColumnId, string>;
  cards: (count: number) => string;
  add: string;
  noCardsYet: string;
  edit: string;
  updatedOn: (dateIso: string) => string;
  createTask: string;
  editTask: string;
  close: string;
  title: string;
  description: string;
  delete: string;
  cancel: string;
  create: string;
  save: string;
}

@Injectable({ providedIn: 'root' })
export class BoardI18nService {
  private readonly localeSignal = signal<BoardLocale>(this.restoreLocale());

  readonly locale = this.localeSignal.asReadonly();
  readonly locales = BOARD_LOCALES;
  readonly copy = computed<BoardCopy>(() => this.buildCopy(this.localeSignal()));

  setLocale(locale: BoardLocale): void {
    this.localeSignal.set(locale);
    globalThis.localStorage?.setItem(LOCALE_STORAGE_KEY, locale);
  }

  private restoreLocale(): BoardLocale {
    const storedLocale = globalThis.localStorage?.getItem(LOCALE_STORAGE_KEY);
    return storedLocale === 'de' ? 'de' : 'en';
  }

  private buildCopy(locale: BoardLocale): BoardCopy {
    const dateFormatter = new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
      dateStyle: 'medium'
    });

    if (locale === 'de') {
      return {
        privateBoard: 'Privates Board',
        boardTitle: 'Kanban',
        boardLede: 'Ein fokussiertes Board, das Arbeit ohne unnötigen Aufwand vom Backlog bis Erledigt bewegt.',
        cardsOnBoard: 'Karten auf dem Board',
        savedLocally: 'Lokal in diesem Browser gespeichert.',
        linkedFileNote: (fileName) => `Speichert in ${fileName} mit lokalem Backup.`,
        localBackupActive: 'Das lokale Backup ist aktiv.',
        connectedToFile: (fileName) => `Speichert in ${fileName} und behält das lokale Backup bei.`,
        connectFileFailed: 'Die Dateiverknüpfung wurde abgebrochen oder die Berechtigung fehlt. Das lokale Backup bleibt aktiv.',
        reloadedFromFile: (fileName) => `Board wurde aus ${fileName} neu geladen. Das lokale Backup wurde aktualisiert.`,
        reloadFailed: 'Keine lesbare verknüpfte Datei verfügbar. Das lokale Backup wird weiter verwendet.',
        clearClosedTickets: 'Erledigte Tickets löschen',
        clearedClosedTickets: (count) => `${count} erledigte ${count === 1 ? 'Karte' : 'Karten'} wurden aus dem Speicher entfernt.`,
        clearClosedTicketsEmpty: 'Es gibt keine erledigten Tickets zum Löschen.',
        addTask: 'Aufgabe hinzufügen',
        linkBoardFile: 'Board-Datei verknüpfen',
        reconnectFile: 'Datei erneut verknüpfen',
        reloadFile: 'Datei neu laden',
        kanbanColumns: 'Kanban-Spalten',
        language: 'Sprache',
        languageNames: {
          en: 'Englisch',
          de: 'Deutsch'
        },
        columnTitles: {
          backlog: 'Backlog',
          waiting: 'Wartend',
          'in-progress': 'In Bearbeitung',
          done: 'Erledigt'
        },
        cards: (count) => `${count} ${count === 1 ? 'Karte' : 'Karten'}`,
        add: 'Hinzufügen',
        noCardsYet: 'Noch keine Karten.',
        edit: 'Bearbeiten',
        updatedOn: (dateIso) => `Aktualisiert ${dateFormatter.format(new Date(dateIso))}`,
        createTask: 'Aufgabe erstellen',
        editTask: 'Aufgabe bearbeiten',
        close: 'Schließen',
        title: 'Titel',
        description: 'Beschreibung',
        delete: 'Löschen',
        cancel: 'Abbrechen',
        create: 'Erstellen',
        save: 'Speichern'
      };
    }

    return {
      privateBoard: 'Private board',
      boardTitle: 'Kanban',
      boardLede: 'A focused board for moving work from backlog to done without extra ceremony.',
      cardsOnBoard: 'Cards on board',
      savedLocally: 'Saved locally in this browser.',
      linkedFileNote: (fileName) => `Saving to ${fileName} with local backup.`,
      localBackupActive: 'Local backup is active.',
      connectedToFile: (fileName) => `Saving to ${fileName} and keeping local backup.`,
      connectFileFailed: 'File connection was cancelled or permission was not granted. Local backup is still active.',
      reloadedFromFile: (fileName) => `Reloaded board from ${fileName}. Local backup was refreshed.`,
      reloadFailed: 'No readable linked file was available. The local backup remains in use.',
      clearClosedTickets: 'Delete closed tickets',
      clearedClosedTickets: (count) => `Removed ${count} closed ${count === 1 ? 'ticket' : 'tickets'} from storage.`,
      clearClosedTicketsEmpty: 'There are no closed tickets to delete.',
      addTask: 'Add task',
      linkBoardFile: 'Link board file',
      reconnectFile: 'Reconnect file',
      reloadFile: 'Reload file',
      kanbanColumns: 'Kanban columns',
      language: 'Language',
      languageNames: {
        en: 'English',
        de: 'German'
      },
      columnTitles: {
        backlog: 'Backlog',
        waiting: 'Waiting',
        'in-progress': 'In Progress',
        done: 'Done'
      },
      cards: (count) => `${count} ${count === 1 ? 'card' : 'cards'}`,
      add: 'Add',
      noCardsYet: 'No cards yet.',
      edit: 'Edit',
      updatedOn: (dateIso) => `Updated ${dateFormatter.format(new Date(dateIso))}`,
      createTask: 'Create task',
      editTask: 'Edit task',
      close: 'Close',
      title: 'Title',
      description: 'Description',
      delete: 'Delete',
      cancel: 'Cancel',
      create: 'Create',
      save: 'Save'
    };
  }
}