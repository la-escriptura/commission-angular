import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-spinner-dialog',
  templateUrl: './progress-spinner-dialog.component.html',
  styleUrls: ['./progress-spinner-dialog.component.css']
})
export class ProgressSpinnerDialogComponent {
  @Input() message: any;

  getPercentage() {
      if (Number.isFinite(+this.message)) {
        return Math.round(+this.message * 100).toString() + '%';
      }
      return this.message;
  }
}
