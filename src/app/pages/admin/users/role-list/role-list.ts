import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService, Role, Permission } from '../../../../services/role/role';
import { ToastService } from '../../../../services/toast/toast';

@Component({
    selector: 'app-role-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './role-list.html',
})
export class RoleListComponent implements OnInit {
    roles: Role[] = [];
    permissions: Permission[] = [];
    loading = false;

    // Modal State
    showModal = false;
    isEditing = false;
    currentRole: Partial<Role> = { name: '', description: '' };
    selectedPermissionIds: Set<string | number> = new Set();
    saving = false;

    constructor(
        private roleService: RoleService,
        private toast: ToastService
    ) { }

    ngOnInit() {
        this.loadRoles();
        this.loadPermissions();
    }

    async loadRoles() {
        this.loading = true;
        const { data, error } = await this.roleService.getRoles();
        if (data) {
            this.roles = data;
        } else {
            console.error(error);
            this.toast.show('Failed to load roles', 'error');
        }
        this.loading = false;
    }

    async loadPermissions() {
        const { data } = await this.roleService.getAllPermissions();
        if (data) {
            this.permissions = data;
        }
    }

    openCreateModal() {
        this.isEditing = false;
        this.currentRole = { name: '', description: '' };
        this.selectedPermissionIds.clear();
        this.showModal = true;
    }

    async openEditModal(role: Role) {
        this.isEditing = true;
        this.currentRole = { ...role }; // Copy simple fields
        this.selectedPermissionIds.clear();

        // Load existing permissions for this role
        const { data, error } = await this.roleService.getRoleWithPermissions(role.id);
        if (data && data.permissions) {
            data.permissions.forEach((p: Permission) => this.selectedPermissionIds.add(p.id));
        }

        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    togglePermission(permId: string | number) {
        if (this.selectedPermissionIds.has(permId)) {
            this.selectedPermissionIds.delete(permId);
        } else {
            this.selectedPermissionIds.add(permId);
        }
    }

    async saveRole() {
        if (!this.currentRole.name) {
            this.toast.show('Role name is required', 'error');
            return;
        }

        this.saving = true;
        try {
            let roleId = this.currentRole.id;

            if (this.isEditing && roleId) {
                // Update Role Details
                const { error } = await this.roleService.updateRole(roleId, this.currentRole.name, this.currentRole.description || '');
                if (error) throw error;
                this.toast.show('Role updated successfully', 'success');
            } else {
                // Create New Role
                const { data, error } = await this.roleService.createRole(this.currentRole.name, this.currentRole.description || '');
                if (error || !data) throw error;
                roleId = data.id;
                this.toast.show('Role created successfully', 'success');
            }

            // Update Permissions (for both create and edit)
            if (roleId) {
                const { error: permError } = await this.roleService.updateRolePermissions(roleId, Array.from(this.selectedPermissionIds));
                if (permError) console.error('Error updating permissions:', permError);
            }

            this.closeModal();
            this.loadRoles();
        } catch (err: any) {
            console.error(err);
            this.toast.show(err.message || 'Failed to save role', 'error');
        } finally {
            this.saving = false;
        }
    }

    async deleteRole(role: Role) {
        if (!confirm(`Are you sure you want to delete role "${role.name}"? Users assigned to this role might lose access.`)) return;

        try {
            const { error } = await this.roleService.deleteRole(role.id);
            if (error) throw error;
            this.toast.show('Role deleted', 'success');
            this.loadRoles();
        } catch (err) {
            console.error(err);
            this.toast.show('Failed to delete role', 'error');
        }
    }
}
