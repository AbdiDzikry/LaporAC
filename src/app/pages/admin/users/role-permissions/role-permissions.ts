import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuPermissionService, MenuPermission, AvailableMenu } from '../../../../services/menu-permission/menu-permission.service';
import { SweetAlertService } from '../../../../services/sweet-alert/sweet-alert.service';

interface MenuWithSection extends AvailableMenu {
  section: 'principal' | 'operational' | 'administration';
}

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-permissions.html',
  styleUrl: './role-permissions.css'
})
export class RolePermissionsComponent implements OnInit {
  private _roleId: number = 0;

  @Input()
  set roleId(value: number | string) {
    this._roleId = typeof value === 'string' ? parseInt(value, 10) : value;
    if (this._roleId) {
      this.loadRoleInfo(this._roleId);
      this.loadPermissions();
    }
  }

  get roleId(): number {
    return this._roleId;
  }

  @Output() close = new EventEmitter<void>();

  roleName: string = '';
  roleDescription: string = '';

  allMenus: MenuWithSection[] = [];
  selectedMenus: string[] = [];

  loading = false;
  saving = false;

  constructor(
    private menuPermissionService: MenuPermissionService,
    private sweetAlert: SweetAlertService
  ) { }

  ngOnInit(): void {
    // Initialization handled by input setter
  }

  loadRoleInfo(roleId: number) {
    const roleNames: { [key: number]: { name: string; description: string } } = {
      1: { name: 'Super Admin', description: 'Full system access with all permissions' },
      2: { name: 'Admin', description: 'Administrative access for daily operations' },
      3: { name: 'Technician', description: 'Technical staff for maintenance and repairs' },
      4: { name: 'Vendor', description: 'External vendor for specialized repairs' },
      5: { name: 'Staff', description: 'Regular staff with reporting access only' }
    };

    const roleInfo = roleNames[roleId] || { name: 'Unknown', description: '' };
    this.roleName = roleInfo.name;
    this.roleDescription = roleInfo.description;
  }

  async loadPermissions() {
    this.loading = true;

    // Load available menus
    const { data: menus } = await this.menuPermissionService.getAvailableMenus();
    if (menus) {
      this.allMenus = this.categorizeMenus(menus);
    }

    // Load current permissions
    const { data: permissions } = await this.menuPermissionService.getRoleMenus(this.roleId);
    if (permissions) {
      this.selectedMenus = permissions
        .filter(p => p.is_active && p.is_visible)
        .map(p => p.menu_route);
    }

    this.loading = false;
  }

  categorizeMenus(menus: AvailableMenu[]): MenuWithSection[] {
    const principalRoutes = ['/dashboard', '/admin/analytics'];
    const operationalRoutes = ['/admin/assets', '/admin/maintenance', '/admin/tickets'];

    return menus.map(menu => {
      let section: MenuWithSection['section'] = 'administration';

      if (principalRoutes.includes(menu.route)) {
        section = 'principal';
      } else if (operationalRoutes.includes(menu.route)) {
        section = 'operational';
      }

      return { ...menu, section };
    });
  }

  getMenusBySection(section: string): MenuWithSection[] {
    return this.allMenus.filter(m => m.section === section);
  }

  isMenuSelected(route: string): boolean {
    return this.selectedMenus.includes(route);
  }

  toggleMenu(route: string) {
    const index = this.selectedMenus.indexOf(route);
    if (index > -1) {
      this.selectedMenus.splice(index, 1);
    } else {
      this.selectedMenus.push(route);
    }
  }

  selectAll() {
    this.selectedMenus = this.allMenus.map(m => m.route);
  }

  selectNone() {
    this.selectedMenus = [];
  }

  resetToDefaults() {
    const defaults: { [key: number]: string[] } = {
      1: this.allMenus.map(m => m.route), // Super admin - all
      2: this.allMenus.filter(m => m.route !== '/admin/vendors').map(m => m.route), // Admin - all except vendors
      3: ['/dashboard', '/admin/analytics', '/admin/assets', '/admin/tickets', '/admin/history'], // Technician
      4: ['/dashboard', '/admin/tickets'], // Vendor
      5: [] // Staff - no admin access
    };

    this.selectedMenus = defaults[this.roleId] || [];
  }

  async savePermissions() {
    const confirmed = await this.sweetAlert.confirm(
      'Simpan Permission',
      `Apakah Anda yakin ingin menyimpan permission untuk role ${this.roleName}?`
    );

    if (!confirmed) return;

    this.saving = true;

    try {
      const permissions = this.selectedMenus.map(route => {
        const menu = this.allMenus.find(m => m.route === route);
        return {
          menu_route: route,
          menu_label: menu?.label || '',
          menu_icon: menu?.icon || '',
          is_visible: true,
          is_active: true
        };
      });

      const { error } = await this.menuPermissionService.updateRoleMenus(this.roleId, permissions);

      if (error) {
        throw new Error(error);
      }

      this.sweetAlert.success('Berhasil', 'Permission berhasil disimpan');
      this.goBack();
    } catch (error: any) {
      this.sweetAlert.error('Gagal', error.message || 'Gagal menyimpan permission');
    } finally {
      this.saving = false;
    }
  }

  goBack() {
    this.close.emit();
  }
}
