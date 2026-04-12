export class Permiso{
    id?: number | null | undefined;
    name?: string | null | undefined;
    guard_name?: string | null | undefined;
    created_at?: Date | string | null | undefined;
    updated_at?: Date | string | null | undefined;
    pivot?: {
        role_id: number;
        permission_id: number;
    };

    constructor(
        id?: number | null | undefined,
        name?: string | null | undefined,
        guard_name?: string | null | undefined,
        created_at?: Date | string | null | undefined,
        updated_at?: Date | string | null | undefined,
        pivot?: {
            role_id: number,
            permission_id: number
        }
    ){
        this.id = id != undefined ? id : null;
        this.name = name != undefined ? name : null;
        this.guard_name = guard_name != undefined ? guard_name : null;
        this.created_at = created_at != undefined ? created_at : null;
        this.updated_at = updated_at != undefined ? updated_at : null;
        this.pivot = pivot != undefined ? pivot : { role_id: 0, permission_id: 0 };
    }
}