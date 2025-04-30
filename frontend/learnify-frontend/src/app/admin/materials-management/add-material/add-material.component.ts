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
  
  // Validation fields
  formSubmitted = false;
  validationErrors = {
    file_name: false,
    file_url: false,
    lesson_id: false
  };
  
  // Track touched state for each field
  touched = {
    file_name: false,
    file_url: false,
    lesson_id: false
  };

  constructor(
    private materialService: MaterialService,
    private lessonService: LessonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchAllLessons();
  }

  fetchAllLessons(): void {
    let currentPage = 1;
    const allLessons: ILesson[] = [];

    const loadNextPage = () => {
      this.lessonService.getManagedLessons(currentPage, undefined, undefined, 1000).subscribe({
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

  validateForm(): boolean {
    const fileName = this.material.file_name.trim();
    const fileUrl = this.material.file_url.trim();
    
    this.validationErrors = {
      file_name: !fileName || fileName.length < 3,
      file_url: !fileUrl || fileUrl.length < 8,
      lesson_id: !this.material.lesson_id
    };

    return !this.validationErrors.file_name && 
           !this.validationErrors.file_url && 
           !this.validationErrors.lesson_id;
  }

  markAsTouched(field: string): void {
    this.touched[field] = true;
    this.validateField(field);
  }

  validateField(field: string): void {
    if (field === 'file_name') {
      const fileName = this.material.file_name.trim();
      this.validationErrors.file_name = !fileName || fileName.length < 3;
    } else if (field === 'file_url') {
      const fileUrl = this.material.file_url.trim();
      this.validationErrors.file_url = !fileUrl || fileUrl.length < 3;
    } else if (field === 'lesson_id') {
      this.validationErrors.lesson_id = !this.material.lesson_id;
    }
  }

  onSubmit(): void {
    this.formSubmitted = true;
    // Mark all fields as touched
    this.touched = {
      file_name: true,
      file_url: true,
      lesson_id: true
    };
    
    if (!this.validateForm()) {
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