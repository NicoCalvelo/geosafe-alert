import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-alert-card',
  templateUrl: './alert-card.html',
})
export class AlertCard {
  entityId = input.required<string>();
  title = input.required<string>();
  alertLabel = input<string>('Alert');
  alertColor = input<string>('#ffffff');
  status = input<string>('active');

  clicked = output<string>();

  onClick(): void {
    this.clicked.emit(this.entityId());
  }
}
