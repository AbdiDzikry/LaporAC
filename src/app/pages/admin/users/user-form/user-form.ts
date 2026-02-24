import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService, UserProfile } from '../../../../services/user/user';
import { RoleService, Role } from '../../../../services/role/role';
import { ToastService } from '../../../../services/toast/toast';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './user-form.html',
})
export class UserFormComponent implements OnInit {
    userId: string | null = null;
    isEditing = false;
    loading = false;
    saving = false;

    // Form Data
    userData: any = {
        email: '',
        password: '',
        full_name: '',
        role: ''
    };

    roles: Role[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private roleService: RoleService,
        private toast: ToastService
    ) { }

    ngOnInit() {
        this.userId = this.route.snapshot.paramMap.get('id');
        this.isEditing = !!this.userId;

        this.loadRoles();
        if (this.isEditing) {
            this.loadUser();
        }
    }

    async loadRoles() {
        const { data } = await this.roleService.getRoles();
        if (data) {
            this.roles = data;
        }
    }

    async loadUser() {
        this.loading = true;

        if (!this.userId) {
            this.loading = false;
            return;
        }

        const { data, error } = await this.userService.getUserById(this.userId);

        if (data) {
            this.userData = { ...data };
            // Passwords are not retrievable
            this.userData.password = '';
        } else {
            this.toast.show('Failed to load user', 'error');
            this.router.navigate(['/admin/users']);
        }
        this.loading = false;
    }

    async saveUser() {
        if (!this.userData.email || !this.userData.full_name) {
            this.toast.show('Please fill in all required fields', 'error');
            return;
        }

        if (!this.isEditing && !this.userData.password) {
            this.toast.show('Password is required for new users', 'error');
            return;
        }

        this.saving = true;
        try {
            if (this.isEditing && this.userId) {
                // Update Profile
                const updates: any = {
                    full_name: this.userData.full_name,
                    role: this.userData.role // or role_id depending on backend
                };

                const { error } = await this.userService.updateUser(this.userId, updates);

                if (error) throw error;
                this.toast.show('User updated successfully', 'success');
            } else {
                // Create User
                // WARNING: Client-side creation is limited. 
                // We'll attempt a direct profile insert ONLY if the user exists in Auth but not profile? 
                // NO, we need to create Auth user. 
                // Since this is a client-side app, we can't create a user without logging in as them 
                // unless we use a Supabase Edge Function that uses service_role key.

                // For this demo/implementation, we will show a toast explanation.

                this.toast.show('Creating new users requires Backend Admin Function (not implemented in this client-only demo). please create user manually via Supabase Dashboard.', 'warning');
                console.warn('Cannot create auth user from client side without logging out.');

                // Alternatively, if we just want to update the role of an existing user found by email?
                return;
            }

            this.router.navigate(['/admin/users']);
        } catch (err: any) {
            console.error(err);
            this.toast.show(err.message || 'Failed to save user', 'error');
        } finally {
            this.saving = false;
        }
    }
}
