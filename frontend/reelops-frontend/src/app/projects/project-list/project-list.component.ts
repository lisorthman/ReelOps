import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ProjectsService } from '../projects.service';
import { Project } from '../../shared/models/project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private projectsService: ProjectsService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    console.log('✅ ProjectListComponent init');

    // Only fetch on browser, not during SSR
    if (isPlatformBrowser(this.platformId)) {
      this.fetchProjects();
    }
  }

  fetchProjects() {
    console.log('✅ fetchProjects() called');
    this.loading = true;
    this.error = null;

    this.projectsService.getProjects().subscribe({
      next: (projects) => {
        console.log('✅ projects from API:', projects);
        // Handle case where backend might return null or non-array
        this.projects = Array.isArray(projects) ? projects : [];
        this.loading = false;
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: (err) => {
        console.error('❌ Error from getProjects:', err);
        this.error = err.error?.message || 'Failed to load projects';
        this.loading = false;
        this.cdr.detectChanges(); // Manually trigger change detection
      },
    });
  }

  goToNewProject() {
    this.router.navigate(['/projects/new']);
  }

  goToDetail(id: number | undefined) {
    if (!id) return;
    this.router.navigate(['/projects', id]);
  }
}
