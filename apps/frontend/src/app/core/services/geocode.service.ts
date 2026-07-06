import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../environments/environment'

export interface GeocodeResult {
  id: string
  name: string
  lat: number
  lng: number
  context?: string
}

@Injectable({
  providedIn: 'root',
})
export class GeocodeService {
  private http = inject(HttpClient)
  private apiUrl = `${environment.apiUrl}/geocode`

  /**
   * Autocomplete addresses based on query
   * @param query Search query (e.g., "Paris")
   * @param limit Maximum results (default 5)
   * @param proximity Optional {lat, lng} to bias results
   */
  autocomplete(
    query: string,
    limit = 5,
    proximity?: { lat: number; lng: number }
  ): Observable<GeocodeResult[]> {
    let params = new HttpParams().set('query', query).set('limit', limit.toString())

    if (proximity) {
      params = params
        .set('lat', proximity.lat.toString())
        .set('lng', proximity.lng.toString())
    }

    return this.http.get<GeocodeResult[]>(`${this.apiUrl}/autocomplete`, {
      params,
    })
  }
}
