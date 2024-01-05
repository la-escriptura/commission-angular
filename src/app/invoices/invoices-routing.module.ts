import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { InvoicesComponent } from "./invoices.component";
import { CanDeactivateGuard } from "../shared/can-deactivate.guard";


const routes: Routes = [
    { path: '', component: InvoicesComponent, canDeactivate: [CanDeactivateGuard] }
];


@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class InvoicesRoutingModule {}