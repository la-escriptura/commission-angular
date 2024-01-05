import { Directive, Input, OnChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { Role } from "../shared/roles.enum";
import { User } from '../auth/user.model';

@Directive({
    selector: '[hasNotRoles]'
})
export class HasNotRolesDirective implements OnChanges {
    private visible: boolean;
    private roles: Role[];
    private user: User;

    @Input() set hasNotRoles(roles: Role[]) {
        this.roles = roles;
    }

    @Input('hasNotRolesFor') set hasNotRolesFor(user: User) {
        this.user = user;
    };

    constructor(private templateRef: TemplateRef<unknown>, private viewContainer: ViewContainerRef) {}

    ngOnChanges() {
        // check if account roles include at least one of the input roles
        if (!!this.user) {
            if (!this.user.rolename.some(role => this.roles.includes(role))) {
                this.viewContainer.clear();
                this.viewContainer.createEmbeddedView(this.templateRef);
                this.visible = true;
                return;
            }
        }

        this.viewContainer.clear();
        this.visible = false;
    }
}