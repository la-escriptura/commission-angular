import { NgModule } from "@angular/core";
import { AdminUsersRoutingModule } from "./admin-users-routing.module";
import { AdminUsersComponent } from './admin-users.component';
import { SharedModule } from "../../shared/shared.module";


@NgModule({
	declarations: [AdminUsersComponent],
	imports: [
		AdminUsersRoutingModule,
		SharedModule
	]
})
export class AdminUsersModule {}