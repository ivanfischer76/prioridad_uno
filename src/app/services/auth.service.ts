import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn$ = new BehaviorSubject<boolean>(false);

  constructor() {
    // Leer el estado de sesión desde sessionStorage al iniciar
    const stored = sessionStorage.getItem('isLoggedIn');
    this.loggedIn$.next(stored === 'true');
  }

  // Observable para saber si el usuario está logueado
  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  // Método para hacer login (simulado)
  login(email: string, password: string): boolean {
    // Aquí iría la lógica real de autenticación
    if (email && password) {
      this.loggedIn$.next(true);
      sessionStorage.setItem('isLoggedIn', 'true');
      return true;
    }
    return false;
  }

  // Método para hacer logout
  logout(): void {
    this.loggedIn$.next(false);
    sessionStorage.removeItem('isLoggedIn');
  }
}
