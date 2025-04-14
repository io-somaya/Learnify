import { Component, OnInit } from '@angular/core';
import { MaterialService } from '../../services/material.service';
import { LessonService } from '../../services/lessons.service';
import { Router } from '@angular/router';
import { IMaterial } from '../../Interfaces/IMaterial';
import { ILesson } from '../../Interfaces/ILesson';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-materials-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './materials-management.component.html',
  styleUrls: ['./materials-management.component.css']
})
export class MaterialsManagementComponent implements OnInit {
  materials: IMaterial[] = [];
  originalMaterials: IMaterial[] = []; // Store original materials for filtering
  lessons: ILesson[] = [];
  lessonSearch: string = '';
  fileNameSearch: string = '';
  loading = false;
  errorMessage: string | null = null;
  currentPage = 1;
  totalPages = 1;
  
  // For debounced search
  private searchDebounce = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private materialService: MaterialService,
    private lessonService: LessonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Set up debounced search
    this.searchDebounce.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.performFilter();
    });
    
    this.loadLessons();
    this.loadMaterials();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLessons(page: number = 1): void {
    this.loading = true;
    
    this.lessonService.getManagedLessons(page).subscribe({
      next: (response) => {
        // Add the new lessons to our collection
        this.lessons = [...this.lessons, ...response.data.data];
        this.totalPages = response.data.last_page;
        this.currentPage++;

        if (this.currentPage <= this.totalPages) {
          this.loadLessons(this.currentPage);
        } else {
          // Once we've loaded all lessons, trigger a refresh of the materials
          // to ensure they have the proper lesson names
          if (this.materials.length > 0) {
            this.enrichMaterialsWithLessonNames();
          }
        }
        
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load lessons. Please try again.';
        this.loading = false;
        console.error('Error loading lessons', error);
      }
    });
  }

  loadMaterials(): void {
    this.loading = true;
    this.errorMessage = null;

    this.materialService.getAllMaterials().subscribe({
      next: (materials) => {
        this.originalMaterials = materials; // Store original
        this.materials = [...materials];
        this.loading = false;
        
        // Enrich materials with lesson names if lessons are already loaded
        if (this.lessons.length > 0) {
          this.enrichMaterialsWithLessonNames();
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load materials. Please try again.';
        this.loading = false;
        console.error('Error loading materials', error);
      }
    });
  }
  
  // Add lesson_name property to materials for easier filtering
  enrichMaterialsWithLessonNames(): void {
    this.originalMaterials = this.originalMaterials.map(material => {
      const lesson = this.lessons.find(l => l.id === material.lesson_id);
      return {
        ...material,
        lesson_name: lesson ? lesson.title : 'Unknown Lesson'
      };
    });
    
    // Also update current materials list
    this.materials = [...this.originalMaterials];
    
    // If there are active filters, apply them
    if (this.lessonSearch || this.fileNameSearch) {
      this.performFilter();
    }
  }

  filterMaterials(): void {
    // Trigger the debounced search
    this.searchDebounce.next();
  }
  
  performFilter(): void {
    this.loading = true;
    
    if (!this.lessonSearch && !this.fileNameSearch) {
      // If both search inputs are cleared, reset to original materials
      this.materials = [...this.originalMaterials];
    } else {
      // Filter materials based on the search inputs
      this.materials = this.originalMaterials.filter(material => {
        // Handle possible undefined lesson_name
        const lessonName = material.lesson_name || this.getLessonTitle(material.lesson_id);
        
        const matchesLessonTitle = this.lessonSearch ? 
          lessonName.toLowerCase().includes(this.lessonSearch.toLowerCase()) : true;
          
        const matchesFileName = this.fileNameSearch ? 
          material.file_name.toLowerCase().includes(this.fileNameSearch.toLowerCase()) : true;
        
        return matchesLessonTitle && matchesFileName;
      });
    }
    
    this.loading = false;
  }
  
  getLessonTitle(lessonId: number): string {
    const lesson = this.lessons.find(l => l.id === lessonId);
    return lesson ? lesson.title : 'Unknown Lesson';
  }

  confirmDelete(materialId: number): void {
    if (confirm('Are you sure you want to delete this material?')) {
      this.deleteMaterial(materialId);
    }
  }

  deleteMaterial(materialId: number): void {
    this.loading = true;
    this.errorMessage = null;

    this.materialService.deleteMaterial(materialId).subscribe({
      next: () => {
        // Update both original and filtered materials arrays
        this.originalMaterials = this.originalMaterials.filter(m => m.id !== materialId);
        this.materials = this.materials.filter(m => m.id !== materialId);
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to delete material. Please try again.';
        this.loading = false;
        console.error('Error deleting material:', error);
      }
    });
  }

  navigateToEdit(materialId: number): void {
    this.router.navigate(['/admin/dashboard/materials/edit', materialId]);
  }

  navigateToCreate(): void {
    this.router.navigate(['/admin/dashboard/materials/add']);
  }
}