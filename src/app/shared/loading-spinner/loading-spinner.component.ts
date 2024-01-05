import { Component, Input } from "@angular/core";

@Component({
    selector: 'app-loading-spinner',
    template: '<div class="lds-ring"><div></div><div></div><div></div><div></div></div><div>Loading {{ getMenu() | titlecase }}...</div>',
    styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent {
    @Input() menu: string;

    getMenu() {
        if (!!this.menu) {
            return this.menu.replaceAll(new RegExp("[^A-Za-z0-9]", "ig"),' ').trim();
        }
        return null;
    }
}

