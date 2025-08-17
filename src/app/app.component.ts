import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { UsersTableComponent } from './users-table/users-table.component';

@Component({
  selector: 'app-root',
  imports: [ButtonModule, UsersTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Users';
}
