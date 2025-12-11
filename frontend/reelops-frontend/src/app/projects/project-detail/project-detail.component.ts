import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectsService } from '../projects.service';
import { Project, ProjectStatus } from '../../shared/models/project.model';
import { CastCrewList } from '../cast-crew-list/cast-crew-list';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, CastCrewList, RouterLink],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit {
  projectId: number | null = null;
  project: Project = {
    title: '',
    description: '',
    status: 'planning',
    start_date: '',
    end_date: '',
    budget_total: undefined,
  };
  loading = false;
  saving = false;
  error: string | null = null;
  isEditMode = false;
  isEditing = false; // Toggle between view and edit mode
  isBrowser: boolean;

  statuses: ProjectStatus[] = [
    'planning',
    'pre-production',
    'shooting',
    'post-production',
    'completed',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectsService: ProjectsService,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.projectId = Number(idParam);
      this.isEditMode = true;
      if (this.isBrowser) {
        this.loadProject(this.projectId);
      }
    }
  }

  loadProject(id: number) {
    this.loading = true;
    this.error = null;

    this.projectsService.getProject(id).subscribe({
      next: (project) => {
        this.project = project;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.message || 'Failed to load project';
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'TBD';
    // Extract just the date part (YYYY-MM-DD) if it includes time
    const dateOnly = dateString.split('T')[0];
    return dateOnly;
  }

  goBack() {
    if (this.isEditMode) {
      this.isEditing = false;
      // Reload project to reset any unsaved changes
      if (this.projectId) {
        this.loadProject(this.projectId);
      }
    } else {
      this.router.navigate(['/projects']);
    }
  }

  onSubmit() {
    this.error = null;
    this.saving = true;

    if (!this.project.title || !this.project.status) {
      this.error = 'Title and status are required';
      this.saving = false;
      return;
    }

    if (this.isEditMode && this.projectId) {
      this.projectsService
        .updateProject(this.projectId, this.project)
        .subscribe({
          next: () => {
            this.saving = false;
            this.isEditing = false;
            // Reload project to show updated data
            this.loadProject(this.projectId!);
          },
          error: (err) => {
            console.error(err);
            this.error = err.error?.message || 'Failed to update project';
            this.saving = false;
          },
        });
    } else {
      this.projectsService.createProject(this.project).subscribe({
        next: (newProject) => {
          this.saving = false;
          // Navigate to the new project's detail page
          if (newProject.id) {
            this.router.navigate(['/projects', newProject.id]);
          } else {
            this.router.navigate(['/projects']);
          }
        },
        error: (err) => {
          console.error(err);
          this.error = err.error?.message || 'Failed to create project';
          this.saving = false;
        },
      });
    }
  }
}
