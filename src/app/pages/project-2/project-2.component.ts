import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-project-2',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './project-2.component.html',
  styleUrls: ['./project-2.component.scss']
})
export class Project2Component {
  constructor(private router: Router) {}
  volverAProjects() {
    this.router.navigate(['/projects']);
  }
}
