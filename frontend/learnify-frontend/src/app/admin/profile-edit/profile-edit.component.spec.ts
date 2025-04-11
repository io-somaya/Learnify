import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileEditComponent } from './profile-edit.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { of } from 'rxjs';

describe('ProfileEditComponent', () => {
  let component: ProfileEditComponent;
  let fixture: ComponentFixture<ProfileEditComponent>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ProfileService', ['getProfile', 'updateProfile']);
    
    await TestBed.configureTestingModule({
      imports: [
        ProfileEditComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ProfileService, useValue: spy }
      ]
    }).compileComponents();

    profileServiceSpy = TestBed.inject(ProfileService) as jasmine.SpyObj<ProfileService>;
    profileServiceSpy.getProfile.and.returnValue(of({
      status: 200,
      message: 'Profile fetched successfully',
      data: {
        id: 1,
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@example.com',
        phone_number: '1234567890',
        role: 'admin',
        status: 'active',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        email_verified_at: '2023-01-01',
        profile_picture: null,
        parent_phone: '',
        grade: ''
      }
    }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 