import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

export interface UpdateProfileRequest {
  fullName?: string | null;
  locationAddress?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  async getProfile(): Promise<User> {
    return firstValueFrom(
      this.http.get<User>(`${environment.apiUrl}/profile`)
    );
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const updated = await firstValueFrom(
      this.http.put<User>(`${environment.apiUrl}/profile`, data)
    );
    this.auth.updateUser(updated);
    return updated;
  }
}
