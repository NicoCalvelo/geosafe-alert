import {
  Component,
  effect,
  EventEmitter,
  inject,
  input,
  OnDestroy,
  Output,
  signal,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { debounceTime, Subject, takeUntil } from 'rxjs'
import { GeocodeService } from '../../../core/services/geocode.service'

export interface GeocodeResult {
  id: string
  name: string
  lat: number
  lng: number
  context?: string
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar implements OnDestroy {
  private geocode = inject(GeocodeService)

  // Inputs
  showInitially = input<boolean>(true)

  // Outputs
  @Output() addressSelected = new EventEmitter<GeocodeResult>()

  // Signals
  searchQuery = signal<string>('')
  suggestions = signal<GeocodeResult[]>([])
  loading = signal<boolean>(false)
  showResults = signal<boolean>(false)
  highlightedIndex = signal<number>(-1)

  private destroy$ = new Subject<void>()
  private searchSubject$ = new Subject<string>()

  constructor() {
    // Setup debounced search
    this.searchSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.performSearch(query)
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement
    const query = input.value.trim()

    this.searchQuery.set(query)
    this.highlightedIndex.set(-1)

    if (query.length < 2) {
      this.suggestions.set([])
      this.showResults.set(false)
      return
    }

    this.showResults.set(true)
    this.searchSubject$.next(query)
  }

  private performSearch(query: string): void {
    if (query.length < 2) return

    this.loading.set(true)
    this.geocode.autocomplete(query).subscribe({
      next: (results) => {
        this.suggestions.set(results)
        this.loading.set(false)
        this.highlightedIndex.set(-1)
      },
      error: (err) => {
        console.error('Geocode error:', err)
        this.loading.set(false)
        this.suggestions.set([])
      },
    })
  }

  onKeyDown(event: KeyboardEvent): void {
    const suggestionsLength = this.suggestions().length

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        this.highlightedIndex.update((idx) =>
          idx < suggestionsLength - 1 ? idx + 1 : idx
        )
        break

      case 'ArrowUp':
        event.preventDefault()
        this.highlightedIndex.update((idx) => (idx > 0 ? idx - 1 : -1))
        break

      case 'Enter':
        event.preventDefault()
        const idx = this.highlightedIndex()
        if (idx >= 0 && idx < suggestionsLength) {
          this.selectAddress(this.suggestions()[idx])
        }
        break

      case 'Escape':
        event.preventDefault()
        this.showResults.set(false)
        break
    }
  }

  selectAddress(result: GeocodeResult): void {
    this.searchQuery.set(result.name)
    this.showResults.set(false)
    this.suggestions.set([])
    this.highlightedIndex.set(-1)
    this.addressSelected.emit(result)
  }

  onFocus(): void {
    if (this.searchQuery().length >= 2) {
      this.showResults.set(true)
    }
  }

  onBlur(): void {
    // Delay to allow click on dropdown item to register
    setTimeout(() => {
      this.showResults.set(false)
    }, 200)
  }
}
