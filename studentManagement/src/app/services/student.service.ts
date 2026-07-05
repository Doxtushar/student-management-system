import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Student, StudentGender, StudentPayload } from '../models/student';
import { environment } from '../../environments/environment';

type RawStudent = Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.studentEndpoint}`;
  private readonly searchUrl = `${environment.apiBaseUrl}/home/search`;

  constructor(private http: HttpClient) {}

  getAllStudents(): Observable<Student[]> {
    return this.http.get<RawStudent[]>(`${this.baseUrl}/getAllStudent`).pipe(
      map((students) =>
        students.map((student) => this.normalizeStudent(student)),
      ),
      catchError(this.handleError),
    );
  }

  getStudentById(id: number): Observable<Student> {
    return this.http
      .get<RawStudent>(`${this.baseUrl}/getStudentById/${id}`)
      .pipe(
        map((student) => this.normalizeStudent(student)),
        catchError(this.handleError),
      );
  }

  saveStudent(student: StudentPayload): Observable<Student> {
    return this.http.post<RawStudent>(`${this.baseUrl}/save`, student).pipe(
      map((student) => this.normalizeStudent(student)),
      catchError(this.handleError),
    );
  }

  updateStudent(student: Student): Observable<Student> {
    return this.http.put<RawStudent>(`${this.baseUrl}/update`, student).pipe(
      map((student) => this.normalizeStudent(student)),
      catchError(this.handleError),
    );
  }

  deleteStudent(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/delete/${id}`)
      .pipe(catchError(this.handleError));
  }

  searchStudentsByName(name: string): Observable<Student[]> {
    const encodedName = encodeURIComponent(name);

    return this.http
      .get<RawStudent[]>(`${this.searchUrl}/${encodedName}`)
      .pipe(
        catchError(() => this.http.get<RawStudent[]>(`${this.baseUrl}/searchByName/${encodedName}`)),
        map((students) =>
          students.map((student) => this.normalizeStudent(student)),
        ),
        catchError(this.handleError),
      );
  }

  getStudentName(student: Student): string {
    return student.name ?? 'Unnamed Student';
  }

  private normalizeStudent(raw: RawStudent): Student {
    const gender = this.normalizeGender(raw['gender']) ?? 'Male';

    return {
      id: this.toNumber(raw['id']),
      name: this.toOptionalString(raw['name']) ?? '',
      email: this.toOptionalString(raw['email']) ?? '',
      mobileNumber: this.toOptionalString(raw['mobileNumber']) ?? '',
      course: this.toOptionalString(raw['course']) ?? '',
      address: this.toOptionalString(raw['address']) ?? '',
      gender,
      dateOfBirth: this.formatDateOfBirth(raw['dateOfBirth']),
    };
  }

  private formatDateOfBirth(value: unknown): string {
    const dateOfBirth = this.toString(value);
    const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateOfBirth);

    if (isoDateMatch) {
      return `${isoDateMatch[3]}-${isoDateMatch[2]}-${isoDateMatch[1]}`;
    }

    return dateOfBirth;
  }

  private normalizeGender(value: unknown): StudentGender | undefined {
    const gender = this.toString(value);

    if (gender === 'Male' || gender === 'Female' || gender === 'Other') {
      return gender;
    }

    return undefined;
  }

  private toNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  private toString(value: unknown): string {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  private toOptionalString(value: unknown): string | undefined {
    const text = this.toString(value);
    return text || undefined;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Something went wrong. Please try again.';

    if (error.status === 0) {
      message = 'Unable to connect to Spring Boot Server.';
    } else if (error.status === 404) {
      message = 'Requested resource not found.';
    } else if (error.status === 500) {
      message = 'Internal Server Error.';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    return throwError(() => message);
  }
}
