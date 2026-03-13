import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppConfigService } from '../../../services/app-config/app-config';
import { SweetAlertService } from '../../../services/sweet-alert/sweet-alert.service';

@Component({
  selector: 'app-configs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configs.html',
  styleUrl: './configs.css',
})
export class ConfigsComponent implements OnInit {
  warrantyDuration: number = 3; // Default
  frontendUrl: string = 'https://lapor-ac.vercel.app'; // Default fallback

  // SMTP Settings
  smtpHost: string = '';
  smtpPort: number = 587;
  smtpUsername: string = '';
  smtpPassword: string = '';
  smtpFromEmail: string = '';
  smtpFromName: string = 'LaporAC System';
  smtpSecure: boolean = true;
  hideSmtpPassword = true;
  isSmtpPasswordSaved = false;

  isLoading = false;
  testEmailTo: string = '';

  constructor(
    private configService: AppConfigService,
    private swal: SweetAlertService
  ) { }

  ngOnInit() {
    this.loadConfigs();
  }

  async loadConfigs() {
    this.isLoading = true;
    const { data, error } = await this.configService.getConfigs();
    this.isLoading = false;

    if (error) {
      this.swal.error('Peringatan', error);
      return;
    }

    if (data) {
      this.warrantyDuration = parseInt(data['warranty_duration_months'] || '3', 10);
      this.smtpHost = data['smtp_host'] || '';
      this.smtpPort = parseInt(data['smtp_port'] || '587', 10);
      this.smtpUsername = data['smtp_username'] || '';
      this.smtpFromEmail = data['smtp_from_address'] || '';
      this.smtpFromName = data['smtp_from_name'] || 'LaporAC System';
      this.frontendUrl = data['frontend_url'] || 'https://lapor-ac.vercel.app';
      // Don't load password for security
      if (data['smtp_password']) {
        this.isSmtpPasswordSaved = true;
      }
    }
  }

  async saveConfig() {
    this.isLoading = true;

    const configData: any = {
      warranty_duration_months: this.warrantyDuration.toString(),
      smtp_host: this.smtpHost,
      smtp_port: this.smtpPort.toString(),
      smtp_username: this.smtpUsername,
      smtp_from_address: this.smtpFromEmail,
      smtp_from_name: this.smtpFromName,
      frontend_url: this.frontendUrl
    };

    // Only include password if changed
    if (this.smtpPassword) {
      configData.smtp_password = this.smtpPassword;
    }

    const { success, error } = await this.configService.updateConfigs(configData);
    this.isLoading = false;

    if (error) {
      this.swal.error('Error', error);
    } else if (success) {
      this.swal.success('Berhasil', 'Konfigurasi berhasil disimpan');
    }
  }

  async testEmailConfig() {
    if (!this.smtpHost || !this.smtpUsername) {
      this.swal.warning('Peringatan', 'Mohon lengkapi SMTP Host dan Username terlebih dahulu');
      return;
    }

    if (!this.testEmailTo) {
      this.swal.warning('Peringatan', 'Mohon isi alamat email tujuan untuk test');
      return;
    }

    // Save current config first so backend uses the latest settings
    await this.saveConfig();

    this.isLoading = true;
    const { success, message } = await this.configService.testEmail(this.testEmailTo);
    this.isLoading = false;

    if (success) {
      this.swal.success('Test Email Berhasil', message);
    } else {
      this.swal.error('Test Email Gagal', message);
    }
  }
}

