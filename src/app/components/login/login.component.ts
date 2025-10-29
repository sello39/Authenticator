import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth.service';
import { UserInterface } from '../../models/user.interface';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
 
  form!: FormGroup;

  fb = inject(FormBuilder);
  http = inject(HttpClient);
  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.http.get<UserInterface[]>('http://localhost:3000/users')
        .subscribe({
          next: (users) => {
            const user = users.find(u => u.email === this.form.get('email')?.value);
            if (!user) {
              console.error('User not registered');
              return;
            }

            // Proceed with login
            this.http.post<{ token: string }>('http://localhost:3000/users', {
              email: this.form.get('email')?.value,
              password: this.form.get('password')?.value,
            }).subscribe({
              next: (response) => {
                const loggedInUser: UserInterface = {
                  email: this.form.get('email')?.value,
                  token: response.token,
                };
                console.log('response', loggedInUser);
                localStorage.setItem('token', loggedInUser.token);
                this.authService.setCurrentUser(loggedInUser);
                this.router.navigateByUrl('/');
              },
              error: (err) => {
                if (err.status === 401) {
                  console.error('Invalid credentials', err);
                } else {
                  console.error('Login failed', err);
                }
              },
            });
          },
          error: (err) => {
            console.error('Failed to fetch users', err);
          }
        });
    }
  }
}