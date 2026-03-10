<!DOCTYPE html>
<html>

<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #eee;
            border-radius: 8px;
        }

        .header {
            background-color: #2563eb;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }

        .content {
            padding: 20px;
        }

        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #666;
            text-align: center;
        }

        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #2563eb;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 15px;
        }

        .credentials {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #2563eb;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h2>Pembaruan Akses Portal LaporAC</h2>
        </div>
        <div class="content">
            <p>Halo <strong>{{ $vendorProfile->company_name ?? $user->name }}</strong>,</p>
            <p>Administrator Sistem LaporAC baru saja melakukan pembaruan informasi login atau akses masuk Anda. Berikut
                adalah detail kredensial Anda yang saat ini berlaku:</p>

            <div class="credentials">
                <p style="margin: 0;"><strong>URL Akses:</strong> <a
                        href="{{ config('app.frontend_url', 'http://localhost:4200') }}/auth/login">{{ config('app.frontend_url', 'http://localhost:4200') }}/auth/login</a>
                </p>
                <p style="margin: 5px 0 0 0;"><strong>Email Login:</strong> {{ $user->email }}</p>

                @if($plainPassword)
                    <p style="margin: 5px 0 0 0;"><strong>Password Baru:</strong> <span
                            style="font-family: monospace; background: #e5e7eb; padding: 2px 5px; border-radius: 3px;">{{ $plainPassword }}</span>
                    </p>
                @else
                    <p style="margin: 5px 0 0 0;"><strong>Password:</strong> <span
                            style="font-family: monospace; font-style: italic; color: #555;">(Sama seperti sebelumnya /
                            Tidak Diubah)</span>
                    </p>
                @endif
            </div>

            <p>Silakan gunakan informasi di atas untuk masuk ke Dashboard Vendor. Jika Anda tidak merasa sistem kami
                perlu diperbarui atau tidak bisa login, segera lapor ke admin kami.</p>

            <div style="text-align: center;">
                <a href="{{ config('app.frontend_url', 'http://localhost:4200') }}/auth/login" class="btn">Masuk ke
                    Dashboard</a>
            </div>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Sistem Informasi LaporAC by Dharma Polimetal. All rights reserved.</p>
        </div>
    </div>
</body>

</html>