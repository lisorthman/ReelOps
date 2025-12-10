import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // temporary
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // later: add 'dashboard', 'projects', etc.
];
