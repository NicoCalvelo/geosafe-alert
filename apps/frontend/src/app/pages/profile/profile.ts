import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, RouterLink],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private profileService = inject(ProfileService);
  private auth = inject(AuthService);

  readonly user = this.auth.currentUser;

  fullName = '';
  email = '';
  locationAddress = '';
  locationLat: number | null = null;
  locationLng: number | null = null;

  loading = signal(false);
  saving = signal(false);
  sharingLocation = signal(false);
  success = signal(false);
  error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    try {
      const profile = await this.profileService.getProfile();
      this.fullName = profile.fullName ?? '';
      this.email = profile.email;
      this.locationAddress = profile.locationAddress ?? '';
      this.locationLat = profile.locationLat ?? null;
      this.locationLng = profile.locationLng ?? null;
    } catch {
      this.error.set('Failed to load profile.');
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    this.error.set(null);
    this.success.set(false);
    this.saving.set(true);

    try {
      await this.profileService.updateProfile({
        fullName: this.fullName.trim() || null,
        locationAddress: this.locationAddress.trim() || null,
        locationLat: this.locationLat,
        locationLng: this.locationLng,
      });
      this.success.set(true);
    } catch (err: unknown) {
      const e = err as { error?: { errors?: { message?: string }[] } };
      this.error.set(e?.error?.errors?.[0]?.message ?? 'Failed to save profile.');
    } finally {
      this.saving.set(false);
    }
  }

  shareLocation(): void {
    this.error.set(null);
    this.success.set(false);

    if (!navigator.geolocation) {
      this.error.set('Geolocation is not supported by this browser.');
      return;
    }

    this.sharingLocation.set(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.locationLat = position.coords.latitude;
        this.locationLng = position.coords.longitude;
        this.sharingLocation.set(false);
      },
      () => {
        this.error.set('Unable to retrieve your location. Check browser permissions.');
        this.sharingLocation.set(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }
}
