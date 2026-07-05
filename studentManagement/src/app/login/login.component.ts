import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  hidePassword = true;
  isSubmitting = false;

  readonly loginForm = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(3)]]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly loginService: LoginService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {}

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.loginService.login(this.loginForm.getRawValue()).pipe(
      finalize(() => (this.isSubmitting = false))
    ).subscribe({
      next: (response) => {
        if (!response.success) {
          this.snackBar.open(response.message ?? 'Invalid username or password.', 'Close', {
            duration: 3500,
            panelClass: ['snackbar-error']
          });
          return;
        }

        this.snackBar.open(response.message ?? 'Login successful.', 'Close', {
          duration: 2500,
          panelClass: ['snackbar-success']
        });
        void this.router.navigate(['/dashboard']);
      },
      error: (message: string) => this.snackBar.open(message, 'Close', {
        duration: 4000,
        panelClass: ['snackbar-error']
      })
    });
  }

  get usernameControl() {
    return this.loginForm.controls.username;
  }

  get passwordControl() {
    return this.loginForm.controls.password;
  }
}
