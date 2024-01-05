import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminFormulaComponent } from "./admin-formula.component";
import { CanDeactivateGuard } from "../../shared/can-deactivate.guard";



const routes: Routes = [
    { path: '', component: AdminFormulaComponent, canDeactivate: [CanDeactivateGuard]}
];


@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AdminFormulaRoutingModule {}