import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LeaderboardStudent {
  id: number;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  grade: string;
  average_score: number;
}

interface ApiResponse {
  status: number;
  message: string;
  data: LeaderboardStudent[];
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getTopStudents(): Observable<LeaderboardStudent[]> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/leaderboard`)
      .pipe(map(response => response.data));
  }
}
