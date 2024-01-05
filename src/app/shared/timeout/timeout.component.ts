import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-timeout',
  templateUrl: './timeout.component.html',
  styleUrls: ['./timeout.component.css']
})
export class TimeoutComponent implements OnInit {
  @Input() idleState: string;
  @Output() hideChildModal = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() stay = new EventEmitter<void>();

  ngOnInit() {
    
  }
  
  onHideChildModal() {
    this.hideChildModal.emit();
  }

  onLogout() {
    this.logout.emit();
  }

  onStay() {
    this.stay.emit();
  }
}
