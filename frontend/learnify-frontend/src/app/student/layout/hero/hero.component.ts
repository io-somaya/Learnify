import { Component } from '@angular/core';
import { ProfileService } from '../../../services/profile.service';
import { IUserProfile } from '../../../Interfaces/IUserProfile';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {
 user: IUserProfile | null = null;
  isLoading = true;
  error = '';
  
  constructor(
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.user = response.data;
        } else {
          this.error = response.message || 'Unexpected response format';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load profile';
        this.isLoading = false;
      }
    });
  }

}
