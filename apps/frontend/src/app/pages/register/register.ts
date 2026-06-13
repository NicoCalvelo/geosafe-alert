import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  fullName = '';
  error = signal<string | null>(null);
  loading = signal(false);

  async onSubmit() {
    this.error.set(null);
    this.loading.set(true);

    try {
      await this.auth.register({
        email: this.email,
        password: this.password,
        fullName: this.fullName || undefined,
      });
      this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      const error = err as {
        error?: {
          errors?: { message?: string }[];
        };
      };

      this.error.set(error?.error?.errors?.[0]?.message ?? 'Registration failed');
    } finally {
      this.loading.set(false);
    }
  }
}
