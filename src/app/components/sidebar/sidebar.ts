import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { MenuPermissionService, MenuPermission } from '../../services/menu-permission/menu-permission.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  userRole: string | null = null;
  userName: string = '';
  userEmail: string = '';
  menuPermissions: MenuPermission[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private menuPermissionService: MenuPermissionService
  ) { }

  async ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.userRole = user?.role || null;
      this.userName = user?.name || user?.full_name || 'User';
      this.userEmail = user?.email || '';
    });

    // Load menu permissions for current user
    await this.loadMenuPermissions();
  }

  async loadMenuPermissions() {
    const { data } = await this.menuPermissionService.getMyMenus();
    if (data) {
      this.menuPermissions = data;
    }
  }

  async logout() {
    await this.authService.signOut();
    // AuthService handles navigation and state clearing
  }

  /**
   * Check if menu item should be shown
   */
  shouldShowMenu(route: string): boolean {
    // Super admin sees all menus
    if (this.userRole === 'super_admin') {
      return true;
    }

    // Check menu permissions
    const permission = this.menuPermissions.find(p => p.menu_route === route);
    return !!permission && permission.is_visible && permission.is_active;
  }

  /**
   * Check if user has access to a route
   */
  hasAccess(route: string): boolean {
    if (this.userRole === 'super_admin') {
      return true;
    }

    const permission = this.menuPermissions.find(p => p.menu_route === route);
    return !!permission && permission.is_active;
  }
}
