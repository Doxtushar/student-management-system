import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, filter, map, startWith } from 'rxjs';
import { LoginService } from './services/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'studentManagement';
  readonly isLoggedIn$: Observable<boolean> = this.loginService.isLoggedIn$;
  readonly showAppShell$: Observable<boolean> = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map((event) => !event.urlAfterRedirects.startsWith('/login')),
    startWith(!this.router.url.startsWith('/login'))
  );

  constructor(
    private readonly loginService: LoginService,
    private readonly router: Router
  ) {}

  logout(): void {
    this.loginService.logout();
    void this.router.navigate(['/login']);
  }
}
