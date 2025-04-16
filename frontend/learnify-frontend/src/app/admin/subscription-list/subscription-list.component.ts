import { Component, OnInit } from '@angular/core';
import { SubscriptionService } from '../../services/subscription.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ISubscription } from '../../Interfaces/ISubscription';

@Component({
  selector: 'app-subscription-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './subscription-list.component.html',
  styleUrls: ['./subscription-list.component.css']
})
export class SubscriptionListComponent implements OnInit {
  subscriptions: ISubscription[] = [];
  filteredSubscriptions: ISubscription[] = [];
  isLoading = true;
  errorMessage = '';
  searchTerm = '';
  statusFilter = 'all';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(private subscriptionService: SubscriptionService) { }

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.subscriptionService.fetchSubscriptions().subscribe({
      next: (data) => {
        this.subscriptions = data;
        this.filteredSubscriptions = [...data];
        this.applyFilters();
        this.calculateTotalPages();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching subscriptions:', error);
        this.errorMessage = 'Failed to load subscription data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  getValue(subscription: ISubscription, path: string): any {
    // Handle nested properties like 'package_user.user.email'
    if (path.includes('.')) {
      return path.split('.').reduce((obj, key) => 
        obj && obj[key] !== undefined ? obj[key] : null, subscription);
    }
    return subscription[path as keyof ISubscription];
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters();
  }

  onFilterChange(event: Event): void {
    this.statusFilter = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredSubscriptions = this.subscriptions.filter(sub => {
      // Apply search filter - search in all fields including nested ones
      const matchesSearch = this.searchTerm === '' || 
        (sub.id && sub.id.toString().toLowerCase().includes(this.searchTerm)) ||
        (sub.amount_paid && sub.amount_paid.toLowerCase().includes(this.searchTerm)) ||
        (sub.transaction_reference && sub.transaction_reference.toLowerCase().includes(this.searchTerm)) ||
        (sub.payment_status && sub.payment_status.toLowerCase().includes(this.searchTerm)) ||
        (sub.created_at && sub.created_at.toLowerCase().includes(this.searchTerm)) ||
        (sub.package_user?.user?.email && sub.package_user.user.email.toLowerCase().includes(this.searchTerm)) ||
        (sub.package_user?.package?.name && sub.package_user.package.name.toLowerCase().includes(this.searchTerm));
      
      // Apply status filter
      const matchesStatus = 
        this.statusFilter === 'all' || 
        (sub.payment_status && sub.payment_status.toLowerCase() === this.statusFilter);
      
      return matchesSearch && matchesStatus;
    });
    
    // Reset to first page when filtering
    this.currentPage = 1;
    this.calculateTotalPages();
  }
  
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }
  
  private calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredSubscriptions.length / this.itemsPerPage);
    // Ensure at least 1 page
    if (this.totalPages === 0) {
      this.totalPages = 1;
    }
  }
  
  get paginatedSubscriptions(): ISubscription[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSubscriptions.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  getPaginationRange(): number[] {
    const range: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      // If total pages are less than or equal to maxPagesToShow, show all pages
      for (let i = 1; i <= this.totalPages; i++) {
        range.push(i);
      }
    } else {
      // Show a range centered around current page
      let start = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
      let end = start + maxPagesToShow - 1;
      
      // Adjust if we're near the end
      if (end > this.totalPages) {
        end = this.totalPages;
        start = Math.max(1, end - maxPagesToShow + 1);
      }
      
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
    }
    
    return range;
  }
}
