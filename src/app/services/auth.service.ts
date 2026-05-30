import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private urlLogin = `${environment.url_base}/login`;
    private urlChangePassword = `${environment.url_base}/users/change-password`;
    private urlUpdateProfile = `${environment.url_base}/users/profile`;

    constructor(private http: HttpClient) {
        // Leer el estado de sesión desde sessionStorage al iniciar
        const stored = sessionStorage.getItem('isLoggedIn');
        this.loggedIn$.next(stored === 'true');
    }

    

    // Método para hacer login (simulado)
    private loggedIn$ = new BehaviorSubject<boolean>(false);
    login(username: string, password: string): Observable<any> {
        // Llamada real al backend para autenticación
        if (username && password) {
            const body = { username, password };
            return  this.http.post(this.urlLogin, body);
        }
        // Si faltan datos, retorna un observable de error
        return new BehaviorSubject({ error: 'Username y password requeridos' }).asObservable();
    }
    // Observable para saber si el usuario está logueado
    getIsLoggedIn$(): Observable<boolean> {
        return this.loggedIn$.asObservable();
    }
    setIsLoggedIn(value: boolean): void {
        this.loggedIn$.next(value);
        sessionStorage.setItem('isLoggedIn', value ? 'true' : 'false');
    }

    // Método para hacer logout
    logout(): void {
        this.loggedIn$.next(false);
        sessionStorage.clear();
    }

    // Registro de usuario
    registerUser(data: any): Observable<any> {
        const url = `${environment.url_base}/register`;
        return this.http.post(url, data);
    }

    listUsers(): Observable<any> {
        const url = `${environment.url_base}/users`;
        return this.http.get(url, {
            headers: this.getAuthHeaders(),
        });
    }

    listRoles(): Observable<any> {
        const url = `${environment.url_base}/roles`;
        return this.http.get(url, {
            headers: this.getAuthHeaders(),
        });
    }

    createRole(data: any): Observable<any> {
        const url = `${environment.url_base}/roles`;
        return this.http.post(url, data, {
            headers: this.getAuthHeaders(),
        });
    }

    updateRole(id: number, data: any): Observable<any> {
        const url = `${environment.url_base}/roles/${id}`;
        return this.http.put(url, data, {
            headers: this.getAuthHeaders(),
        });
    }

    deleteRole(id: number): Observable<any> {
        const url = `${environment.url_base}/roles/${id}`;
        return this.http.delete(url, {
            headers: this.getAuthHeaders(),
        });
    }

    listPermissions(): Observable<any> {
        const url = `${environment.url_base}/permissions`;
        return this.http.get(url, {
            headers: this.getAuthHeaders(),
        });
    }

    createUser(data: any): Observable<any> {
        const url = `${environment.url_base}/users`;
        return this.http.post(url, data, {
            headers: this.getAuthHeaders(),
        });
    }

    updateUser(id: number, data: any): Observable<any> {
        const url = `${environment.url_base}/users/${id}`;
        return this.http.put(url, data, {
            headers: this.getAuthHeaders(),
        });
    }

    createPermission(data: any): Observable<any> {
        const url = `${environment.url_base}/permissions`;
        return this.http.post(url, data, {
            headers: this.getAuthHeaders(),
        });
    }

    updatePermission(id: number, data: any): Observable<any> {
        const url = `${environment.url_base}/permissions/${id}`;
        return this.http.put(url, data, {
            headers: this.getAuthHeaders(),
        });
    }

    deletePermission(id: number): Observable<any> {
        const url = `${environment.url_base}/permissions/${id}`;
        return this.http.delete(url, {
            headers: this.getAuthHeaders(),
        });
    }

    updateProfile(data: any): Observable<any> {
        return this.http.put(this.urlUpdateProfile, data, {
            headers: this.getAuthHeaders(),
        });
    }

    changePassword(password: string, passwordConfirmation: string): Observable<any> {
        const payload = {
            password,
            password_confirmation: passwordConfirmation,
        };

        return this.http.post(this.urlChangePassword, payload, {
            headers: this.getAuthHeaders(),
        });
    }

    private getAuthHeaders(): HttpHeaders {
        const raw = sessionStorage.getItem('response_logged_user');

        if (!raw) {
            return new HttpHeaders();
        }

        try {
            const parsed = JSON.parse(raw) as { token?: string; token_type?: string };
            const token = parsed?.token;

            if (!token) {
                return new HttpHeaders();
            }

            const tokenType = parsed.token_type?.trim() || 'Bearer';
            const normalizedType = tokenType.toLowerCase() === 'bearer' ? 'Bearer' : tokenType;

            return new HttpHeaders({
                Authorization: `${normalizedType} ${token}`,
            });
        } catch {
            return new HttpHeaders();
        }
    }
}
