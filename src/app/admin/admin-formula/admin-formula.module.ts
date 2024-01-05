import { NgModule } from "@angular/core";
import { AdminFormulaRoutingModule } from "./admin-formula-routing.module";
import { AdminFormulaComponent } from './admin-formula.component';
import { SharedModule } from "../../shared/shared.module";


@NgModule({
	declarations: [AdminFormulaComponent],
	imports: [
		AdminFormulaRoutingModule,
		SharedModule
	]
})
export class AdminFormulaModule {}