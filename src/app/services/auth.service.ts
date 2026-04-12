import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private urlLogin = `${environment.url_base}/login`;

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
}
