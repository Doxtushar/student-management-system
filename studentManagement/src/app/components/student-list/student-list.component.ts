import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { Student } from '../../models/student';
import { StudentService } from '../../services/student.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit, AfterViewInit {
  readonly displayedColumns = ['id', 'name', 'course', 'gender', 'email', 'mobileNumber', 'dateOfBirth', 'address', 'actions'];
  readonly dataSource = new MatTableDataSource<Student>([]);
  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  isLoading = false;

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    private readonly studentService: StudentService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadStudents();
    this.searchControl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap((searchTerm) => {
        this.isLoading = true;
        const trimmedSearchTerm = searchTerm.trim();
        const request = trimmedSearchTerm
          ? this.studentService.searchStudentsByName(trimmedSearchTerm)
          : this.studentService.getAllStudents();

        return request.pipe(
          catchError((message: string) => {
            this.showMessage(message);
            return of([]);
          }),
          finalize(() => (this.isLoading = false))
        );
      }),
    ).subscribe({
      next: (students) => this.setStudents(students)
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator ?? null;
    this.dataSource.sort = this.sort ?? null;
  }

  loadStudents(): void {
    this.isLoading = true;

    this.studentService
      .getAllStudents()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (students: Student[]) => this.setStudents(students),
        error: (errorMessage: string) => {
          this.setStudents([]);
          this.showMessage(errorMessage);
        }
      });
  }

  deleteStudent(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        title: 'Delete student',
        message: 'Are you sure you want to delete this student?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.studentService.deleteStudent(id).subscribe({
        next: () => {
          this.snackBar.open('Student deleted successfully.', 'Close', { duration: 2500 });
          this.loadStudents();
        },
        error: (errorMessage: string) => this.showMessage(errorMessage)
      });
    });
  }

  getStudentName(student: Student): string {
    return this.studentService.getStudentName(student);
  }

  private setStudents(students: Student[]): void {
    this.dataSource.data = students;
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 4000 });
  }
}
