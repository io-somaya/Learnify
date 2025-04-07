import { Component, OnInit, inject } from '@angular/core';
import { SubscriptionService } from '../../services/subscription.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-subscription-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './subscription-list.component.html',
  styleUrls: ['./subscription-list.component.css']
})
export class SubscriptionListComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  subscriptions: any[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  columns = [
    { name: 'email', label: 'User Email' },
    { name: 'grade', label: 'Grade' },
    { name: 'packageName', label: 'Package' },
    { name: 'amountPaid', label: 'Amount Paid' },
    { name: 'paymentStatus', label: 'Status' },
    { name: 'createdAt', label: 'Date' }
  ];

  ngOnInit() {
    this.loadSubscriptions();
  }

  loadSubscriptions() {
    this.isLoading = true;
    this.errorMessage = null;

    this.subscriptionService.fetchSubscriptions().subscribe({
      next: (res) => {
        this.subscriptions = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Failed to load subscriptions';
        console.error('Subscription error:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }

  getValue(subscription: any, column: string): any {
    switch (column) {
      case 'email': return subscription.package_user?.user?.email || '';
      case 'grade': return subscription.package_user?.user?.grade || '';
      case 'packageName': return subscription.package_user?.package?.name || '';
      case 'amountPaid': return `$${subscription.amount_paid}`;
      case 'paymentStatus': return subscription.payment_status || 'unknown';
      case 'createdAt': return this.formatDate(subscription.created_at);
      default: return '';
    }
  }
}
