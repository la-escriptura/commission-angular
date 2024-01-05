import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { JobOrdersComponent } from "./job-orders.component";
import { CanDeactivateGuard } from "../shared/can-deactivate.guard";


const routes: Routes = [
    { path: '', component: JobOrdersComponent, canDeactivate: [CanDeactivateGuard] }
];


@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class JobOrdersRoutingModule {}