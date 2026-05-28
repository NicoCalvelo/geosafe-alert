import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
})
export class Toast {
  visible = signal(false);
  message = signal('');

  show(msg: string, duration = 4000): void {
    this.message.set(msg);
    this.visible.set(true);
    setTimeout(() => this.visible.set(false), duration);
  }
}
