import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./features/board/board.page').then((module) => module.BoardPage)
	}
];
