import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatTooltipModule } from '@angular/material/tooltip'; 
import { MatSelectModule } from '@angular/material/select';
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialogModule } from "@angular/material/dialog";
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxEchartsModule } from 'ngx-echarts';
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { AlertComponent } from "./alert/alert.component";
import { TimeoutComponent } from './timeout/timeout.component';
import { LoadingSpinnerComponent } from "./loading-spinner/loading-spinner.component";
import { ProgressSpinnerDialogComponent } from './progress-spinner/progress-spinner-dialog.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { PlaceHolderDirective } from "./placeholder.directive";
import { DropdownDirective } from "./dropdown.directive";
import { HasRolesDirective } from "./has-roles.directive";
import { HasNotRolesDirective } from "./has-not-roles.directive";

export const MY_FORMATS = {
    parse: {
      dateInput: 'LL', 
    },
    display: {
      dateInput: 'MMMM YYYY', // this is the format showing on the input element
      monthYearLabel: 'MMMM YYYY', // this is showing on the calendar 
    },
};

@NgModule({
	declarations: [
		PageNotFoundComponent,
		AlertComponent,
		TimeoutComponent,
		LoadingSpinnerComponent,
		ProgressSpinnerDialogComponent,
		ChangePasswordComponent,
		PlaceHolderDirective,
		DropdownDirective,
		HasRolesDirective,
		HasNotRolesDirective
  
	],
	imports: [
		ReactiveFormsModule,
		CommonModule,
		MatTooltipModule,
		MatSelectModule,
		// MatButtonModule,
		// MatFormFieldModule,
		MatProgressSpinnerModule,
		MatDialogModule,
		NgxMatSelectSearchModule,
		NgxEchartsModule.forRoot({echarts: () => import('echarts')})
	],
	exports: [
		PageNotFoundComponent,
		AlertComponent,
		TimeoutComponent,
		LoadingSpinnerComponent,
		ProgressSpinnerDialogComponent,
		ChangePasswordComponent,
		PlaceHolderDirective,
		DropdownDirective,
		HasRolesDirective,
		HasNotRolesDirective,
		ReactiveFormsModule,
		CommonModule,
		MatTooltipModule,
		MatSelectModule,
		// MatButtonModule,
		// MatFormFieldModule,
		MatProgressSpinnerModule,
		MatDialogModule,
		NgxMatSelectSearchModule,
		NgxEchartsModule
	]
})
export class SharedModule {}