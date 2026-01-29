import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from '../../services/supabase/supabase';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive], // Import router directives
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  constructor(private supabase: SupabaseService, private router: Router) { }

  async logout() {
    await this.supabase.client.auth.signOut();
    this.router.navigate(['/login']);
  }
}
