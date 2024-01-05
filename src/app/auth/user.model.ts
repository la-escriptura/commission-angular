import { Role } from "../shared/roles.enum";

export class User {

    constructor(
        public access_token: string,
        public refresh_token: string,
        public token_expires: number,
        public first_name: string,
        public rolename: Role[],
    ) {}
}