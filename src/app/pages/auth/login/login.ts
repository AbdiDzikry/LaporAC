import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase/supabase';
import { AuditService } from '../../../services/audit/audit'; // Import AuditService
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMsg: string | null = null;

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private audit: AuditService, // Inject AuditService
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMsg = null;
    const { email, password } = this.loginForm.value;

    try {
      const { data, error } = await this.supabase.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        // Log Login Action
        if (data.user) {
          await this.audit.logAction('LOGIN', 'auth', data.user.id, { email: this.loginForm.value.email });
        }

        // Smart Redirect
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      }
    } catch (error: any) {
      this.errorMsg = error.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }
}
