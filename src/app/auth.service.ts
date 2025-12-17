import { Injectable, signal } from '@angular/core';
import { UserInterface } from './models/user.interface';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUserSig = signal<UserInterface | null>(null);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private router: Router) {
    if (this.isBrowser) {
      this.loadUser();
    }
  }

  private loadUser(): void {
    if (!this.isBrowser) return;

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSig.set(user);
      } catch (e) {
        console.error('Failed to parse stored user');
        localStorage.removeItem('user');
      }
    }
  }

  getCurrentUser() {
    return this.currentUserSig();
  }

  setCurrentUser(user: UserInterface | null) {
    this.currentUserSig.set(user);
    if (this.isBrowser) {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', user.token || '');
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }

  logout() {
    this.setCurrentUser(null);
    this.router.navigateByUrl('/login');
  }
}