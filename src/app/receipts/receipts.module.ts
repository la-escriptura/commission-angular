import { NgModule } from "@angular/core";
import { ReceiptsRoutingModule } from "./receipts-routing.module";
import { ReceiptsComponent } from './receipts.component';
import { SharedModule } from "../shared/shared.module";

@NgModule({
	declarations: [ReceiptsComponent],
	imports: [
		ReceiptsRoutingModule,
		SharedModule
	]
})
export class ReceiptsModule {}