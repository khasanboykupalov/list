import { Component, inject, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { User, Response } from '../Interface/user-list';
import { UserService } from '../service/user.service';
import { UserListComponent } from './user-list/user-list.component';
import { UserFilterComponent } from './user-filter/user-filter.component';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [UserListComponent, UserFilterComponent, SkeletonModule],
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.css',
})
export class UsersTableComponent implements OnInit {
  users: User[] = [];
  totalUsers = 0;

  page = 1;
  pageSize = 10;

  sortField: string | undefined;
  sortOrder: 1 | -1 | undefined;

  filters: Record<string, any> = {};
  loading = false;

  private userService = inject(UserService);
  private lastQueryKey = ''; 

  ngOnInit(): void {
    this.loadUsers(); 
  }

  private hash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }
  private pick<T>(seed: string, arr: T[]): T {
    const h = this.hash(seed);
    return arr[h % arr.length];
  }
  private seededInt(seed: string, min: number, max: number): number {
    const h = this.hash(seed);
    return min + (h % (max - min + 1));
  }

  private buildOrderingParam(): string | undefined {
    if (!this.sortField || !this.sortOrder) return undefined;
    return this.sortOrder === 1 ? this.sortField : `-${this.sortField}`;
  }

  private makeQueryKey(): string {
    const ordering = this.buildOrderingParam();

    const cleanFilters: Record<string, any> = {};
    Object.entries(this.filters || {}).forEach(([k, v]) => {
      if (v === null || v === undefined) return;
      if (typeof v === 'string' && v.trim() === '') return;
      cleanFilters[k] = typeof v === 'string' ? v.trim() : v;
    });

    const sortedFilters = Object.keys(cleanFilters)
      .sort()
      .reduce((acc, k) => {
        acc[k] = cleanFilters[k];
        return acc;
      }, {} as Record<string, any>);

    return JSON.stringify({
      page: this.page,
      page_size: this.pageSize,
      ordering: ordering ?? null,
      filters: sortedFilters
    });
  }

  onStateChange(e: {
    page: number;
    rows: number;
    sortField?: string;
    sortOrder?: 1 | -1;
  }) {
    this.page = e.page + 1;
    this.pageSize = e.rows;

    if (e.sortField && (e.sortOrder === 1 || e.sortOrder === -1)) {
      this.sortField = e.sortField;
      this.sortOrder = e.sortOrder;
    } else {
      this.sortField = undefined;
      this.sortOrder = undefined;
    }

    this.loadUsers();
  }

  onFiltersChange(newFilters: Record<string, any>): void {
    this.filters = newFilters;
    this.page = 1;
    this.loadUsers();
  }

  loadUsers(): void {
    const qk = this.makeQueryKey();
    if (qk === this.lastQueryKey) return;
    this.lastQueryKey = qk;

    const ordering = this.buildOrderingParam();
    const params = ordering ? { ...this.filters, ordering } : { ...this.filters };

    this.loading = true; // skeleton uchun
    
    this.userService
      .getUsers<Response>(this.page, this.pageSize, params)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.users = res.data.map((u: any) => {
            const key = String(u.id ?? u.username ?? '');

            const contestIcons = [
              'pi pi-trophy', 'pi pi-star', 'pi pi-flag', 'pi pi-crown', 'pi pi-bolt'
            ];
            const severityList: Array<'info' | 'success' | 'warning' | 'danger'> =
              ['info', 'success', 'warning', 'danger'];

            const contestsSeverity = this.pick(key + '|ICON_SEV', severityList);
            const contestsIcon = this.pick(key + '|ICON', contestIcons);
            const contests = this.seededInt(key + '|C', 50, 150);

            const rankOptions: Array<'R2' | 'R3' | 'R4' | 'R5'> = ['R2', 'R3', 'R4', 'R5'];
            const challengesRank = this.pick(key + '|RANK', rankOptions);
            const rankToSeverity: Record<string, 'info' | 'success' | 'warning' | 'danger'> =
              { R2: 'info', R3: 'success', R4: 'warning', R5: 'danger' };
            const challenges = this.seededInt(key + '|H', 50, 250);

            return {
              ...u,
              maxStreak: (u.streak * 10) / 2,
              contests,
              contestsIcon,
              contestsSeverity,
              challenges,
              challengesRank,
              challengesSeverity: rankToSeverity[challengesRank]
            } as User;
          });

          this.totalUsers = Number(res.total ?? 0);
        },
        error: () => {
          this.users = [];
          this.totalUsers = 0;
        }
      });
  }

  get skeletonRows(): any[] {
    return Array.from({ length: this.pageSize });
  }
}
