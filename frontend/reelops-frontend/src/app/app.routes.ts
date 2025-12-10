import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // temporary
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // later: add 'dashboard', 'projects', etc.
];
