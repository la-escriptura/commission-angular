import { NgModule } from "@angular/core";
import { InvoicesRoutingModule } from "./invoices-routing.module";
import { InvoicesComponent } from './invoices.component';
import { SharedModule } from "../shared/shared.module";

@NgModule({
	declarations: [InvoicesComponent],
	imports: [
		InvoicesRoutingModule,
		SharedModule
	]
})
export class InvoicesModule {}