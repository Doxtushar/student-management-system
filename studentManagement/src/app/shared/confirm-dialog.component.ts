import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="dialog-shell">
      <div class="dialog-icon">
        <mat-icon>warning_amber</mat-icon>
      </div>
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>{{ data.message }}</mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close(false)">{{ data.cancelText }}</button>
        <button mat-raised-button color="warn" type="button" (click)="dialogRef.close(true)">
          {{ data.confirmText }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-shell {
      padding-top: 8px;
    }

    .dialog-icon {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      margin-bottom: 8px;
      border-radius: 14px;
      background: rgba(239, 68, 68, 0.12);
      color: #dc2626;
    }

    h2 {
      margin: 0;
      font-size: 1.25rem;
    }

    mat-dialog-content {
      color: #64748b;
      line-height: 1.6;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    readonly dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: ConfirmDialogData
  ) {}
}
