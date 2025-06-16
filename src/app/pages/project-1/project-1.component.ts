import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-project-1',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './project-1.component.html',
  styleUrls: ['./project-1.component.scss']
})
export class Project1Component {
  constructor(private router: Router) {}
  volverAProjects() {
    this.router.navigate(['/projects']);
  }
}
