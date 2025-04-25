import { Component, OnInit } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { StudentManagementService } from '../../../services/student-management.service';
import { IUserProfile } from '../../../Interfaces/IUserProfile';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.scss']
})
export class StudentDetailComponent implements OnInit {
  userId: number = 0;
  user: IUserProfile | null = null;
  loading = false;
  error: string | null = null;
  userForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentManagementService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: [''],
      email: [''],
      phone: [''],
      parentPhone: [''],
      role: [''],
      grade: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.userId = +params['id'];
        this.loadUserDetails();
      }
    });
  }

  loadUserDetails(): void {
    this.loading = true;
    this.studentService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.userForm.patchValue({
          name: user.first_name + ' ' + user.last_name,
          email: user.email,
          phone: user.phone_number,
          parentPhone: user.parent_phone,
          role: user.role,
          grade: user.grade,
          status: user.status
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }
  goBack(): void {
    this.router.navigate(['/admin/dashboard/student-management']);
  }
  changeStatus(): void {
    if (!this.user) return;
    
    const newStatus = this.user.status === 'active' ? 'inactive' : 'active';
    
    this.studentService.changeUserStatus(this.userId, newStatus as 'active' | 'inactive')
      .subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
        },
        error: (err) => {
          this.error = err.message || 'Error changing student status';
        }
      });
  }
}
