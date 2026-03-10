import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserListComponent } from '../users/user-list/user-list';
import { ConfigsComponent } from '../configs/configs';
import { LogsComponent } from '../logs/logs';
import { MenuPermissionService, MenuPermission } from '../../../services/menu-permission/menu-permission.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, UserListComponent, ConfigsComponent, LogsComponent],
    templateUrl: './settings.html'
})
export class SettingsComponent implements OnInit {
    activeTab: 'users' | 'configs' | 'logs' = 'users';
    menuPermissions: MenuPermission[] = [];
    userRole: string | null = null;
    loading = true;

    constructor(
        private authService: AuthService,
        private menuPermissionService: MenuPermissionService
    ) { }

    async ngOnInit() {
        this.authService.currentUser$.subscribe(user => {
            this.userRole = user?.role || null;
        });

        await this.loadMenuPermissions();
    }

    async loadMenuPermissions() {
        const { data } = await this.menuPermissionService.getMyMenus();
        if (data) {
            this.menuPermissions = data;
        }
        this.setInitialTab();
        this.loading = false;
    }

    setInitialTab() {
        const savedTab = sessionStorage.getItem('settings_current_tab');
        if (savedTab && ['users', 'configs', 'logs'].includes(savedTab)) {
            if (this.hasAccess(`/admin/${savedTab}`)) {
                this.activeTab = savedTab as 'users' | 'configs' | 'logs';
                return;
            }
        }

        if (this.hasAccess('/admin/users')) {
            this.activeTab = 'users';
        } else if (this.hasAccess('/admin/configs')) {
            this.activeTab = 'configs';
        } else if (this.hasAccess('/admin/logs')) {
            this.activeTab = 'logs';
        }
    }

    hasAccess(route: string): boolean {
        if (this.userRole === 'super_admin') return true;
        const permission = this.menuPermissions.find(p => p.menu_route === route);
        return !!permission && permission.is_active;
    }

    setTab(tab: 'users' | 'configs' | 'logs') {
        this.activeTab = tab;
        sessionStorage.setItem('settings_current_tab', tab);
    }
}
