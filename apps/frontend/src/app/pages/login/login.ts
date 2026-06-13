import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = signal<string | null>(null);
  loading = signal(false);

  async onSubmit() {
    this.error.set(null);
    this.loading.set(true);

    try {
      await this.auth.login({ email: this.email, password: this.password });
      this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      const error = err as {
        error?: {
          errors?: { message?: string }[];
        };
      };

      this.error.set(error?.error?.errors?.[0]?.message ?? 'Invalid credentials');
    } finally {
      this.loading.set(false);
    }
  }
}
