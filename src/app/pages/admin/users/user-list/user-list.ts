import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserProfile } from '../../../../services/user/user';
import { ToastService } from '../../../../services/toast/toast';
import { FormsModule } from '@angular/forms';
import { RoleListComponent } from '../role-list/role-list';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RoleListComponent],
    templateUrl: './user-list.html',
})
export class UserListComponent implements OnInit {
    users: UserProfile[] = [];
    filteredUsers: UserProfile[] = [];
    loading = false;

    // Tab system: 'roles' first, then 'users'
    activeTab: 'roles' | 'users' = 'roles';

    // Filters
    searchQuery = '';
    selectedRole = 'Semua';

    constructor(
        private userService: UserService,
        private toast: ToastService
    ) { }

    ngOnInit() {
        this.loadUsers();
    }

    setActiveTab(tab: 'roles' | 'users') {
        this.activeTab = tab;
        if (tab === 'users') {
            this.loadUsers();
        }
    }

    async loadUsers() {
        this.loading = true;
        const { data, error } = await this.userService.getAllUsers();
        if (data) {
            this.users = data;
            this.filterUsers();
        }
        this.loading = false;
    }

    filterUsers() {
        let result = this.users;

        // Role Filter
        if (this.selectedRole !== 'Semua') {
            result = result.filter(u => u.role === this.selectedRole);
        }

        // Search
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            result = result.filter(u =>
                (u.full_name || '').toLowerCase().includes(q) ||
                (u.email || '').toLowerCase().includes(q)
            );
        }

        this.filteredUsers = result;
    }

    setRoleFilter(role: string) {
        this.selectedRole = role;
        this.filterUsers();
    }

    async updateUserRole(user: UserProfile, newRole: UserProfile['role']) {
        if (!confirm(`Ubah role user ${user.full_name} menjadi ${newRole}?`)) return;

        try {
            await this.userService.updateUserRole(user.id, newRole);
            await this.loadUsers();
            this.toast.show(`Role ${user.full_name} diupdate menjadi ${newRole}`, 'success');
        } catch (e) {
            console.error(e);
            this.toast.show('Gagal update role.', 'error');
        }
    }
}
