import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { DashboardStats } from '../models/dashboard';
import { DashboardService } from '../services/dashboard.service';

interface DashboardCard {
  label: string;
  value: number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isLoading = false;
  errorMessage = '';
  cards: DashboardCard[] = [];

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getStats().pipe(
      finalize(() => (this.isLoading = false))
    ).subscribe({
      next: (stats) => this.cards = this.toCards(stats),
      error: (message: string) => this.errorMessage = message
    });
  }

  private toCards(stats: DashboardStats): DashboardCard[] {
    return [
      { label: 'Total Students', value: stats.totalStudents, icon: 'groups', color: 'student' },
      { label: 'Total Courses', value: stats.totalCourses, icon: 'menu_book', color: 'course' },
      { label: 'Male Students', value: stats.totalMaleStudents, icon: 'man', color: 'male' },
      { label: 'Female Students', value: stats.totalFemaleStudents, icon: 'woman', color: 'female' }
    ];
  }
}
