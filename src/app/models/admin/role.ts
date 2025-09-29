export class Role{
    id?: number | null | undefined;
    name?: string | null | undefined;
    guard_name?: string | null | undefined;
    created_at?: Date | string | null | undefined;
    updated_at?: Date | string | null | undefined;
    pivot?: {
        model_type?: string | null | undefined;
        model_id?: number | null | undefined;
        role_id?: number | null | undefined;
    } | null | undefined;

    constructor(
        id?: number | null | undefined,
        name?: string | null | undefined,
        guard_name?: string | null | undefined,
        created_at?: Date | string | null | undefined,
        updated_at?: Date | string | null | undefined,
        pivot?: {
            model_type?: string | null | undefined,
            model_id?: number | null | undefined,
            role_id?: number | null | undefined
        } | null | undefined
    ){
        this.id = id != undefined ? id : null;
        this.name = name != undefined ? name : null;
        this.guard_name = guard_name != undefined ? guard_name : null;
        this.created_at = created_at != undefined ? created_at : null;
        this.updated_at = updated_at != undefined ? updated_at : null;
        this.pivot = pivot != undefined ? pivot : null;
    }
}
  