import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.error = null;

    if (!this.email || !this.password) {
      this.error = 'Email and password are required';
      return;
    }

    this.loading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        // Navigate to some dashboard later, for now just home
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.error = err.error?.message || 'Login failed';
      },
    });
  }
}
