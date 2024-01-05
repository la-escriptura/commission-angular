import { NgModule } from "@angular/core";
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptorService } from './auth/auth.interceptor';
import { JobOrdersService } from './job-orders/job-orders.service';
import { JobOrderAgentsResolver } from './job-orders/job-order.agents.resolver';
import { JobOrderCustomersResolver } from './job-orders/job-order.customers.resolver';
import { JobOrderUnitmeasuresResolver } from './job-orders/job-order.unitmeasures.resolver';
import { JobOrderRedoJobOrdersResolver } from "./job-orders/job-order.redojoborders.resolver";
import { InvoicesService } from './invoices/invoices.service';
import { InvoiceJobordersResolver } from './invoices/invoice.joborders.resolver';
import { InvoiceRedoInvoicesResolver } from "./invoices/invoice.redoinvoices.resolver";
import { ReceiptsService } from './receipts/receipts.service';
import { ReceiptInvoicesResolver } from './receipts/receipt.invoices.resolver';
import { ReportsService } from "./reports/reports.service";
import { ReportSalesYearResolver } from './reports/report.salesyear.resolver';
import { ReportSalesMonthResolver } from "./reports/report.salesmonth.resolver";
import { ReceiptRedoReceiptsResolver } from "./receipts/receipt.redoreceipts.resolver";
import { InquiryService } from "./inquiry/inquiry.service";
import { AdminFormulaService } from "./admin/admin-formula/admin-formula.service";
import { AdminAgentsService } from "./admin/admin-agents/admin-agents.service";
import { AdminUsersService } from "./admin/admin-users/admin-users.service";
import { ApiService } from "./shared/api.service";
import { FormulaService } from "./shared/formula.service";
import { FormatService } from "./shared/format.service";
import { UtilityService } from "./shared/utility.service";

@NgModule({
	providers: [
		{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true},
		JobOrdersService, 
		JobOrderAgentsResolver,
		JobOrderCustomersResolver,
		JobOrderUnitmeasuresResolver,
		JobOrderRedoJobOrdersResolver,
		InvoicesService, 
		InvoiceJobordersResolver,
		InvoiceRedoInvoicesResolver,
		ReceiptsService,
		ReceiptInvoicesResolver,
		ReceiptRedoReceiptsResolver,
		ReportsService,
		ReportSalesYearResolver,	
		ReportSalesMonthResolver,	
		InquiryService,		
		AdminFormulaService,
		AdminAgentsService,
		AdminUsersService,
		ApiService,
		FormulaService,
		FormatService,
		UtilityService
	]
})
export class CoreModule {}
