import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Table, TableModule } from 'primeng/table';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

import { Permiso } from '../../models/admin/permiso';
import { Role } from '../../models/admin/role';
import { User } from '../../models/admin/user';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-roles',
    providers: [MessageService],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        DialogModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        TableModule,
        ToastModule
    ],
    templateUrl: './roles.component.html',
    styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
    roles: Role[] = [];
    permissions: Permiso[] = [];
    permissionOptions: { label: string; value: string }[] = [];
    loggedUser: User | null = null;

    loading = false;
    loadError = '';
    globalFilterValue = '';

    altoTabla = '58vh';
    cabeceraAcciones: string = 'Acciones';

    roleDialogVisible = false;
    roleDialogMode: 'create' | 'edit' = 'create';
    savingRole = false;
    editingRoleId: number | null = null;

    permissionsDialogVisible = false;
    savingRolePermissions = false;
    managingRoleId: number | null = null;
    managingRoleName = '';
    selectedRolePermissions: string[] = [];
    permissionSearch = '';

    roleUsersDialogVisible = false;
    loadingRoleUsers = false;
    roleUsersDialogRoleName = '';
    roleUsers: User[] = [];

    roleForm = {
        name: '',
    };

    constructor(
        private readonly authService: AuthService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadLoggedUser();
        this.loadRoles();
        this.loadPermissions();
    }

    private loadLoggedUser(): void {
        const rawLoggedUser = sessionStorage.getItem('logged_user');
        const rawLoginResponse = sessionStorage.getItem('response_logged_user');

        const loggedUser = rawLoggedUser ? JSON.parse(rawLoggedUser) as User : null;
        const loginResponse = rawLoginResponse ? JSON.parse(rawLoginResponse) as { user?: User } : null;
        const responseUser = loginResponse?.user ?? null;

        if (responseUser?.permissions?.length || responseUser?.roles?.length) {
            this.loggedUser = responseUser;
            return;
        }

        this.loggedUser = loggedUser;
    }

    loadRoles(): void {
        this.loading = true;
        this.loadError = '';

        this.authService.listRoles().subscribe({
            next: (response: { data?: Role[] | null }) => {
                this.roles = Array.isArray(response?.data) ? response.data : [];
                this.loading = false;
            },
            error: () => {
                this.roles = [];
                this.loading = false;
                this.loadError = 'No se pudieron cargar los roles.';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Roles',
                    detail: this.loadError,
                    life: 3200,
                });
            }
        });
    }

    private loadPermissions(): void {
        this.authService.listPermissions().subscribe({
            next: (response: { data?: Permiso[] | null }) => {
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

    openAddRoleDialog(): void {
        this.roleDialogMode = 'create';
        this.editingRoleId = null;
        this.savingRole = false;
        this.roleForm = {
            name: '',
        };
        this.roleDialogVisible = true;
    }

    editRole(role: Role): void {
        this.roleDialogMode = 'edit';
        this.editingRoleId = typeof role.id === 'number' ? role.id : null;
        this.savingRole = false;
        this.roleForm = {
            name: role.name?.toString() || '',
        };
        this.roleDialogVisible = true;
    }

    openPermissionsDialog(role: Role): void {
        const roleId = typeof role.id === 'number' ? role.id : null;
        if (roleId === null) {
            this.messageService.add({
                severity: 'error',
                summary: 'Roles',
                detail: 'No se pudo identificar el rol para gestionar permisos.',
                life: 3200,
            });
            return;
        }

        this.managingRoleId = roleId;
        this.managingRoleName = role.name?.toString() || '';
        this.savingRolePermissions = false;
        this.permissionSearch = '';
        this.selectedRolePermissions = (role.permissions || [])
            .map((permission) => permission?.name?.toString() || '')
            .filter((permissionName) => !!permissionName);
        this.permissionsDialogVisible = true;
    }

    closePermissionsDialog(): void {
        if (this.savingRolePermissions) {
            return;
        }

        this.permissionsDialogVisible = false;
    }

    openRoleUsersDialog(role: Role): void {
        const roleName = role.name?.toString() || '';

        if (!roleName) {
            this.messageService.add({
                severity: 'error',
                summary: 'Roles',
                detail: 'No se pudo identificar el rol para listar usuarios.',
                life: 3200,
            });
            return;
        }

        this.roleUsersDialogRoleName = roleName;
        this.roleUsersDialogVisible = true;
        this.loadingRoleUsers = true;
        this.roleUsers = [];

        this.authService.listUsers().subscribe({
            next: (response: { data?: User[] | null }) => {
                const users = Array.isArray(response?.data) ? response.data : [];
                const roleNameNormalized = roleName.toLowerCase().trim();

                this.roleUsers = users.filter((user) =>
                    (user.roles || []).some((userRole) =>
                        userRole?.name?.toString().toLowerCase().trim() === roleNameNormalized
                    )
                );
                this.loadingRoleUsers = false;
            },
            error: () => {
                this.loadingRoleUsers = false;
                this.roleUsers = [];
                this.messageService.add({
                    severity: 'error',
                    summary: 'Roles',
                    detail: 'No se pudieron cargar los usuarios del rol.',
                    life: 3200,
                });
            }
        });
    }

    closeRoleUsersDialog(): void {
        if (this.loadingRoleUsers) {
            return;
        }

        this.roleUsersDialogVisible = false;
    }

    closeRoleDialog(): void {
        if (this.savingRole) {
            return;
        }

        this.roleDialogVisible = false;
    }

    saveRole(): void {
        const trimmedName = this.roleForm.name.trim();

        if (!trimmedName) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Roles',
                detail: 'El nombre del rol es obligatorio.',
                life: 2800,
            });
            return;
        }

        if (this.roleDialogMode === 'edit' && this.editingRoleId === null) {
            this.messageService.add({
                severity: 'error',
                summary: 'Roles',
                detail: 'No se pudo identificar el rol a editar.',
                life: 3200,
            });
            return;
        }

        this.savingRole = true;

        const payload = {
            name: trimmedName,
        };

        const request$ = this.roleDialogMode === 'create'
            ? this.authService.createRole(payload)
            : this.authService.updateRole(this.editingRoleId as number, payload);

        request$.subscribe({
            next: () => {
                this.savingRole = false;
                this.roleDialogVisible = false;
                this.loadRoles();

                this.messageService.add({
                    severity: 'success',
                    summary: 'Roles',
                    detail: this.roleDialogMode === 'create'
                        ? 'Rol creado correctamente.'
                        : 'Rol actualizado correctamente.',
                    life: 2800,
                });
            },
            error: () => {
                this.savingRole = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Roles',
                    detail: this.roleDialogMode === 'create'
                        ? 'No se pudo crear el rol.'
                        : 'No se pudo actualizar el rol.',
                    life: 3200,
                });
            }
        });
    }

    saveRolePermissions(): void {
        if (this.managingRoleId === null) {
            this.messageService.add({
                severity: 'error',
                summary: 'Roles',
                detail: 'No se pudo identificar el rol para guardar permisos.',
                life: 3200,
            });
            return;
        }

        this.savingRolePermissions = true;

        this.authService.updateRole(this.managingRoleId, {
            permissions: this.selectedRolePermissions,
        }).subscribe({
            next: () => {
                this.savingRolePermissions = false;
                this.permissionsDialogVisible = false;
                this.loadRoles();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Roles',
                    detail: 'Permisos del rol actualizados correctamente.',
                    life: 2800,
                });
            },
            error: () => {
                this.savingRolePermissions = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Roles',
                    detail: 'No se pudieron actualizar los permisos del rol.',
                    life: 3200,
                });
            }
        });
    }

    toggleRolePermission(permissionName: string, checked: boolean): void {
        if (checked) {
            if (!this.selectedRolePermissions.includes(permissionName)) {
                this.selectedRolePermissions = [...this.selectedRolePermissions, permissionName];
            }
            return;
        }

        this.selectedRolePermissions = this.selectedRolePermissions.filter((item) => item !== permissionName);
    }

    trackByColumnIndex(index: number): number {
        return index;
    }

    trackByPermissionValue(index: number, option: { label: string; value: string }): string {
        return option.value;
    }

    isRolePermissionSelected(permissionName: string): boolean {
        return this.selectedRolePermissions.includes(permissionName);
    }

    get filteredPermissionOptions(): { label: string; value: string }[] {
        const term = this.permissionSearch.toLowerCase().trim();
        if (!term) {
            return this.permissionOptions;
        }

        return this.permissionOptions.filter((option) => option.label.toLowerCase().includes(term));
    }

    get permissionColumns(): { label: string; value: string }[][] {
        const columns: { label: string; value: string }[][] = [[], [], []];
        const chunkSize = Math.ceil(this.filteredPermissionOptions.length / 3);

        if (chunkSize === 0) {
            return columns;
        }

        columns[0] = this.filteredPermissionOptions.slice(0, chunkSize);
        columns[1] = this.filteredPermissionOptions.slice(chunkSize, chunkSize * 2);
        columns[2] = this.filteredPermissionOptions.slice(chunkSize * 2);

        return columns;
    }

    getPermissionColumnHeader(column: { label: string; value: string }[], index: number): string {
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

    confirmDeleteRole(role: Role): void {
        if (!this.canDeleteRoles || this.isProtectedRole(role)) {
            return;
        }

        const roleId = typeof role.id === 'number' ? role.id : null;
        if (roleId === null) {
            this.messageService.add({
                severity: 'error',
                summary: 'Roles',
                detail: 'No se pudo identificar el rol a eliminar.',
                life: 3200,
            });
            return;
        }

        const roleName = role.name?.toString() || 'este rol';
        const isConfirmed = window.confirm(`Se eliminará ${roleName}. ¿Desea continuar?`);

        if (!isConfirmed) {
            return;
        }

        this.authService.deleteRole(roleId).subscribe({
            next: () => {
                this.loadRoles();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Roles',
                    detail: 'Rol eliminado correctamente.',
                    life: 2800,
                });
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Roles',
                    detail: 'No se pudo eliminar el rol.',
                    life: 3200,
                });
            }
        });
    }

    isProtectedRole(role: Role): boolean {
        return role.name?.toString().toLowerCase().trim() === 'super administrador';
    }

    get isCreateMode(): boolean {
        return this.roleDialogMode === 'create';
    }

    get canManageRoles(): boolean {
        return this.hasAnyPermission(['gestionar roles']);
    }

    get canCreateRoles(): boolean {
        return this.canManageRoles;
    }

    get canEditRoles(): boolean {
        return this.canManageRoles;
    }

    get canDeleteRoles(): boolean {
        return this.canManageRoles;
    }

    private hasAnyPermission(permissionNames: string[]): boolean {
        const userPermissions = this.loggedUser?.permissions?.map(p => p?.name?.toString().toLowerCase().trim() || '') || [];
        const targetPermissions = permissionNames.map(name => name.toLowerCase());
        return targetPermissions.some(name => userPermissions.includes(name));
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
