import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUserProfile } from '../../../Interfaces/IUserProfile';
import { ProfileService } from '../../../services/profile.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit, OnDestroy {
  @Input() user: IUserProfile | null = null;
  defaultImage = 'assets/images/default-avatar.png';
  private profileSubscription: Subscription | null = null;

  constructor(
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.profileSubscription = this.profileService.userProfile$.subscribe(user => {
      if (user) {
        this.user = user;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  getProfileImage(): string {
    if (!this.user?.profile_picture) return this.defaultImage;
    return this.profileService.formatProfilePictureUrl(this.user.profile_picture);
  }
}
