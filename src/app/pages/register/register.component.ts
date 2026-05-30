import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { NgClass } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';

import { AuthService } from '../../services/auth.service';

import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';

@Component({
	selector: 'app-register',
	imports: [
        CommonModule,
		FormsModule, 
		// NgClass, 
		RouterModule,
		TranslateModule,
		ButtonModule,
		CalendarModule,
		CheckboxModule,
		FloatLabelModule,
		InputTextModule,
		PasswordModule,
		SelectModule,
	],
	templateUrl: './register.component.html',
	styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit, OnDestroy{
	username: string = '';
	email: string = '';
	apellido: string = '';
	nombre: string = '';
	fechaNacimiento: Date | string = '';
	iglesia: string = '';
	idioma: string = 'es';
	notificarme: boolean = false;
	password: string = '';
	repeatPassword: string = '';
	showPassword: boolean = false;
	showRepeatPassword: boolean = false;

	languages = [
		{ value: 'es', labelKey: 'register.language_es' },
		{ value: 'en', labelKey: 'register.language_en' },
		{ value: 'pt', labelKey: 'register.language_pt' },
		{ value: 'it', labelKey: 'register.language_it' },
		{ value: 'fr', labelKey: 'register.language_fr' },
		{ value: 'de', labelKey: 'register.language_de' },
	];

	constructor(private authService: AuthService){}

	ngOnInit(): void {
		this.username = '';
		this.password = '';
		this.notificarme = false;

		const selectedLang = localStorage.getItem('selected_lang');
		const supportedLangs = ['es', 'en', 'pt', 'it', 'fr', 'de'];
		if (selectedLang && supportedLangs.includes(selectedLang)) {
			this.idioma = selectedLang;
		}
	}

	ngOnDestroy(): void {
	}

	onRegister(){
		const formData = {
			username: this.username,
			email: this.email,
			apellido: this.apellido,
			nombre: this.nombre,
			fecha_nacimiento: this.fechaNacimiento || null,
			iglesia: this.iglesia,
			idioma: this.idioma,
			notificarme: this.notificarme,
			password: this.password
		};
		this.authService.registerUser(formData).subscribe(
			response => {
				// éxito: puedes redirigir, mostrar mensaje, etc.
			},
			error => {
				// error: mostrar mensaje, etc.
			}
		);
	}

    onNombreChange(event: any) {
        const value = event.target.value;
        this.nombre = value.replace(/(^|\s)\S/g, (l: string) => l.toUpperCase());
    }
    onApellidoChange(event: any) {
        const value = event.target.value;
        this.apellido = value.replace(/(^|\s)\S/g, (l: string) => l.toUpperCase());
    }
    onUsernameChange(event: any) {
        const value = event.target.value;
        this.username = value.replace(/\s+/g, '.').toLowerCase();
    }
    onEmailChange(event: any) {
        const value = event.target.value;
        this.email = value.toLowerCase();
    }
    onFechaNacimientoInput(event: any) {
        let value = event.target.value.replace(/[^0-9]/g, '');
        if (value.length > 2) value = value.slice(0,2) + '/' + value.slice(2);
        if (value.length > 5) value = value.slice(0,5) + '/' + value.slice(5,9);
        this.fechaNacimiento = value;
    }
    onFechaNacimientoBlur(event: any) {
        const value = event.target.value;
        const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (match) {
            const day = match[1];
            const month = match[2];
            const year = match[3];
            this.fechaNacimiento = new Date(`${year}-${month}-${day}`);
        }
    }
}
