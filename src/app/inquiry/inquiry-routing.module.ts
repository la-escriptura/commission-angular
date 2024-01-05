import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { InquiryComponent } from "./inquiry.component";
import { CanDeactivateGuard } from "../shared/can-deactivate.guard";

const routes: Routes = [
    { path: '', component: InquiryComponent, canDeactivate: [CanDeactivateGuard] }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class InquiryRoutingModule {}