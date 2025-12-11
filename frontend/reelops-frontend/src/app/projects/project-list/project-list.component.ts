import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectsService } from '../projects.service';
import { Project } from '../../shared/models/project.model';
import { CastCrewService, CastCrewMember } from '../../services/cast-crew';

interface ProjectWithDirector extends Project {
  directorName?: string;
  castCrewMembers?: string[]; // Array of cast/crew member names
}

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
})
export class ProjectListComponent implements OnInit {
  projects: ProjectWithDirector[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private projectsService: ProjectsService,
    private castCrewService: CastCrewService,
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
        
        // Fetch director info for each project
        this.projects.forEach((project, index) => {
          if (project.id) {
            this.loadDirectorForProject(project.id, index);
          }
        });
        
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error from getProjects:', err);
        this.error = err.error?.message || 'Failed to load projects';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadDirectorForProject(projectId: number, index: number) {
    this.castCrewService.getMembers(projectId).subscribe({
      next: (members: CastCrewMember[]) => {
        // Find director (position contains "Director" or "director")
        const director = members.find(m => 
          m.position && m.position.toLowerCase().includes('director')
        );
        if (director && director.name) {
          this.projects[index].directorName = director.name;
        }
        
        // Store cast/crew member names (limit to first 3 for display)
        if (members.length > 0) {
          this.projects[index].castCrewMembers = members
            .slice(0, 3)
            .map(m => m.name || '')
            .filter(name => name.length > 0);
        }
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Silently fail - director info is optional
        console.log('Could not load director for project', projectId);
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'TBD';
    // Extract just the date part (YYYY-MM-DD) if it includes time
    const dateOnly = dateString.split('T')[0];
    return dateOnly;
  }

  goToNewProject() {
    this.router.navigate(['/projects/new']);
  }

  goToDetail(id: number | undefined) {
    if (!id) return;
    this.router.navigate(['/projects', id]);
  }
}
