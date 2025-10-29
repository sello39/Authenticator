import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { CommonModule } from '@angular/common';
import { UserInterface } from './models/user.interface';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'authenticator-angular';

  authService = inject(AuthService);
  http = inject(HttpClient);

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        this.http
          .get<{ user: UserInterface }>('http://localhost:3000/users', {
            headers: { Authorization: `Token ${token}` },
          })
          .subscribe({
            next: (response) => {
              this.authService.currentUserSig.set(response.user);
            },
            error: () => {
              this.authService.currentUserSig.set(null);
            },
          });
      }
    }
  }

  logout(): void {
    console.log('logout');
    localStorage.removeItem('token');
    this.authService.currentUserSig.set(null);
  }
}
