import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, map, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth';

type LoginApiResponse = LoginResponse | string | boolean | null;

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly loginUrl = `https://student-management-backend-production-e84e.up.railway.app/login`;
  private readonly loggedInSubject = new BehaviorSubject<boolean>(localStorage.getItem('isLoggedIn') === 'true');

  readonly isLoggedIn$ = this.loggedInSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginApiResponse>(this.loginUrl, credentials).pipe(
      map((response) => this.normalizeLoginResponse(response, credentials.username)),
      tap((response) => {
        if (response.success) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', response.username ?? credentials.username);
          this.loggedInSubject.next(true);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    this.loggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }

  private normalizeLoginResponse(response: LoginApiResponse, username: string): LoginResponse {
    if (response === null || response === undefined) {
      return { success: false, username, message: 'Invalid username or password.' };
    }

    if (typeof response === 'boolean') {
      return {
        success: response,
        username,
        message: response ? 'Login successful.' : 'Invalid username or password.'
      };
    }

    if (typeof response === 'string') {
      const normalized = response.trim().toLowerCase();
      if (normalized === 'true' || normalized === 'success' || normalized === 'login successful' || normalized === 'login successful.') {
        return { success: true, username, message: response };
      }

      if (normalized === 'false' || normalized === 'failed' || normalized === 'fail') {
        return { success: false, username, message: 'Invalid username or password.' };
      }

      const success = !this.isFailureMessage(normalized);
      return { success, username, message: response };
    }

    const success = this.resolveSuccess(response);
    return {
      success,
      username: response.username ?? username,
      message: response.message ?? (success ? 'Login successful.' : 'Invalid username or password.')
    };
  }

  private resolveSuccess(response: LoginResponse): boolean {
    if (typeof response.success === 'boolean') {
      return response.success;
    }

    if (typeof response.valid === 'boolean') {
      return response.valid;
    }

    if (typeof response.authenticated === 'boolean') {
      return response.authenticated;
    }

    if (response.message) {
      return !this.isFailureMessage(response.message.toLowerCase());
    }

    return false;
  }

  private isFailureMessage(message: string): boolean {
    return ['invalid', 'fail', 'incorrect', 'wrong', 'denied', 'unauthorized', 'error', 'not found']
      .some((keyword) => message.includes(keyword));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 0) {
      return throwError(() => 'Unable to connect to Spring Boot Server.');
    }

    if (error.status === 401 || error.status === 403) {
      return throwError(() => 'Invalid username or password.');
    }

    if (error.status === 404) {
      return throwError(() => 'Login API was not found.');
    }

    if (error.status === 500) {
      return throwError(() => 'Server error while signing in.');
    }

    return throwError(() => 'Login failed. Please try again.');
  }
}
