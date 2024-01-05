import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminUsersComponent } from "./admin-users.component";
import { CanDeactivateGuard } from "../../shared/can-deactivate.guard";



const routes: Routes = [
    { path: '', component: AdminUsersComponent, canDeactivate: [CanDeactivateGuard]}
];


@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AdminUsersRoutingModule {}