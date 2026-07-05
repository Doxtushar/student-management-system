import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Student, StudentGender } from '../../models/student';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-update-student',
  templateUrl: './update-student.component.html',
  styleUrls: ['./update-student.component.css']
})
export class UpdateStudentComponent implements OnInit {
  isLoading = false;
  isSubmitting = false;
  message = '';
  readonly genders: StudentGender[] = ['Male', 'Female', 'Other'];
  private readonly dateOfBirthPattern = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
  private studentId: number | null = null;

  readonly studentForm = this.formBuilder.nonNullable.group({
    id: [0, [Validators.required, Validators.min(1)]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    course: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    gender: ['Male' as StudentGender, [Validators.required]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
    dateOfBirth: ['', [Validators.required, Validators.pattern(this.dateOfBirthPattern)]]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly studentService: StudentService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    this.studentId = rawId ? Number(rawId) : null;

    if (!this.studentId || Number.isNaN(this.studentId)) {
      this.message = 'Invalid student ID.';
      return;
    }

    this.loadStudent(this.studentId);
  }

  updateStudent(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    const raw = this.studentForm.getRawValue();
    const payload: Student = {

      id: raw.id,
      name: raw.name,
      course: raw.course,
      gender: raw.gender as StudentGender,
      email: raw.email,
      mobileNumber: raw.mobileNumber,
      address: raw.address,
      dateOfBirth: raw.dateOfBirth
    };

    this.studentService.updateStudent(payload).pipe(
      finalize(() => (this.isSubmitting = false))
    ).subscribe({
      next: () => {
        this.snackBar.open('Student updated successfully.', 'Close', { duration: 2500 });
        void this.router.navigate(['/students']);
      },
      error: (errorMessage: string) => {
        this.message = errorMessage;
        this.snackBar.open(errorMessage, 'Close', { duration: 4000 });
      }
    });
  }

  private loadStudent(id: number): void {
    this.isLoading = true;
    this.message = '';
    this.studentService.getStudentById(id).subscribe({
      next: (student: Student) => {
        this.studentForm.patchValue({
          id: student.id ?? id,
          name: this.studentService.getStudentName(student),
          course: student.course ?? '',
          gender: student.gender ?? 'Male',
          email: student.email ?? '',
          mobileNumber: student.mobileNumber ?? '',
          address: student.address ?? '',
          dateOfBirth: student.dateOfBirth ?? ''
        });
        this.isLoading = false;
      },
      error: (errorMessage: string) => {
        this.message = errorMessage;
        this.isLoading = false;
      }
    });
  }

  get stNameControl() {
    return this.studentForm.controls.name;
  }

  get addressControl() {
    return this.studentForm.controls.address;
  }

  get courseControl() {
    return this.studentForm.controls.course;
  }

  get emailControl() {
    return this.studentForm.controls.email;
  }

  get mobileNumberControl() {
    return this.studentForm.controls.mobileNumber;
  }

  get dateOfBirthControl() {
    return this.studentForm.controls.dateOfBirth;
  }
}
