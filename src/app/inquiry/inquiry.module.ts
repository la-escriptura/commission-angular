import { NgModule } from "@angular/core";
import { InquiryRoutingModule } from "./inquiry-routing.module";
import { InquiryComponent } from './inquiry.component';
import { SharedModule } from "../shared/shared.module";

@NgModule({
	declarations: [InquiryComponent],
	imports: [
		InquiryRoutingModule,
		SharedModule
	]
})
export class InquiryModule {}