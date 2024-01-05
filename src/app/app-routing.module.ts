import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { PageNotFoundComponent } from "./shared/page-not-found/page-not-found.component";
import { Role } from './shared/roles.enum';
import { AuthGuard } from "./auth/auth.guard";
import { JobOrderAgentsResolver } from "./job-orders/job-order.agents.resolver";
import { JobOrderCustomersResolver } from "./job-orders/job-order.customers.resolver";
import { JobOrderUnitmeasuresResolver } from "./job-orders/job-order.unitmeasures.resolver";
import { JobOrderRedoJobOrdersResolver } from "./job-orders/job-order.redojoborders.resolver";
import { InvoiceJobordersResolver } from "./invoices/invoice.joborders.resolver";
import { InvoiceRedoInvoicesResolver } from "./invoices/invoice.redoinvoices.resolver";
import { ReceiptInvoicesResolver } from "./receipts/receipt.invoices.resolver";
import { ReceiptRedoReceiptsResolver } from "./receipts/receipt.redoreceipts.resolver";
import { ReportSalesYearResolver } from "./reports/report.salesyear.resolver";
import { ReportSalesMonthResolver } from "./reports/report.salesmonth.resolver";

const appRoutes: Routes = [
    { path: '', redirectTo: '/job-orders', pathMatch: 'full' },
    { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)},
    { path: 'job-orders', canActivate: [AuthGuard], loadChildren: () => import('./job-orders/job-orders.module').then(m => m.JobOrdersModule),data: { roles: [Role.joborder,Role.jobordereditor,Role.joborderadmin,Role.admin]}, resolve: {
        joborderAgents: JobOrderAgentsResolver,
        joborderCustomers: JobOrderCustomersResolver,
        joborderUnitmeasures: JobOrderUnitmeasuresResolver,
        joborderRedoJobOrders: JobOrderRedoJobOrdersResolver
    }},
    { path: 'invoices', canActivate: [AuthGuard], loadChildren: () => import('./invoices/invoices.module').then(m => m.InvoicesModule), data: { roles: [Role.invoice,Role.invoiceeditor,Role.invoiceadmin,Role.admin]}, resolve: {
        invoiceJoborders: InvoiceJobordersResolver,
        invoiceRedoInvoices: InvoiceRedoInvoicesResolver
    }},
    { path: 'receipts', canActivate: [AuthGuard], loadChildren: () => import('./receipts/receipts.module').then(m => m.ReceiptsModule),data: { roles: [Role.receipt,Role.receipteditor,Role.receiptadmin,Role.admin]}, resolve: {
        receiptInvoices: ReceiptInvoicesResolver,
        receiptRedoReceipts: ReceiptRedoReceiptsResolver
    }},
    { path: 'reports', canActivate: [AuthGuard], loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule),data: { roles: [Role.report,Role.admin]}, resolve: {
        reportSalesYear: ReportSalesYearResolver,
        reportSalesMonth: ReportSalesMonthResolver
    }},
    { path: 'inquiry', canActivate: [AuthGuard], loadChildren: () => import('./inquiry/inquiry.module').then(m => m.InquiryModule),data: { roles: [Role.inquiry,Role.admin]}},
    { path: 'admin', canActivate: [AuthGuard], loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),data: { roles: [Role.admin]}},
    { path: 'not-found', component: PageNotFoundComponent },
    { path: '**', redirectTo: '/not-found' }
];

@NgModule({
	imports: [RouterModule.forRoot(appRoutes, {preloadingStrategy: PreloadAllModules})],
	exports: [RouterModule]
})
export class AppRoutingModule {}