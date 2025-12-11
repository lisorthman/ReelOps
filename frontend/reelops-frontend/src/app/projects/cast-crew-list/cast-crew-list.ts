import { Component, Input, OnInit, OnChanges, SimpleChanges, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CastCrewService, CastCrewMember } from '../../services/cast-crew';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-cast-crew-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cast-crew-list.html',
  styleUrl: './cast-crew-list.scss',
})
export class CastCrewList implements OnInit, OnChanges {
  @Input() projectId!: number;

  members: CastCrewMember[] = [];
  currentUserRole: string = '';
  isLoading = false;
  error = '';
  isBrowser: boolean;

  showAddForm = false;
  newMember = {
    email: '',
    role_type: 'crew', // Default
    position: '',
    daily_rate: 0,
    notes: ''
  };

  constructor(
    private castCrewService: CastCrewService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.currentUserRole = this.authService.getCurrentUser()?.role || '';
    // Load members if projectId is already set (fallback if ngOnChanges didn't fire)
    if (this.projectId && this.isBrowser) {
      this.loadMembers();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Load members when projectId is set or changes
    if (changes['projectId'] && this.projectId && this.isBrowser) {
      // If it's the first change and we have a projectId, load members
      // Also reload if projectId actually changed
      if (changes['projectId'].firstChange || 
          (changes['projectId'].previousValue !== changes['projectId'].currentValue)) {
        this.loadMembers();
      }
    }
  }

  loadMembers() {
    this.isLoading = true;
    this.castCrewService.getMembers(this.projectId).subscribe({
      next: (data) => {
        this.members = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load members', err);
        this.error = 'Could not load cast/crew.';
        this.isLoading = false;
      }
    });
  }

  get canManage(): boolean {
    return this.currentUserRole === 'admin' || this.currentUserRole === 'producer';
  }

  addMember() {
    if (!this.newMember.email || !this.newMember.role_type) {
      alert('Email and Role Type are required');
      return;
    }

    this.castCrewService.addMember(this.projectId, this.newMember).subscribe({
      next: (member) => {
        this.members.push(member);
        this.showAddForm = false;
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to add member', err);
        alert(err.error?.message || 'Failed to add member');
      }
    });
  }

  removeMember(memberId: number) {
    if (!confirm('Are you sure you want to remove this member?')) return;

    this.castCrewService.removeMember(this.projectId, memberId).subscribe({
      next: () => {
        this.members = this.members.filter(m => m.id !== memberId);
      },
      error: (err) => {
        console.error('Failed to remove member', err);
        alert('Failed to remove member');
      }
    });
  }

  resetForm() {
    this.newMember = {
      email: '',
      role_type: 'crew',
      position: '',
      daily_rate: 0,
      notes: ''
    };
  }
}
