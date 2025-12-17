import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth.service';
import { UserInterface } from '../../models/user.interface';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true,
})
export class LoginComponent implements OnInit {
  form!: FormGroup;

  fb = inject(FormBuilder);
  http = inject(HttpClient);
  authService = inject(AuthService);
  router = inject(Router);

  getEmailErrorMessage(): string | null {
    const emailControl = this.form?.get('email');
    if (!emailControl) return null;
    if (emailControl.touched && emailControl.invalid) {
      if (emailControl.errors?.['required']) {
        return 'Email is required';
      }
      if (emailControl.errors?.['email']) {
        return 'Please enter a valid email address';
      }
    }
    return null;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      console.error('Form is invalid');
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.get('email')!.value;
    const password = this.form.get('password')!.value;
    const mockToken = btoa(`${email}_${Date.now()}`);

    this.http.get<UserInterface[]>('http://localhost:3000/users').subscribe({
      next: (users) => {
        const user = users.find((u) => u.email === email);

        if (!user) {
          console.error('User not registered');
          return;
        }

        if (user.password !== password) {
          console.error('Invalid password');
          return;
        }

        const loggedInUser: UserInterface = {
          email: email,
          token: mockToken,
        };

        localStorage.setItem('token', mockToken);
        this.authService.setCurrentUser(loggedInUser);
        this.router.navigateByUrl('/');
      },
      error: (error: Error) => {
        console.error('Failed to fetch users:', error);
      },
    });
  }
}
