import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class PricingComponent {
  plans = [
    {
      name: 'Basic',
      price: '9.99',
      period: 'per month',
      features: [
        'Access to basic courses',
        'Limited interactive lessons',
        'Email support',
        'Progress tracking',
        'Mobile access'
      ],
      recommended: false,
      btnClass: 'btn-outline-primary'
    },
    {
      name: 'Standard',
      price: '19.99',
      period: 'per month',
      features: [
        'Access to all courses',
        'Unlimited interactive lessons',
        'Priority email support',
        'Advanced progress analytics',
        'Mobile access',
        'Live sessions (2 per week)'
      ],
      recommended: true,
      btnClass: 'btn-primary'
    },
    {
      name: 'Premium',
      price: '29.99',
      period: 'per month',
      features: [
        'Access to all courses',
        'Unlimited interactive lessons',
        '24/7 phone support',
        'Advanced progress analytics',
        'Mobile access',
        'Unlimited live sessions',
        'Personalized learning path',
        'Parent dashboard'
      ],
      recommended: false,
      btnClass: 'btn-outline-primary'
    }
  ];
}
