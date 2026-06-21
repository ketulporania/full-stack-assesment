import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { hasProfileGuard, noProfileGuard } from './guards/profile.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'form',
    loadComponent: () => import('./form/personal-details/personal-details.component').then(m => m.PersonalDetailsComponent),
    canActivate: [authGuard, noProfileGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile-page/profile-page.component').then(m => m.ProfilePageComponent),
    canActivate: [authGuard, hasProfileGuard]
  },
  { path: '**', redirectTo: 'login' }
];
