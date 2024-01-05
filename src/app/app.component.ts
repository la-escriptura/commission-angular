import { Component, OnDestroy, OnInit, ViewChild, ComponentFactoryResolver, ViewContainerRef, ComponentRef, ChangeDetectorRef } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent } from '@angular/router';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { PlaceHolderDirective } from './shared/placeholder.directive';
import { TimeoutComponent } from './shared/timeout/timeout.component';
import { AuthService } from './auth/auth.service';
import { FormulaService } from './shared/formula.service';
import { UtilityService } from './shared/utility.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy  {
  private userSub: Subscription;
  private hideChildModalSub: Subscription;
  private logoutSub: Subscription;
  private staySub: Subscription;

  private loadingSub = new Subject<void>();
  public isLoading: boolean = false;
  public menu: string = null;

  private intervalIdle: any;

  public idleState = 'Not started.';
  private timedOut = false;
  private lastPing?: Date = null;
  private title = 'commission-idle-timeout';
  private timeoutSet: number = 60;

  
  @ViewChild(PlaceHolderDirective, { static: true }) timeoutHost: PlaceHolderDirective;
  private componentRef: ComponentRef<TimeoutComponent>;

  constructor(private authService: AuthService, private idle: Idle, private keepalive: Keepalive, private router: Router, private componentFactoryResolver: ComponentFactoryResolver, private hostViewContainerRef: ViewContainerRef, private changeDetector: ChangeDetectorRef, private formulaService: FormulaService, private util: UtilityService) {}

  async ngOnInit () {
    // sets a timeout period. after seconds of inactivity, the user will be considered timed out.
    this.idle.setTimeout(this.timeoutSet);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    
    this.idle.onIdleStart.subscribe(() => {
      this.intervalIdle = setInterval(() => {
        this.logout();
      }, this.timeoutSet  * 1000);
      this.idleState = 'You\'ve gone idle!'
      this.showTimeoutAlert();
    });
    
    this.idle.onIdleEnd.subscribe(() => { 
      this.idleState = 'No longer idle.'
      this.componentRef.instance.idleState = this.idleState;
      this.changeDetector.detectChanges();
      this.reset();
    });
    
    this.idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = 'You will be logout in ' + countdown + ' seconds!'
      this.componentRef.instance.idleState = this.idleState;
      this.changeDetector.detectChanges();
    });
    
    this.idle.onTimeout.subscribe(() => {
      this.idleState = 'Timed out!';
      this.timedOut = true;
      this.logout();
    });

    // sets the ping interval to 15 seconds
    this.keepalive.interval(15);

    const serverTimestamp = await this.util.getServerTimestamp();

    this.keepalive.onPing.subscribe(() => this.lastPing = new Date(serverTimestamp));

    this.userSub = this.authService.user.subscribe(user => {
      if (!!user) {
        // sets an idle timeout.
        this.idle.setIdle(user.token_expires - this.timeoutSet * 5);
        this.reset();
      } else {
        this.idle.stop();
      }
    });

    if (this.authService.autoLogin(serverTimestamp)) {
      this.formulaService.setFormulas();
    }

    this.router.events.pipe(takeUntil(this.loadingSub)).subscribe((routerEvent) => {
      this.menu = (<RouterEvent>routerEvent).url;
      this.checkRouterEvent(routerEvent as RouterEvent);
    });
  }
  
  checkRouterEvent(routerEvent: RouterEvent): void {
    if (routerEvent instanceof NavigationStart) { this.isLoading = true; }
    if (routerEvent instanceof NavigationEnd || routerEvent instanceof NavigationCancel || routerEvent instanceof NavigationError) { this.isLoading = false; }
  }

  logout() {
    this.onClearInterval();
    this.hideTimeoutAlert();
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  stay() {
    this.reset();
    this.hideTimeoutAlert();
  }

  reset() {
    this.onClearInterval();
    this.idle.watch();
    this.timedOut = false;
  }

  onClearInterval() {
    if (this.intervalIdle) {
      clearInterval(this.intervalIdle);
    }
    this.intervalIdle = null;
  }

  private showTimeoutAlert() {
    const alertCmpFactory = this.componentFactoryResolver.resolveComponentFactory(TimeoutComponent);
    this.hostViewContainerRef = this.timeoutHost.viewContainerRef;
    this.hostViewContainerRef.clear();
    this.componentRef = this.hostViewContainerRef.createComponent(alertCmpFactory);
    this.componentRef.instance.idleState = this.idleState;
    this.changeDetector = this.componentRef.changeDetectorRef;
    this.changeDetector.detectChanges();

    this.hideChildModalSub = this.componentRef.instance.hideChildModal.subscribe(() => {
      this.hideChildModalSub.unsubscribe();
      this.hideTimeoutAlert();
    });
    
    this.logoutSub = this.componentRef.instance.logout.subscribe(() => {
      this.logoutSub.unsubscribe();
      this.logout();
    });

    this.staySub = this.componentRef.instance.stay.subscribe(() => {
      this.staySub.unsubscribe();
      this.stay();
    });
  }

  private hideTimeoutAlert() {
    this.componentRef.destroy();
    this.hostViewContainerRef.clear();
  }

  ngOnDestroy() {
    if (this.userSub) { this.userSub.unsubscribe(); }
    if (this.hideChildModalSub) { this.hideChildModalSub.unsubscribe(); }
    if (this.logoutSub) { this.logoutSub.unsubscribe(); }
    if (this.staySub) { this.userSub.unsubscribe(); }
    this.loadingSub.next();
  }
}
