<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureMailFromDatabase();
    }

    /**
     * Override mail configuration from database app_configs.
     */
    private function configureMailFromDatabase(): void
    {
        try {
            if (!\Illuminate\Support\Facades\Schema::hasTable('app_configs')) {
                return;
            }

            $configs = \App\Models\AppConfig::whereIn('identifier', [
                'smtp_host',
                'smtp_port',
                'smtp_username',
                'smtp_password',
                'smtp_from_address',
                'smtp_from_name',
                'smtp_secure',
            ])->pluck('value', 'identifier');

            if ($configs->isEmpty()) {
                return;
            }

            if ($configs->has('smtp_host') && !empty($configs['smtp_host'])) {
                $secure = $configs->get('smtp_secure', '1');
                $encryption = ($secure === '1' || $secure === 'true') ? 'tls' : null;

                config([
                    'mail.mailer' => 'smtp',
                    'mail.mailers.smtp.host' => $configs->get('smtp_host', config('mail.mailers.smtp.host')),
                    'mail.mailers.smtp.port' => (int) $configs->get('smtp_port', config('mail.mailers.smtp.port', 587)),
                    'mail.mailers.smtp.username' => $configs->get('smtp_username', config('mail.mailers.smtp.username')),
                    'mail.mailers.smtp.password' => $configs->get('smtp_password', config('mail.mailers.smtp.password')),
                    'mail.mailers.smtp.encryption' => $encryption,
                    'mail.from.address' => $configs->get('smtp_from_address', config('mail.from.address')),
                    'mail.from.name' => $configs->get('smtp_from_name', config('mail.from.name')),
                ]);
            }
        } catch (\Exception $e) {
            // Silently fail — jangan sampai app crash jika DB belum siap
        }
    }
}
