import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ALERT_TYPES, AlertType } from '../models/alert.model';

export interface CzmlEvent {
  id?: string;
  type?: string;
  properties?: Record<string, unknown>;
  position?: unknown;
}

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private http = inject(HttpClient);

  readonly alertTypes = signal<AlertType[]>([]);
  readonly activeFilters = signal<string[]>([]);

  readonly activeAlertTypes = computed(() => {
    const filters = this.activeFilters();
    if (filters.length === 0) return this.alertTypes();
    return this.alertTypes().filter((t) => filters.includes(t.code));
  });

  async loadAlertTypes(): Promise<void> {
    try {
      const types = await firstValueFrom(
        this.http.get<AlertType[]>(`${environment.apiUrl}/alert-types`)
      );

      this.alertTypes.set(types);
      this.activeFilters.set(types.map((type) => type.code));
    } catch (err) {
      console.error('Failed to load alert types, using fallback list:', err);
      this.alertTypes.set(ALERT_TYPES);
      this.activeFilters.set(ALERT_TYPES.map((type) => type.code));
    }
  }

  async fetchCzml(filters?: { from?: string; to?: string; alertTypes?: string[] }): Promise<CzmlEvent[]> {
    let params = new HttpParams();

    if (filters?.from) params = params.set('from', filters.from);
    if (filters?.to) params = params.set('to', filters.to);
    if (filters?.alertTypes) {
      for (const code of filters.alertTypes) {
        params = params.append('alertTypes[]', code);
      }
    }

    return firstValueFrom(
      this.http.get<CzmlEvent[]>(`${environment.apiUrl}/events/czml`, { params })
    );
  }

  /**
   * Fetch CZML data filtered by geographic location and proximity
   * @param lat Latitude
   * @param lng Longitude
   * @param radiusKm Search radius in kilometers (default: 5)
   */
  async fetchNearbyAlerts(lat: number, lng: number, radiusKm = 5): Promise<CzmlEvent[]> {
    let params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lng.toString())
      .set('radius', radiusKm.toString());

    // Also apply active alert type filters
    const filters = this.activeFilters();
    if (filters.length > 0) {
      for (const code of filters) {
        params = params.append('alertTypes[]', code);
      }
    }

    return firstValueFrom(
      this.http.get<CzmlEvent[]>(`${environment.apiUrl}/events/czml`, { params })
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
    this.activeFilters.set(this.alertTypes().map((type) => type.code));
  }

  async ingest(): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(`${environment.apiUrl}/ingest`, {})
    );
  }
}
