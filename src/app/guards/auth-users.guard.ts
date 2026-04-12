import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authUsersGuard: CanActivateFn = (route, state) => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const loggedUser = sessionStorage.getItem('response_logged_user');
    const permiso = route.data?.['permiso'];
    let hasPermission = false;
    if (loggedUser && permiso) {
        try {
            const loggedUserData = JSON.parse(loggedUser);
            console.log('loggedUserData', loggedUserData);
            console.log('permisos', loggedUserData.user.permissions);
            hasPermission = Array.isArray(loggedUserData.user.permissions) &&
                loggedUserData.user.permissions.some((p: any) => p.name === permiso);
        } catch (e) {
            hasPermission = false;
        }
    }
    if (isLoggedIn && hasPermission) {
        return true;
    }
    // window.location.href = '/login';
    return false;
};
