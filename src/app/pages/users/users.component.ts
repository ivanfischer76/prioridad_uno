import { Component } from '@angular/core';

import { TableModule } from 'primeng/table';
import { User } from '../../models/admin/user';


@Component({
  selector: 'app-users',
  imports: [
    TableModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
    users: User[] = [];

    editUser(user: User){
        console.log('Edit user', user);
    }

    confirmDeleteUser(user: User){
        console.log('Delete user', user);
    }
}
