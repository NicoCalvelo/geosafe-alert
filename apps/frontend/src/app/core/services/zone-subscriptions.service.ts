import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ZoneSubscriptionsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/zones`;

  async fetchMine(): Promise<string[]> {
    return firstValueFrom(this.http.get<string[]>(`${this.apiUrl}/subscriptions`));
  }

  async subscribe(zoneId: string): Promise<void> {
    await firstValueFrom(this.http.post(`${this.apiUrl}/${zoneId}/subscribe`, {}));
  }

  async unsubscribe(zoneId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${zoneId}/subscribe`));
  }
}
