import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IndexAtAddress, IndexType, IndexZoneGrid } from '../models/index.model';

@Injectable({ providedIn: 'root' })
export class IndicesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/indices`;

  async fetchTypes(): Promise<IndexType[]> {
    return firstValueFrom(this.http.get<IndexType[]>(`${this.apiUrl}/types`));
  }

  async fetchAt(lat: number, lng: number): Promise<IndexAtAddress[]> {
    const params = new HttpParams().set('lat', lat.toString()).set('lon', lng.toString());

    return firstValueFrom(
      this.http.get<IndexAtAddress[]>(`${this.apiUrl}/at`, { params })
    );
  }

  async fetchGrid(): Promise<IndexZoneGrid[]> {
    return firstValueFrom(this.http.get<IndexZoneGrid[]>(`${this.apiUrl}/grid`));
  }

  async fetchByZone(zoneId: string): Promise<IndexAtAddress[]> {
    return firstValueFrom(this.http.get<IndexAtAddress[]>(`${this.apiUrl}/zones/${zoneId}`));
  }

  async ingest(): Promise<{ message: string }> {
    return firstValueFrom(this.http.post<{ message: string }>(`${this.apiUrl}/ingest`, {}));
  }
}
