import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Determine if the request is going to our API
    const isApiUrl = req.url.startsWith(environment.apiUrl);

    if (isApiUrl) {
        // Try to get token from Supabase session for now (since we haven't rewritten AuthService fully yet)
        // Actually, we SHOULD get the token that will be provided by Laravel.
        // Let's store it in localStorage after Laravel login.
        const token = localStorage.getItem('laporac_token');

        if (token) {
            const authReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                }
            });
            return next(authReq);
        } else {
            // Just add Accept JSON header so Laravel knows it's an API request
            const jsonReq = req.clone({
                setHeaders: {
                    Accept: 'application/json',
                }
            });
            return next(jsonReq);
        }
    }

    // Pass on the original request if not an API request
    return next(req);
};
