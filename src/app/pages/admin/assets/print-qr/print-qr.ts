import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';
import { AssetService, Asset } from '../../../../services/asset/asset';

@Component({
  selector: 'app-print-qr',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  templateUrl: './print-qr.html',
  styleUrl: './print-qr.css'
})
export class PrintQrComponent implements OnInit {
  assetId: number | null = null;
  asset: Asset | null = null;
  qrData: string = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private assetService: AssetService
  ) { }

  ngOnInit() {
    this.assetId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.assetId) {
      this.loadAsset(this.assetId);
    }
  }

  async loadAsset(id: number) {
    this.loading = true;
    const { data, error } = await this.assetService.getAssetById(id);
    if (data) {
      this.asset = data as Asset;
      // Generate Deep Link URL
      // Points to the Public Reporting Form with pre-filled SKU
      const productionUrl = 'https://lapor-ac.dharmap.com'; // Change this to your actual production domain
      this.qrData = `${productionUrl}/report/new?sku=${this.asset.sku}`;
    }
    this.loading = false;
  }

  print() {
    window.print();
  }

  async downloadPNG() {
    const stickerCard = document.querySelector('.sticker-card') as HTMLElement;
    if (!stickerCard) {
      alert('Stiker tidak ditemukan');
      return;
    }

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(stickerCard, {
        scale: 2, // Higher quality
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      // Convert canvas to blob
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) {
          alert('Gagal membuat gambar');
          return;
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `stiker-${this.asset?.sku || 'asset'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Terjadi kesalahan saat membuat gambar');
    }
  }
}
