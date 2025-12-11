import { Component, signal, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('reelops-frontend');
  isBrowser: boolean;

  constructor(
    public authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get showSidebar(): boolean {
    if (!this.isBrowser) return false;

    // Hide sidebar on auth pages even if logged in
    const currentUrl = this.router.url;
    if (currentUrl === '/login' || currentUrl === '/register' || currentUrl.includes('/auth/')) {
      return false;
    }

    return this.authService.isLoggedIn();
  }
}
