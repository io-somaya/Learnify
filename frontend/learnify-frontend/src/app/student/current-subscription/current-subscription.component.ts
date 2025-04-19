import { Component } from '@angular/core';
import { ISubscriptionDetail } from '../../Interfaces/ISubscription';
import { SubscriptionService } from '../../services/subscription.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-current-subscription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './current-subscription.component.html',
  styleUrl: './current-subscription.component.css'
})
export class CurrentSubscriptionComponent {
  public currentSubscription: ISubscriptionDetail | null = null;

  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router
  ) { }

  ngOnInit() {
    this.subscriptionService.getCurrentSubscription().subscribe({
      next: (res) => {
        this.currentSubscription = res;
        console.log('Current Subscription:', this.currentSubscription);
      },
      error: (error) => {
        console.error('Error fetching current subscription:', error);
      }
    });
  }
}
