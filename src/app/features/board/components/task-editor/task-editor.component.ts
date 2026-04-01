import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BoardColumnId, BOARD_COLUMN_TITLES, KanbanCard } from '../../models/kanban.models';

export interface TaskEditorValue {
  title: string;
  description: string;
}

@Component({
  selector: 'app-task-editor',
  imports: [ReactiveFormsModule],
  templateUrl: './task-editor.component.html',
  styleUrl: './task-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskEditorComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly mode = input.required<'create' | 'edit'>();
  readonly columnId = input.required<BoardColumnId>();
  readonly card = input<KanbanCard | null>(null);

  readonly saved = output<TaskEditorValue>();
  readonly cancelled = output<void>();
  readonly deleted = output<void>();

  protected readonly form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(1200)]]
  });

  protected readonly columnTitles = BOARD_COLUMN_TITLES;

  private readonly syncFormEffect = effect(() => {
    const card = this.card();

    this.form.reset({
      title: card?.title ?? '',
      description: card?.description ?? ''
    });
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saved.emit({
      title: this.form.controls.title.getRawValue(),
      description: this.form.controls.description.getRawValue()
    });
  }
}