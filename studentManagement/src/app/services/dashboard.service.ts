import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DashboardStats } from '../models/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly dashboardUrl = `${environment.apiBaseUrl}${environment.dashboardEndpoint}`;

  constructor(private readonly http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.dashboardUrl).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 0) {
      return throwError(() => 'Unable to connect to Spring Boot Server.');
    }

    if (error.status === 404) {
      return throwError(() => 'Dashboard API was not found.');
    }

    if (error.status === 500) {
      return throwError(() => 'Server error while loading dashboard.');
    }

    return throwError(() => 'Unable to load dashboard data.');
  }
}
