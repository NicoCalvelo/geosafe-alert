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

  closed = output<void>();
  indexHover = output<IndexAtAddress | null>();

  onHover(index: IndexAtAddress | null): void {
    this.indexHover.emit(index);
  }

  onClose(): void {
    this.closed.emit();
  }
}
