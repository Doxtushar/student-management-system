import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddStudentComponent } from './components/add-student/add-student.component';
import { StudentListComponent } from './components/student-list/student-list.component';
import { UpdateStudentComponent } from './components/update-student/update-student.component';
import { ViewStudentComponent } from './components/view-student/view-student.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './shared/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'students', component: StudentListComponent, canActivate: [AuthGuard] },
  { path: 'students/add', component: AddStudentComponent, canActivate: [AuthGuard] },
  { path: 'students/edit/:id', component: UpdateStudentComponent, canActivate: [AuthGuard] },
  { path: 'students/view/:id', component: ViewStudentComponent, canActivate: [AuthGuard] },
  { path: 'student-list', redirectTo: 'students' },
  { path: 'add-student', redirectTo: 'students/add' },
  { path: 'update-student/:id', redirectTo: 'students/edit/:id' },
  { path: 'view-student/:id', redirectTo: 'students/view/:id' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
