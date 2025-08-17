import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';
import { User } from '../../Interface/user-list';
import { BadgeModule } from 'primeng/badge';
import { RelativeI18nPipe } from '../../pipe/relative-i18n.pipe';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, TableModule, TranslateModule, BadgeModule, RelativeI18nPipe],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {
  @Input() users: User[] = [];
  @Input() total = 0;
  @Input() page = 1;
  @Input() pageSize = 10;

  @Output() stateChange = new EventEmitter<{
    page: number;
    rows: number;
    sortField?: string;
    sortOrder?: 1 | -1;
  }>();

  onLazyLoad(e: TableLazyLoadEvent) {
    const rows = e.rows ?? this.pageSize;
    const first = e.first ?? 0;
    const zeroBased = Math.floor(first / rows);

    const sf = typeof e.sortField === 'string' && e.sortField.length ? e.sortField : undefined;
    const so = (e.sortOrder === 1 || e.sortOrder === -1) ? (e.sortOrder as 1 | -1) : undefined;

    this.stateChange.emit({
      page: zeroBased,
      rows,
      sortField: sf,
      sortOrder: so
    });
  }

  initial(u: User): string {
    const s = (u.firstName || u.username || '').trim();
    return s ? s[0].toUpperCase() : 'U';
  }

}
