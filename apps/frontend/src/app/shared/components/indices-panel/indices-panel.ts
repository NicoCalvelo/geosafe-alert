import { Component, input, output } from '@angular/core';
import { IndexAtAddress } from '../../../core/models/index.model';

@Component({
  selector: 'app-indices-panel',
  templateUrl: './indices-panel.html',
  styleUrl: './indices-panel.css',
})
export class IndicesPanel {
  indices = input<IndexAtAddress[]>([]);
  loading = input<boolean>(false);
  addressLabel = input<string | null>(null);
  zoneId = input<string | null>(null);
  subscribed = input<boolean>(false);

  closed = output<void>();
  indexHover = output<IndexAtAddress | null>();
  subscribeToggled = output<void>();

  onHover(index: IndexAtAddress | null): void {
    this.indexHover.emit(index);
  }

  onClose(): void {
    this.closed.emit();
  }

  onToggleSubscribe(): void {
    this.subscribeToggled.emit();
  }
}
