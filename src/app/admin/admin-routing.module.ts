import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminComponent } from "./admin.component";


const routes: Routes = [
    { path: '', component: AdminComponent }
    // { path: '', component: AdminComponent, children: [
	// 	{ path: 'formula', loadChildren: () => import('./admin-formula/admin-formula.module').then(m => m.AdminFormulaModule)},
	// 	{ path: 'agents', loadChildren: () => import('./admin-agents/admin-agents.module').then(m => m.AdminAgentsModule)},
	// 	{ path: 'users', loadChildren: () => import('./admin-users/admin-users.module').then(m => m.AdminUsersModule)}		
	// ]}
];


@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AdminRoutingModule {}