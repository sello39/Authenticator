import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserInterface } from '../../models/user.interface';
import { AuthService } from '../../auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  standalone: true,
})
export class RegisterComponent {
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

  getPasswordErrorMessages(): string[] {
    const passwordControl = this.form?.get('password');
    const errors: string[] = [];
    
    if (passwordControl?.touched) {
      const value = passwordControl.value || '';
      
      if (value.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/[A-Z]/.test(value)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(value)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        errors.push('Password must contain at least one special character');
      }
    }
    return errors;
  }

  private passwordValidator(control: any) {
    const value = control.value || '';
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isLengthValid = value.length >= 8;

    const valid = hasUpperCase && hasLowerCase && hasSpecialChar && isLengthValid;
    return valid ? null : { invalidPassword: true };
  }

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, this.passwordValidator.bind(this)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      console.error('Form is invalid');
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.get('email')!.value;
    const password = this.form.get('password')!.value;
    const mockToken = btoa(`${email}_${Date.now()}`);

    this.http.get<UserInterface[]>('http://localhost:3000/users').subscribe({
      next: (users) => {
        const userExists = users.some((u) => u.email === email);
        if (userExists) {
          console.error('User already registered');
          return;
        }

        this.http
          .post<{ id: string; email: string }>('http://localhost:3000/users', { email, password })
          .subscribe({
            next: () => {
              const user: UserInterface = { email: email, token: mockToken };
              localStorage.setItem('token', user.token ?? '');
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
      },
    });
  }
}
