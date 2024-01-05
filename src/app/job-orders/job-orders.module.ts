import { NgModule } from "@angular/core";
import { JobOrdersRoutingModule } from "./job-orders-routing.module";
import { JobOrdersComponent } from './job-orders.component';
import { SharedModule } from "../shared/shared.module";

@NgModule({
	declarations: [JobOrdersComponent],
	imports: [
		JobOrdersRoutingModule,
		SharedModule
	]
})
export class JobOrdersModule {}