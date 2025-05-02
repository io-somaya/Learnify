import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class PricingComponent implements OnInit {
  plans: any[] = [];
  loading = false;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchPlans();
  }

  fetchPlans() {
    this.loading = true;
    this.error = '';
    this.http.get<any>('http://localhost:8000/api/packages').subscribe({
      next: (res) => {
        // If your API wraps data, adjust accordingly
        this.plans = res.data || res;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load pricing plans. Please try again later.';
        this.loading = false;
      }
    });
  }
}
