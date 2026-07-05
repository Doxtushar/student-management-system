import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { StudentGender, StudentPayload } from '../../models/student';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.css'],
})
export class AddStudentComponent {
  isSubmitting = false;
  readonly genders: StudentGender[] = ['Male', 'Female', 'Other'];
  private readonly dateOfBirthPattern =/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

  readonly studentForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
    course: ['', [Validators.required]],
    gender: ['Male' as StudentGender, [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    dateOfBirth: ['', [Validators.required, Validators.pattern(this.dateOfBirthPattern)]]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly studentService: StudentService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {}

  saveStudent(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const raw = this.studentForm.getRawValue();
    const student: StudentPayload = {
      name: raw.name,
      address: raw.address,
      course: raw.course,
      gender: raw.gender as StudentGender,
      email: raw.email,
      mobileNumber: raw.mobileNumber,
      dateOfBirth: raw.dateOfBirth
    };

    this.studentService.saveStudent(student).pipe(
      finalize(() => (this.isSubmitting = false))
    ).subscribe({
      next: () => {
        this.snackBar.open('Student added successfully.', 'Close', { duration: 2500 });
        void this.router.navigate(['/students']);
      },
      error: (message: string) => this.snackBar.open(message, 'Close', { duration: 4000 }),
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
