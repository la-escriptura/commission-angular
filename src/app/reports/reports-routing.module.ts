import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ReportsComponent } from "./reports.component";
import { CanDeactivateGuard } from "../shared/can-deactivate.guard";



const routes: Routes = [
    { path: '', component: ReportsComponent, canDeactivate: [CanDeactivateGuard] }
];


@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ReportsRoutingModule {}