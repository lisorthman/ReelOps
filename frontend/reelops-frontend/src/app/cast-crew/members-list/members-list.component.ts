import { Component, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CastCrewService } from '../cast-crew.service';
import { CastCrewMember } from '../cast-crew.model';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-members-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './members-list.component.html',
  styleUrls: ['./members-list.component.scss']
})
export class MembersListComponent implements OnInit {
  @Input() projectId!: number;
  members: CastCrewMember[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private service: CastCrewService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!this.projectId) {
      this.error = 'projectId is required';
      return;
    }
    // Only fetch on browser to avoid SSR issues
    if (isPlatformBrowser(this.platformId)) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.error = null;
    this.service.getMembers(this.projectId).subscribe({
      next: (rows) => {
        this.members = rows;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.message || 'Failed to load members';
        this.loading = false;
      }
    });
  }

  onRemove(member: CastCrewMember) {
    if (!confirm(`Remove ${member.name || member.email} from project?`)) return;
    this.service.removeMember(this.projectId, member.id).subscribe({
      next: () => this.load(),
      error: (err) => alert(err.error?.message || 'Failed to remove')
    });
  }

  onEdit(member: CastCrewMember) {
    // You can open an edit modal. For quickness, navigate to edit route or emit event.
    // Here we simply prompt to change position (simple inline edit)
    const newPos = prompt('New position', member.position || '');
    if (newPos === null) return;
    this.service.updateMember(this.projectId, member.id, { position: newPos }).subscribe({
      next: () => this.load(),
      error: (err) => alert(err.error?.message || 'Failed to update')
    });
  }
}
