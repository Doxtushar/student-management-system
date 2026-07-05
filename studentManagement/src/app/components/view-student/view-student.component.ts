import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Student } from '../../models/student';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-view-student',
  templateUrl: './view-student.component.html',
  styleUrls: ['./view-student.component.css']
})
export class ViewStudentComponent implements OnInit {
  student: Student | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly studentService: StudentService
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = rawId ? Number(rawId) : NaN;

    if (Number.isNaN(id) || id <= 0) {
      this.errorMessage = 'Invalid student ID.';
      return;
    }

    this.isLoading = true;
    this.studentService.getStudentById(id).subscribe({
      next: (student: Student) => {
        this.student = student;
        this.isLoading = false;
      },
      error: (errorMessage: string) => {
        this.errorMessage = errorMessage;
        this.isLoading = false;
      }
    });
  }

  get displayName(): string {
    return this.student ? this.studentService.getStudentName(this.student) : 'Unnamed student';
  }
}
