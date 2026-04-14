import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ALERT_TYPES, AlertType } from '../models/alert.model';

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private http = inject(HttpClient);

  readonly alertTypes = signal<AlertType[]>(ALERT_TYPES);
  readonly activeFilters = signal<string[]>([]);

  readonly activeAlertTypes = computed(() => {
    const filters = this.activeFilters();
    if (filters.length === 0) return this.alertTypes();
    return this.alertTypes().filter((t) => filters.includes(t.code));
  });

  async fetchCzml(filters?: { from?: string; to?: string; alertTypes?: string[] }): Promise<any[]> {
    let params = new HttpParams();

    if (filters?.from) params = params.set('from', filters.from);
    if (filters?.to) params = params.set('to', filters.to);
    if (filters?.alertTypes) {
      for (const code of filters.alertTypes) {
        params = params.append('alertTypes[]', code);
      }
    }

    return firstValueFrom(
      this.http.get<any[]>(`${environment.apiUrl}/events/czml`, { params })
    );
  }

  toggleFilter(code: string): void {
    const current = this.activeFilters();
    if (current.includes(code)) {
      this.activeFilters.set(current.filter((c) => c !== code));
    } else {
      this.activeFilters.set([...current, code]);
    }
  }

  clearFilters(): void {
    this.activeFilters.set([]);
  }
}
