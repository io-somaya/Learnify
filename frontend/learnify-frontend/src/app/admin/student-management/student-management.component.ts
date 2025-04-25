import { Component, OnInit } from '@angular/core';
import { StudentManagementService } from '../../services/student-management.service';
import { IUserProfile } from '../../Interfaces/IUserProfile';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-student-management',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './student-management.component.html',
  styleUrl: './student-management.component.css',
  providers: [StudentManagementService]
})
export class StudentManagementComponent implements OnInit {
  users: IUserProfile[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 1;
  totalItems = 0;
  itemsPerPage = 15;
  totalPages = 0;

  filterForm: FormGroup;

  constructor(
    private studentService: StudentManagementService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      grade: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();

    this.filterForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadUsers();
      });
  }

  loadUsers(): void {
    this.loading = true;
    const { search, status, grade } = this.filterForm.value;

    this.studentService.getUsers(
      this.currentPage,
      search,
      status,
      grade,
      this.itemsPerPage
    ).subscribe({
      next: (response) => {
        this.users = response.data;
        this.totalItems = response.total;
        this.totalPages = response.lastPage;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  viewUserDetails(userId: number): void {
    this.router.navigate(['/admin/dashboard/student-management/', userId]);
  }

  changeUserStatus(user: IUserProfile): void {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';

    this.studentService.changeUserStatus(user.id, newStatus as 'active' | 'inactive')
      .subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
        },
        error: (err) => {
          this.error = err.message;
        }
      });
  }

  changeUserRole(userId: number, role: 'student' | 'assistant' ): void {
    this.studentService.changeUserRole(userId, role)
      .subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
        },
        error: (err) => {
          this.error = err.message;
        }
      });
  }

  changeUserGrade(userId: number, grade: '1' | '2' | '3' |null ) : void {
    this.studentService.changeUserGrade(userId, grade)
      .subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
        },
        error: (err) => {
          this.error = err.message;
        }
      });
  }
  // Add this method to your component class
  getPaginationArray(): number[] {
    const paginationArray: number[] = [];
    const maxVisiblePages = 5;
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        paginationArray.push(i);
      }
    } else {
      let startPage: number;
      let endPage: number;

      if (this.currentPage <= Math.ceil(maxVisiblePages / 2)) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (this.currentPage + Math.floor(maxVisiblePages / 2) >= this.totalPages) {
        startPage = this.totalPages - maxVisiblePages + 1;
        endPage = this.totalPages;
      } else {
        startPage = this.currentPage - Math.floor(maxVisiblePages / 2);
        endPage = this.currentPage + Math.floor(maxVisiblePages / 2);
      }

      for (let i = startPage; i <= endPage; i++) {
        paginationArray.push(i);
      }
    }

    return paginationArray;
  }

  get Math() {
    return Math;
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.studentService.deleteUser(userId)
        .subscribe({
          next: () => {
            this.users = this.users.filter(user => user.id !== userId);
            this.totalItems--;
          },
          error: (err) => {
            this.error = err.message;
          }
        });
    }
  }
}