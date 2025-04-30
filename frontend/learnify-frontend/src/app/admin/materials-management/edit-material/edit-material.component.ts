import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialService } from '../../../services/material.service';
import { LessonService } from '../../../services/lessons.service';
import { ILesson } from '../../../Interfaces/ILesson';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-edit-material',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-material.component.html',
  styleUrls: ['./edit-material.component.css'],
})
export class EditMaterialComponent implements OnInit {
  material = {
    file_name: '',
    file_url: '',
    lesson_id: null
  };

  lessons: ILesson[] = [];
  lessonSearch: string = '';
  materialId!: number;
  
  // Form validation states
  formSubmitted = false;
  formErrors = {
    file_name: { required: false, minlength: false, touched: false },
    file_url: { required: false, minlength: false, touched: false },
    lesson_id: { required: false, touched: false }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private materialService: MaterialService,
    private lessonService: LessonService,
    private tostr: ToastService
  ) {}

  ngOnInit(): void {
    this.materialId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMaterial();
    this.fetchAllLessons();
  }

  fetchAllLessons(): void {
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

  loadMaterial(): void {
    this.materialService.getMaterialById(this.materialId).subscribe({
      next: (res) => {
        this.material = {
          file_name: res.file_name,
          file_url: res.file_url,
          lesson_id: res.lesson_id
        };
      },
      error: (err) => {
        console.error('Error loading material:', err.message);
      }
    });
  }

  filteredLessons(): ILesson[] {
    const search = this.lessonSearch.toLowerCase().trim();
    return this.lessons.filter(lesson =>
      lesson.title.toLowerCase().includes(search)
    );
  }
  
  // Field touch handlers
  onFieldTouched(field: 'file_name' | 'file_url' | 'lesson_id'): void {
    this.formErrors[field].touched = true;
    this.validateField(field);
  }
  
  // Field validation
  validateField(field: 'file_name' | 'file_url' | 'lesson_id'): void {
    const value = field === 'lesson_id' 
      ? this.material[field] 
      : this.material[field as 'file_name' | 'file_url'];
      
    if (field === 'file_name') {
      this.formErrors[field].required = !value;
      this.formErrors[field].minlength = value.length < 3;
    } else if (field === 'file_url') {
      this.formErrors[field].required = !value;
      this.formErrors[field].minlength = value.length < 8;
    } else if (field === 'lesson_id') {
      this.formErrors[field].required = !value;
    }
  }
  
  // Validate all fields
  validateForm(): boolean {
    // Mark all fields as touched
    this.formErrors.file_name.touched = true;
    this.formErrors.file_url.touched = true;
    this.formErrors.lesson_id.touched = true;
    
    // Validate each field
    this.validateField('file_name');
    this.validateField('file_url');
    this.validateField('lesson_id');
    
    // Check if there are any errors
    return !(
      this.formErrors.file_name.required || 
      this.formErrors.file_name.minlength || 
      this.formErrors.file_url.required || 
      this.formErrors.file_url.minlength || 
      this.formErrors.lesson_id.required
    );
  }

  onSubmit(): void {
    this.formSubmitted = true;
    
    if (!this.validateForm()) {
      this.tostr.error('Please correct the errors in the form');
      return;
    }

    this.materialService.updateMaterial(this.materialId, this.material).subscribe({
      next: () => {
        this.tostr.success('Material updated successfully');
        this.router.navigate(['admin/dashboard/materials-management']);
      },
      error: (err) => {
        console.error('Error updating material:', err.message);
        this.tostr.error('Error updating material');
      }
    });
  }
  
  navigateToMaterialsManagement(): void {
    this.router.navigate(['admin/dashboard/materials-management']);
  }
}