import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Table } from 'primeng/table';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import { Permiso } from '../../models/admin/permiso';
import { Role } from '../../models/admin/role';

import { User } from '../../models/admin/user';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-users',
    providers: [MessageService],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        CheckboxModule,
        DialogModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        PasswordModule,
        SelectModule,
        TableModule,
        ToastModule
    ],
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
    users: User[] = [];
    roles: Role[] = [];
    permissions: Permiso[] = [];
    permissionOptions: { label: string; value: string }[] = [];
    loggedUser: User | null = null;
    loading = false;
    loadError = '';
    userDialogVisible = false;
    userDialogMode: 'create' | 'edit' = 'create';
    savingUser = false;
    editingUserId: number | null = null;
    resetPasswordDialogVisible = false;
    savingResetPassword = false;
    resettingUserId: number | null = null;

    userPermissionsDialogVisible = false;
    savingUserPermissions = false;
    managingUserPermissionsId: number | null = null;
    managingUserPermissionsName = '';
    userPermissionSearch = '';
    selectedDirectUserPermissions: string[] = [];
    roleBasedUserPermissions: string[] = [];
    resetPasswordForm = {
        password: '',
        passwordConfirmation: '',
    };

    userForm = {
        username: '',
        nombre: '',
        apellido: '',
        email: '',
        iglesia: '',
        fecha_nacimiento: '',
        role: null as string | null,
        idioma: 'es' as string,
        notificarme: false as boolean,
        password: '',
        passwordConfirmation: '',
    };

    altoTabla: string = '58vh';
    cabeceraAcciones: string = 'Acciones';
    globalFilterValue = '';

    readonly availableLanguages = [
        { label: 'Español', value: 'es' },
        { label: 'Inglés', value: 'en' },
        { label: 'Portugués', value: 'pt' },
        { label: 'Italiano', value: 'it' },
        { label: 'Francés', value: 'fr' },
        { label: 'Alemán', value: 'de' },
    ];

    constructor(
        private readonly authService: AuthService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadLoggedUser();
        this.loadUsers();
        this.loadRoles();
        this.loadPermissions();
    }

    private loadLoggedUser(): void {
        const rawLoggedUser = sessionStorage.getItem('logged_user');
        const rawLoginResponse = sessionStorage.getItem('response_logged_user');

        const loggedUser = rawLoggedUser ? JSON.parse(rawLoggedUser) as User : null;
        const loginResponse = rawLoginResponse ? JSON.parse(rawLoginResponse) as { user?: User } : null;
        const responseUser = loginResponse?.user ?? null;

        // Prefer the source that actually contains permissions/roles.
        if (responseUser?.permissions?.length || responseUser?.roles?.length) {
            this.loggedUser = responseUser;
            return;
        }

        this.loggedUser = loggedUser;
    }

    private loadRoles(): void {
        this.authService.listRoles().subscribe({
            next: (response: { data?: Role[] }) => {
                this.roles = Array.isArray(response?.data) ? response.data : [];
            },
            error: () => {
                this.roles = [];
            }
        });
    }

    private loadPermissions(): void {
        this.authService.listPermissions().subscribe({
            next: (response: { data?: Permiso[] }) => {
                this.permissions = Array.isArray(response?.data) ? response.data : [];
                this.permissionOptions = this.permissions
                    .map((permission) => ({
                        label: permission.name?.toString() || '',
                        value: permission.name?.toString() || '',
                    }))
                    .filter((option) => !!option.value)
                    .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));
            },
            error: () => {
                this.permissions = [];
                this.permissionOptions = [];
            }
        });
    }

    public loadUsers(): void {
        this.loading = true;
        this.loadError = '';

        this.authService.listUsers().subscribe({
            next: (response: { data?: User[] }) => {
                this.users = Array.isArray(response?.data) ? response.data : [];
                this.loading = false;
            },
            error: () => {
                this.users = [];
                this.loading = false;
                this.loadError = 'No se pudieron cargar los usuarios.';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Usuarios',
                    detail: this.loadError,
                    life: 3200,
                });
            }
        });
    }

    openAddUsersDialog(): void {
        this.userDialogMode = 'create';
        this.editingUserId = null;
        this.savingUser = false;
        this.userForm = {
            username: '',
            nombre: '',
            apellido: '',
            email: '',
            iglesia: '',
            fecha_nacimiento: '',
            role: null,
            idioma: 'es',
            notificarme: false,
            password: '',
            passwordConfirmation: '',
        };
        this.userDialogVisible = true;
    }

    editUser(user: User): void {
        this.userDialogMode = 'edit';
        this.editingUserId = typeof user.id === 'number' ? user.id : null;
        this.savingUser = false;
        this.userForm = {
            username: user.username?.toString() || '',
            nombre: user.nombre?.toString() || '',
            apellido: user.apellido?.toString() || '',
            email: user.email?.toString() || '',
            iglesia: user.iglesia?.toString() || '',
            fecha_nacimiento: this.normalizeDateForInput(user.fecha_nacimiento),
            role: user.roles?.[0]?.name?.toString() || null,
            idioma: user.idioma?.toString() || 'es',
            notificarme: user.notificarme === true,
            password: '',
            passwordConfirmation: '',
        };
        this.userDialogVisible = true;
    }

    openResetPasswordDialog(user: User): void {
        this.resettingUserId = typeof user.id === 'number' ? user.id : null;
        this.savingResetPassword = false;
        this.resetPasswordForm = {
            password: '',
            passwordConfirmation: '',
        };
        this.resetPasswordDialogVisible = true;
    }

    openUserPermissionsDialog(user: User): void {
        const userId = typeof user.id === 'number' ? user.id : null;

        if (userId === null) {
            this.messageService.add({
                severity: 'error',
                summary: 'Usuarios',
                detail: 'No se pudo identificar el usuario para gestionar permisos.',
                life: 3200,
            });
            return;
        }

        const rolePermissionSet = new Set<string>();
        const roleNames = (user.roles || [])
            .map((role) => role?.name?.toString().toLowerCase().trim() || '')
            .filter((name) => !!name);

        roleNames.forEach((roleName) => {
            const fullRole = this.roles.find(
                (candidate) => (candidate.name?.toString().toLowerCase().trim() || '') === roleName
            );

            (fullRole?.permissions || []).forEach((permission) => {
                const permissionName = permission?.name?.toString().trim() || '';
                if (permissionName) {
                    rolePermissionSet.add(permissionName);
                }
            });
        });

        const directPermissions = (user.permissions || [])
            .map((permission) => permission?.name?.toString().trim() || '')
            .filter((name) => !!name);

        const missingOptions = [...new Set([...rolePermissionSet, ...directPermissions])]
            .filter((permissionName) => !this.permissionOptions.some((option) => option.value === permissionName))
            .map((permissionName) => ({ label: permissionName, value: permissionName }));

        if (missingOptions.length) {
            this.permissionOptions = [...this.permissionOptions, ...missingOptions]
                .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));
        }

        this.managingUserPermissionsId = userId;
        this.managingUserPermissionsName = user.username?.toString() || `#${userId}`;
        this.selectedDirectUserPermissions = [...new Set(directPermissions)];
        this.roleBasedUserPermissions = [...rolePermissionSet];
        this.userPermissionSearch = '';
        this.savingUserPermissions = false;
        this.userPermissionsDialogVisible = true;
    }

    closeUserPermissionsDialog(): void {
        if (this.savingUserPermissions) {
            return;
        }

        this.userPermissionsDialogVisible = false;
    }

    saveUserPermissions(): void {
        if (this.managingUserPermissionsId === null) {
            this.messageService.add({
                severity: 'error',
                summary: 'Usuarios',
                detail: 'No se pudo identificar el usuario para guardar permisos.',
                life: 3200,
            });
            return;
        }

        this.savingUserPermissions = true;

        this.authService.updateUser(this.managingUserPermissionsId, {
            permissions: this.selectedDirectUserPermissions,
        }).subscribe({
            next: () => {
                this.savingUserPermissions = false;
                this.userPermissionsDialogVisible = false;
                this.loadUsers();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Usuarios',
                    detail: 'Permisos directos del usuario actualizados correctamente.',
                    life: 2800,
                });
            },
            error: () => {
                this.savingUserPermissions = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Usuarios',
                    detail: 'No se pudieron actualizar los permisos del usuario.',
                    life: 3200,
                });
            }
        });
    }

    toggleDirectUserPermission(permissionName: string, checked: boolean): void {
        if (this.isRoleBasedPermission(permissionName)) {
            return;
        }

        if (checked) {
            if (!this.selectedDirectUserPermissions.includes(permissionName)) {
                this.selectedDirectUserPermissions = [...this.selectedDirectUserPermissions, permissionName];
            }
            return;
        }

        this.selectedDirectUserPermissions = this.selectedDirectUserPermissions
            .filter((permission) => permission !== permissionName);
    }

    isRoleBasedPermission(permissionName: string): boolean {
        return this.roleBasedUserPermissions.includes(permissionName);
    }

    isUserPermissionSelected(permissionName: string): boolean {
        return this.isRoleBasedPermission(permissionName)
            || this.selectedDirectUserPermissions.includes(permissionName);
    }

    get filteredUserPermissionOptions(): { label: string; value: string }[] {
        const term = this.userPermissionSearch.toLowerCase().trim();

        if (!term) {
            return this.permissionOptions;
        }

        return this.permissionOptions.filter((option) =>
            option.label.toLowerCase().includes(term)
        );
    }

    get userPermissionColumns(): { label: string; value: string }[][] {
        const columns: { label: string; value: string }[][] = [[], [], []];
        const chunkSize = Math.ceil(this.filteredUserPermissionOptions.length / 3);

        if (chunkSize === 0) {
            return columns;
        }

        columns[0] = this.filteredUserPermissionOptions.slice(0, chunkSize);
        columns[1] = this.filteredUserPermissionOptions.slice(chunkSize, chunkSize * 2);
        columns[2] = this.filteredUserPermissionOptions.slice(chunkSize * 2);

        return columns;
    }

    getUserPermissionColumnHeader(column: { label: string; value: string }[], index: number): string {
        if (!column.length) {
            return `Columna ${index + 1}`;
        }

        const first = column[0].label;
        const last = column[column.length - 1].label;

        if (first === last) {
            return first;
        }

        return `${first} - ${last}`;
    }

    trackByUserPermissionColumnIndex(index: number): number {
        return index;
    }

    trackByUserPermissionValue(index: number, option: { label: string; value: string }): string {
        return option.value;
    }

    getLanguageLabel(languageCode: string | null | undefined): string {
        const normalized = (languageCode || 'es').toLowerCase();
        const language = this.availableLanguages.find((item) => item.value === normalized);

        return language?.label || 'Español';
    }

    closeResetPasswordDialog(): void {
        if (this.savingResetPassword) {
            return;
        }

        this.resetPasswordDialogVisible = false;
    }

    saveResetPassword(): void {
        if (this.resettingUserId === null) {
            this.messageService.add({
                severity: 'error',
                summary: 'Usuarios',
                detail: 'No se pudo identificar el usuario para blanquear contraseña.',
                life: 3200,
            });
            return;
        }

        if (!this.resetPasswordForm.password || this.resetPasswordForm.password.length < 6) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Usuarios',
                detail: 'La contraseña debe tener al menos 6 caracteres.',
                life: 2800,
            });
            return;
        }

        if (this.resetPasswordForm.password !== this.resetPasswordForm.passwordConfirmation) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Usuarios',
                detail: 'La confirmación de contraseña no coincide.',
                life: 2800,
            });
            return;
        }

        this.savingResetPassword = true;
        this.authService.updateUser(this.resettingUserId, {
            password: this.resetPasswordForm.password,
        }).subscribe({
            next: () => {
                this.savingResetPassword = false;
                this.resetPasswordDialogVisible = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Usuarios',
                    detail: 'Contraseña actualizada correctamente.',
                    life: 2800,
                });
            },
            error: () => {
                this.savingResetPassword = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Usuarios',
                    detail: 'No se pudo actualizar la contraseña.',
                    life: 3200,
                });
            }
        });
    }

    isProtectedUser(user: User): boolean {
        return user.id === 1 && !!user.roles?.some((role) => role?.name === 'super administrador');
    }

    confirmDeleteUser(user: User): void {
        console.log('Delete user', user);
    }

    closeUserDialog(): void {
        if (this.savingUser) {
            return;
        }

        this.userDialogVisible = false;
    }

    saveUser(): void {
        if (!this.userForm.username || !this.userForm.nombre || !this.userForm.apellido || !this.userForm.email || !this.userForm.iglesia) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Usuarios',
                detail: 'Completa los campos obligatorios.',
                life: 2800,
            });
            return;
        }

        if (this.userDialogMode === 'create') {
            if (!this.userForm.password || this.userForm.password.length < 6) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Usuarios',
                    detail: 'La contraseña debe tener al menos 6 caracteres.',
                    life: 2800,
                });
                return;
            }

            if (this.userForm.password !== this.userForm.passwordConfirmation) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Usuarios',
                    detail: 'La confirmación de contraseña no coincide.',
                    life: 2800,
                });
                return;
            }
        }

        const payload: Record<string, unknown> = {
            username: this.userForm.username.trim(),
            nombre: this.userForm.nombre.trim(),
            apellido: this.userForm.apellido.trim(),
            email: this.userForm.email.trim(),
            iglesia: this.userForm.iglesia.trim(),
            fecha_nacimiento: this.userForm.fecha_nacimiento || null,
            role: this.userForm.role || null,
            idioma: this.userForm.idioma,
            notificarme: this.userForm.notificarme,
        };

        if (this.userDialogMode === 'create') {
            payload['password'] = this.userForm.password;
        }

        if (this.userDialogMode === 'edit' && this.editingUserId === null) {
            this.messageService.add({
                severity: 'error',
                summary: 'Usuarios',
                detail: 'No se pudo identificar el usuario a editar.',
                life: 3200,
            });
            return;
        }

        this.savingUser = true;

        const request$ = this.userDialogMode === 'create'
            ? this.authService.createUser(payload)
            : this.authService.updateUser(this.editingUserId as number, payload);

        request$.subscribe({
            next: () => {
                const successDetail = this.userDialogMode === 'create'
                    ? 'Usuario creado correctamente.'
                    : 'Usuario actualizado correctamente.';

                this.savingUser = false;
                this.userDialogVisible = false;
                this.loadUsers();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Usuarios',
                    detail: successDetail,
                    life: 2800,
                });
            },
            error: () => {
                this.savingUser = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Usuarios',
                    detail: this.userDialogMode === 'create'
                        ? 'No se pudo crear el usuario.'
                        : 'No se pudo actualizar el usuario.',
                    life: 3200,
                });
            }
        });
    }

    get isCreateMode(): boolean {
        return this.userDialogMode === 'create';
    }

    get canCreateUsers(): boolean {
        return this.hasAnyPermission(['crear usuarios']);
    }

    get canEditUsers(): boolean {
        return this.hasAnyPermission(['actualizar usuarios', 'editar usuarios']);
    }

    get canDeleteUsers(): boolean {
        return this.hasAnyPermission(['eliminar usuarios']);
    }

    get canResetPasswordUsers(): boolean {
        return this.hasAnyPermission(['blanquear password']);
    }

    get canManageUserPermissions(): boolean {
        return this.hasAnyPermission(['gestionar permisos', 'actualizar usuarios', 'editar usuarios']);
    }

    isLoggedUser(user: User): boolean {
        return typeof user.id === 'number' && typeof this.loggedUser?.id === 'number' && user.id === this.loggedUser.id;
    }

    get filteredRoles(): Role[] {
        const isSuperAdmin = this.loggedUser?.roles?.some(r => r.name === 'super administrador') ?? false;
        if (isSuperAdmin) {
            return this.roles;
        }
        return this.roles.filter(r => r.name !== 'super administrador');
    }

    private hasAnyPermission(permissionNames: string[]): boolean {
        const userPermissions = this.loggedUser?.permissions?.map(p => p?.name?.toString().toLowerCase().trim() || '') || [];
        const targetPermissions = permissionNames.map(name => name.toLowerCase());
        return targetPermissions.some(name => userPermissions.includes(name));
    }

    private normalizeDateForInput(value: Date | string | null | undefined): string {
        if (!value) {
            return '';
        }

        if (typeof value === 'string') {
            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                return value;
            }

            const firstTen = value.slice(0, 10);
            if (/^\d{4}-\d{2}-\d{2}$/.test(firstTen)) {
                return firstTen;
            }
        }

        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return '';
        }

        return parsed.toISOString().slice(0, 10);
    }

    cambiarCabeceraAcciones(title: string){
        this.cabeceraAcciones = title;
    }
    
    clear(table: Table): void {
        table.clear();
        this.globalFilterValue = '';
    }

    filterGlobal($event: Event, table: Table): void {
        const input = $event.target as HTMLInputElement | null;
        this.globalFilterValue = input?.value || '';
        table.filterGlobal(this.globalFilterValue, 'contains');
    }
}
