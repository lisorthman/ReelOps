import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  role = 'producer'; // default
  loading = false;
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.error = null;

    if (!this.name || !this.email || !this.password) {
      this.error = 'Name, email and password are required';
      return;
    }

    this.loading = true;

    this.authService
      .register({
        name: this.name,
        email: this.email,
        password: this.password,
        role: this.role,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/projects']);
        },
        error: (err) => {
          this.loading = false;
          console.error(err);
          this.error = err.error?.message || 'Registration failed';
        },
      });
  }
}
