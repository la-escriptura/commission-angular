import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ReceiptsComponent } from "./receipts.component";
import { CanDeactivateGuard } from "../shared/can-deactivate.guard";


const routes: Routes = [
    { path: '', component: ReceiptsComponent, canDeactivate: [CanDeactivateGuard] }
];


@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ReceiptsRoutingModule {}