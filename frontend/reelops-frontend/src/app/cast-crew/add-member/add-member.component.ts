import { Component, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CastCrewService } from '../cast-crew.service';
import { UsersService, SimpleUser } from '../../users/users.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-add-member',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss']
})
export class AddMemberComponent implements OnInit {
  @Input() projectId!: number;

  // form
  selectedEmail = '';
  role_type: 'cast' | 'crew' = 'cast';
  position = '';
  daily_rate?: number;
  notes = '';

  // search
  searchQuery = '';
  searchResults: SimpleUser[] = [];
  searching = false;
  error: string | null = null;

  constructor(
    private service: CastCrewService,
    private usersService: UsersService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!this.projectId) {
      this.error = 'projectId is required';
    }
  }

  searchUsers() {
    if (!isPlatformBrowser(this.platformId)) return;
    const q = this.searchQuery.trim();
    if (!q) { this.searchResults = []; return; }
    this.searching = true;
    this.usersService.searchUsers(q).subscribe({
      next: (rows) => {
        this.searchResults = rows;
        this.searching = false;
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.message || 'Search failed';
        this.searching = false;
      }
    });
  }

  pickUser(u: SimpleUser) {
    this.selectedEmail = u.email;
    this.searchResults = [];
    this.searchQuery = `${u.name} <${u.email}>`;
  }

  submit() {
    if (!this.selectedEmail || !this.role_type) {
      alert('Select a user and role');
      return;
    }
    const payload: any = {
      email: this.selectedEmail,
      role_type: this.role_type,
      position: this.position || undefined,
      daily_rate: this.daily_rate ?? undefined,
      notes: this.notes || undefined
    };
    this.service.addMember(this.projectId, payload).subscribe({
      next: () => {
        alert('Member added');
        // clear form
        this.selectedEmail = '';
        this.position = '';
        this.daily_rate = undefined;
        this.notes = '';
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to add member');
      }
    });
  }
}
