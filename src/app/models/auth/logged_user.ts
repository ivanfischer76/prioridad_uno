import { Permiso } from '../admin/permiso';
import { Role } from '../admin/role';

export class LoggedUser {
    id?: number | null | undefined; // 1,
    username?: string | null | undefined; // "ivan.fischer",
    apellido?: string | null | undefined; // "Fischer",
    nombre?: string | null | undefined; // "Iván Gustavo",
    fecha_nacimiento?: Date | string | null | undefined; // null,
    iglesia?: string | null | undefined; // "Asociación Iglesia del Señor",
    email?: string | null | undefined; // "ivanfischer76@gmail.com",
    email_verified_at?: Date | string | null | undefined; // null,
    created_at?: Date | string | null | undefined; // "2025-09-05T23:47:15.000000Z",
    updated_at?: Date | string | null | undefined; // "2025-09-05T23:47:15.000000Z"
    roles?: Role[] | null | undefined;
    permissions?: Permiso[] | null | undefined;

    constructor(
        id?: number | null | undefined,
        username?: string | null | undefined,
        apellido?: string | null | undefined,
        nombre?: string | null | undefined,
        fecha_nacimiento?: Date | string | null | undefined,
        iglesia?: string | null | undefined,
        email?: string | null | undefined,
        email_verified_at?: Date | string | null | undefined,
        created_at?: Date | string | null | undefined,
        updated_at?: Date | string | null | undefined,
        roles?: Role[] | null | undefined,
        permissions?: Permiso[] | null | undefined
    ){
        this.id = id != undefined ? id : null;
        this.username = username != undefined ? username : null;
        this.apellido = apellido != undefined ? apellido : null;
        this.nombre = nombre != undefined ? nombre : null;
        this.fecha_nacimiento = fecha_nacimiento != undefined ? fecha_nacimiento : null;
        this.iglesia = iglesia != undefined ? iglesia : null;
        this.email = email != undefined ? email : null;
        this.email_verified_at = email_verified_at != undefined ? email_verified_at : null;
        this.created_at = created_at != undefined ? created_at : null;
        this.updated_at = updated_at != undefined ? updated_at : null;
        this.roles = roles != undefined ? roles : null;
        this.permissions = permissions != undefined ? permissions : null;
    }
}