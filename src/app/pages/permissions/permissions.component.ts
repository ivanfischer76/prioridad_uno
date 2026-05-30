import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

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
    selector: 'app-permissions',
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
    templateUrl: './permissions.component.html',
    styleUrls: ['./permissions.component.scss']
})
export class PermissionsComponent implements OnInit {
    permissions: Permiso[] = [];
    loggedUser: User | null = null;

    loading = false;
    loadError = '';
    globalFilterValue = '';

    altoTabla: string = '58vh';
    cabeceraAcciones: string = 'Acciones';

    permissionDialogVisible = false;
    permissionDialogMode: 'create' | 'edit' = 'create';
    savingPermission = false;
    editingPermissionId: number | null = null;

    permissionAssignmentsDialogVisible = false;
    loadingPermissionAssignments = false;
    permissionAssignmentsPermissionName = '';
    rolesWithPermission: Role[] = [];
    usersWithPermission: User[] = [];

    permissionForm = {
        name: '',
    };

    constructor(
        private readonly authService: AuthService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadLoggedUser();
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

    loadPermissions(): void {
        this.loading = true;
        this.loadError = '';

        this.authService.listPermissions().subscribe({
            next: (response: { data?: Permiso[] | null }) => {
                this.permissions = Array.isArray(response?.data) ? response.data : [];
                this.loading = false;
            },
            error: () => {
                this.permissions = [];
                this.loading = false;
                this.loadError = 'No se pudieron cargar los permisos.';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Permisos',
                    detail: this.loadError,
                    life: 3200,
                });
            }
        });
    }

    openAddPermissionDialog(): void {
        this.permissionDialogMode = 'create';
        this.editingPermissionId = null;
        this.savingPermission = false;
        this.permissionForm = {
            name: '',
        };
        this.permissionDialogVisible = true;
    }

    editPermission(permission: Permiso): void {
        this.permissionDialogMode = 'edit';
        this.editingPermissionId = typeof permission.id === 'number' ? permission.id : null;
        this.savingPermission = false;
        this.permissionForm = {
            name: permission.name?.toString() || '',
        };
        this.permissionDialogVisible = true;
    }

    openPermissionAssignmentsDialog(permission: Permiso): void {
        const permissionName = permission.name?.toString().trim() || '';

        if (!permissionName) {
            this.messageService.add({
                severity: 'error',
                summary: 'Permisos',
                detail: 'No se pudo identificar el permiso para listar asignaciones.',
                life: 3200,
            });
            return;
        }

        this.permissionAssignmentsPermissionName = permissionName;
        this.permissionAssignmentsDialogVisible = true;
        this.loadingPermissionAssignments = true;
        this.rolesWithPermission = [];
        this.usersWithPermission = [];

        const permissionNameNormalized = permissionName.toLowerCase().trim();

        forkJoin({
            rolesResponse: this.authService.listRoles(),
            usersResponse: this.authService.listUsers(),
        }).subscribe({
            next: ({ rolesResponse, usersResponse }: { rolesResponse: { data?: Role[] | null }, usersResponse: { data?: User[] | null } }) => {
                const roles = Array.isArray(rolesResponse?.data) ? rolesResponse.data : [];
                const users = Array.isArray(usersResponse?.data) ? usersResponse.data : [];

                this.rolesWithPermission = roles
                    .filter((role) =>
                        (role.permissions || []).some((rolePermission) =>
                            rolePermission?.name?.toString().toLowerCase().trim() === permissionNameNormalized
                        )
                    )
                    .sort((a, b) =>
                        (a.name?.toString() || '').localeCompare(b.name?.toString() || '', 'es', { sensitivity: 'base' })
                    );

                const roleNamesWithPermission = new Set(
                    this.rolesWithPermission
                        .map((role) => role.name?.toString().toLowerCase().trim() || '')
                        .filter((name) => !!name)
                );

                this.usersWithPermission = users
                    .filter((user) => {
                        const hasDirectPermission = (user.permissions || []).some((userPermission) =>
                            userPermission?.name?.toString().toLowerCase().trim() === permissionNameNormalized
                        );

                        const hasPermissionByRole = (user.roles || []).some((userRole) =>
                            roleNamesWithPermission.has(userRole?.name?.toString().toLowerCase().trim() || '')
                        );

                        return hasDirectPermission || hasPermissionByRole;
                    })
                    .sort((a, b) =>
                        (a.username?.toString() || '').localeCompare(b.username?.toString() || '', 'es', { sensitivity: 'base' })
                    );

                this.loadingPermissionAssignments = false;
            },
            error: () => {
                this.loadingPermissionAssignments = false;
                this.rolesWithPermission = [];
                this.usersWithPermission = [];
                this.messageService.add({
                    severity: 'error',
                    summary: 'Permisos',
                    detail: 'No se pudieron cargar las asignaciones del permiso.',
                    life: 3200,
                });
            }
        });
    }

    closePermissionAssignmentsDialog(): void {
        if (this.loadingPermissionAssignments) {
            return;
        }

        this.permissionAssignmentsDialogVisible = false;
    }

    closePermissionDialog(): void {
        if (this.savingPermission) {
            return;
        }

        this.permissionDialogVisible = false;
    }

    savePermission(): void {
        const trimmedName = this.permissionForm.name.trim();

        if (!trimmedName) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Permisos',
                detail: 'El nombre del permiso es obligatorio.',
                life: 2800,
            });
            return;
        }

        if (this.permissionDialogMode === 'edit' && this.editingPermissionId === null) {
            this.messageService.add({
                severity: 'error',
                summary: 'Permisos',
                detail: 'No se pudo identificar el permiso a editar.',
                life: 3200,
            });
            return;
        }

        this.savingPermission = true;

        const payload = {
            name: trimmedName,
        };

        const request$ = this.permissionDialogMode === 'create'
            ? this.authService.createPermission(payload)
            : this.authService.updatePermission(this.editingPermissionId as number, payload);

        request$.subscribe({
            next: () => {
                this.savingPermission = false;
                this.permissionDialogVisible = false;
                this.loadPermissions();

                this.messageService.add({
                    severity: 'success',
                    summary: 'Permisos',
                    detail: this.permissionDialogMode === 'create'
                        ? 'Permiso creado correctamente y asignado al rol super administrador.'
                        : 'Permiso actualizado correctamente.',
                    life: 2800,
                });
            },
            error: () => {
                this.savingPermission = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Permisos',
                    detail: this.permissionDialogMode === 'create'
                        ? 'No se pudo crear el permiso.'
                        : 'No se pudo actualizar el permiso.',
                    life: 3200,
                });
            }
        });
    }

    confirmDeletePermission(permission: Permiso): void {
        if (!this.canDeletePermissions) {
            return;
        }

        const permissionId = typeof permission.id === 'number' ? permission.id : null;
        if (permissionId === null) {
            this.messageService.add({
                severity: 'error',
                summary: 'Permisos',
                detail: 'No se pudo identificar el permiso a eliminar.',
                life: 3200,
            });
            return;
        }

        const permissionName = permission.name?.toString() || 'este permiso';
        const isConfirmed = window.confirm(`Se eliminará ${permissionName}. ¿Desea continuar?`);

        if (!isConfirmed) {
            return;
        }

        this.authService.deletePermission(permissionId).subscribe({
            next: () => {
                this.loadPermissions();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Permisos',
                    detail: 'Permiso eliminado correctamente.',
                    life: 2800,
                });
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Permisos',
                    detail: 'No se pudo eliminar el permiso.',
                    life: 3200,
                });
            }
        });
    }

    get isCreateMode(): boolean {
        return this.permissionDialogMode === 'create';
    }

    get canManagePermissions(): boolean {
        return this.hasAnyPermission(['gestionar permisos']);
    }

    get canCreatePermissions(): boolean {
        return this.canManagePermissions;
    }

    get canEditPermissions(): boolean {
        return this.canManagePermissions;
    }

    get canDeletePermissions(): boolean {
        return this.canManagePermissions;
    }

    get canViewPermissionAssignments(): boolean {
        return this.canManagePermissions;
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
