import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectsService } from '../projects.service';
import { Project, ProjectStatus } from '../../shared/models/project.model';
import { CastCrewList } from '../cast-crew-list/cast-crew-list';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, CastCrewList],
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
            this.router.navigate(['/projects']);
          },
          error: (err) => {
            console.error(err);
            this.error = err.error?.message || 'Failed to update project';
            this.saving = false;
          },
        });
    } else {
      this.projectsService.createProject(this.project).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/projects']);
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
