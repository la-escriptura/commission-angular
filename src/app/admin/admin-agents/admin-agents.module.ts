import { NgModule } from "@angular/core";
import { AdminAgentsRoutingModule } from "./admin-agents-routing.module";
import { AdminAgentsComponent } from './admin-agents.component';
import { SharedModule } from "../../shared/shared.module";


@NgModule({
	declarations: [AdminAgentsComponent],
	imports: [
		AdminAgentsRoutingModule,
		SharedModule
	]
})
export class AdminAgentsModule {}