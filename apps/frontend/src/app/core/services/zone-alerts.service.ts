import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ZoneAlert } from '../models/index.model';

@Injectable({ providedIn: 'root' })
export class ZoneAlertsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/zone-alerts`;

  async list(): Promise<ZoneAlert[]> {
    return firstValueFrom(this.http.get<ZoneAlert[]>(this.apiUrl));
  }

  async check(): Promise<{ created: number }> {
    return firstValueFrom(this.http.post<{ created: number }>(`${this.apiUrl}/check`, {}));
  }
}
