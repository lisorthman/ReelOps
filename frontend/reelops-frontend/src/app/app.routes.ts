import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './auth/auth.guard';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { ProjectDetailComponent } from './projects/project-detail/project-detail.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // temporary
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Protected project routes
  {
    path: 'projects',
    canActivate: [authGuard],
    component: ProjectListComponent,
  },
  {
    path: 'projects/new',
    canActivate: [authGuard],
    component: ProjectDetailComponent,
  },
  {
    path: 'projects/:id',
    canActivate: [authGuard],
    component: ProjectDetailComponent,
  },

  // Default route
  { path: '', redirectTo: 'projects', pathMatch: 'full' },
  { path: '**', redirectTo: 'projects' },
  
];
