import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaderboardService, LeaderboardStudent } from '../../services/leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit, AfterViewInit {
  @ViewChild('leaderboardSection') leaderboardSection!: ElementRef;
  topStudents: LeaderboardStudent[] = [];
  loading = true;
  error = false;

  constructor(private leaderboardService: LeaderboardService) { }

  ngOnInit(): void {
    this.loadLeaderboardData();
  }

  ngAfterViewInit(): void {
    // Ensure the section is properly identified
    if (this.leaderboardSection) {
      this.leaderboardSection.nativeElement.id = 'leaderboard-section';
    }
  }

  loadLeaderboardData(): void {
    this.leaderboardService.getTopStudents().subscribe({
      next: (data) => {
        this.topStudents = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading leaderboard data:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
}
