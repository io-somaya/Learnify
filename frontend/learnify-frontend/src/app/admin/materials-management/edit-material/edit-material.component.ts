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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private materialService: MaterialService,
    private lessonService: LessonService,
    private tostr : ToastService
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

  onSubmit(): void {
    if (!this.material.lesson_id || !this.material.file_name || !this.material.file_url) {
      console.log('All fields required');
      return;
    }

    this.materialService.updateMaterial(this.materialId, this.material).subscribe({
      next: () => {
        console.log('Material updated successfully');
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
