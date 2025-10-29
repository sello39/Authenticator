import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserInterface } from '../../models/user.interface';
import { AuthService } from '../../auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  authService = inject(AuthService);
  router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    this.http.get<UserInterface[]>('http://localhost:3000/users')
      .subscribe({
        next: (users) => {
          const userExists = users.some(u => u.email === this.form.get('email')?.value);
          if (userExists) {
            console.error('User already registered');
            return;
          }

          // Proceed with registration
          this.http
            .post<{token: string }>('http://localhost:3000/users', {
              email: this.form.get('email')?.value,
              password: this.form.get('password')?.value,
            })
            .subscribe({
              next: (response) => {
                const user: UserInterface = {
                  email: this.form.get('email')?.value,
                  token: response.token,
                };
                console.log('response', user);
                localStorage.setItem('token', user.token);
                this.authService.setCurrentUser(user);
                this.router.navigateByUrl('/');
              },
              error: (error) => {
                console.error('There was an error!', error);
              },
            });
        },
        error: (err) => {
          console.error('Failed to fetch users', err);
        }
      });
  }
}
