import { Injectable, signal } from '@angular/core';
import { UserInterface } from './models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
 
  currentUserSig = signal<UserInterface | null>(null);

  getCurrentUser() {
    debugger;
    return this.currentUserSig();
  }

  setCurrentUser(user: UserInterface | null) {
    this.currentUserSig.set(user);
  }
}