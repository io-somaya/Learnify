import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialService } from '../../../services/material.service';
import { LessonService } from '../../../services/lessons.service';
import { ILesson } from '../../../Interfaces/ILesson';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-material',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-material.component.html',
  styleUrls: ['./add-material.component.css'],
})
export class AddMaterialComponent implements OnInit {
  material = {
    file_name: '',
    file_url: '',
    lesson_id: null
  };

  lessons: ILesson[] = [];
  lessonSearch: string = '';

  constructor(
    private materialService: MaterialService,
    private lessonService: LessonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchAllLessons();
  }

  fetchAllLessons(): void {
    // نعمل لوب على الصفحات كلها لحد ما نجيب كل الداتا
    let currentPage = 1;
    const allLessons: ILesson[] = [];

    const loadNextPage = () => {
      this.lessonService.getManagedLessons(currentPage, undefined, undefined, 100).subscribe({
        next: (res) => {
          allLessons.push(...res.data.data);
          if (currentPage < res.data.last_page) {
            currentPage++;
            loadNextPage();
          } else {
            this.lessons = allLessons;
          }
        },
        error: (err) => {
          console.error('Error loading lessons:', err.message);
        }
      });
    };

    loadNextPage();
  }

  filteredLessons(): ILesson[] {
    const search = this.lessonSearch.toLowerCase().trim();
    return this.lessons.filter(lesson =>
      lesson.title.toLowerCase().includes(search)
    );
  }

  onSubmit(): void {
    if (!this.material.lesson_id || !this.material.file_name || !this.material.file_url) {
      console.log('All fields required');
      return;
    }

    this.materialService.createMaterial(this.material).subscribe({
      next: () => {
        console.log('Material created successfully');
        this.router.navigate(['admin/dashboard/materials-management']);
      },
      error: (err) => {
        console.error('Error creating material:', err.message);
      }
    });
  }
  navigateToMaterialsManagement(): void {
    this.router.navigate(['admin/dashboard/materials-management']);
  }
}
