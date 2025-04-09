import { Component, OnInit } from '@angular/core';
import { LessonService } from '../../services/lessons.service';
import { ILesson } from '../../Interfaces/ILesson';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lesson-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lesson-detail.component.html',
  styleUrls: ['./lesson-detail.component.scss']
})
export class LessonDetailComponent implements OnInit {
  lesson: ILesson | null = null;
  isLoading = true;
  errorMessage = '';
  lessonId!: number;

  constructor(
    private lessonService: LessonService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.lessonId = +params['id'];
      this.loadLesson();
    });
  }

  loadLesson(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.lessonService.getLessonById(this.lessonId)
      .pipe(
        catchError(error => {
          this.errorMessage = error.message;
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe(lesson => {
        this.lesson = lesson;
        this.isLoading = false;
      });
  }

  goBack(): void {
    this.router.navigate(['/lessons-list']);
  }
}