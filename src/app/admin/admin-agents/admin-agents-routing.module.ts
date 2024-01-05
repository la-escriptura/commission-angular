import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminAgentsComponent } from "./admin-agents.component";
import { CanDeactivateGuard } from "../../shared/can-deactivate.guard";



const routes: Routes = [
    { path: '', component: AdminAgentsComponent, canDeactivate: [CanDeactivateGuard]}
];


@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AdminAgentsRoutingModule {}