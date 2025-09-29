import { User } from "../admin/user";

export class LoggedUser{
    user?: User | null | undefined; // User
    token?: string | null | undefined; // "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9wcmlvcmlkYWRfdW5vLmNvbSIsImF1ZCI6Imh0dHA6XC9cL3ByaW9yaWRhZF91bm8uY29tIiwiaWF0IjoxNjk0NzY0NzE1LCJleHAiOjE2OTUwMjY3MTUsIm5iZiI6MTY5NDc2NDcxNSwic3ViIjoxLCJwcnYiOiIkMmEkMTAkWFZLRW5OZ1Z5bU9uS3lFYU5uU1pNcXlOalJmVE1GbXl
    token_type?: string | null | undefined; // "bearer"

    constructor(
        user?: User | null | undefined,
        token?: string | null | undefined,
        token_type?: string | null | undefined
    ){
        this.user = user != undefined ? user : null;
        this.token = token != undefined ? token : null;
        this.token_type = token_type != undefined ? token_type : null;
    }
}