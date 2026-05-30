import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authUsersGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const rawResponse = sessionStorage.getItem('response_logged_user');
    const rawLoggedUser = sessionStorage.getItem('logged_user');
    const permission = route.data?.['permiso'];
    const permissions = route.data?.['permisos'];

    if (!isLoggedIn) {
        return router.createUrlTree(['/login'], {
            queryParams: { returnUrl: state.url }
        });
    }

    const requiredPermissions = [
        ...(typeof permission === 'string' ? [permission] : []),
        ...(Array.isArray(permissions) ? permissions : []),
    ].map((item) => item.toLowerCase().trim());

    if (requiredPermissions.length === 0) {
        return true;
    }

    let userPermissions: string[] = [];

    if (rawResponse || rawLoggedUser) {
        try {
            const responseData = rawResponse ? JSON.parse(rawResponse) : null;
            const loggedUserData = rawLoggedUser ? JSON.parse(rawLoggedUser) : null;
            const sessionUser = responseData?.user ?? loggedUserData;

            userPermissions = Array.isArray(sessionUser?.permissions)
                ? sessionUser.permissions
                    .map((item: { name?: string }) => item?.name?.toLowerCase().trim())
                    .filter((item: string | undefined): item is string => !!item)
                : [];
        } catch {
            userPermissions = [];
        }
    }

    const hasPermission = requiredPermissions.some((item) => userPermissions.includes(item));

    if (hasPermission) {
        return true;
    }

    return router.createUrlTree(['/welcome'], {
        queryParams: {
            denied: '1',
            from: state.url,
        },
    });
};
