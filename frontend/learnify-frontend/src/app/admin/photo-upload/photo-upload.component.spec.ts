import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoUploadComponent } from './photo-upload.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProfileService } from '../../services/profile.service';
import { of } from 'rxjs';

describe('PhotoUploadComponent', () => {
  let component: PhotoUploadComponent;
  let fixture: ComponentFixture<PhotoUploadComponent>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ProfileService', ['updatePhoto']);
    
    await TestBed.configureTestingModule({
      imports: [
        PhotoUploadComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: ProfileService, useValue: spy }
      ]
    }).compileComponents();

    profileServiceSpy = TestBed.inject(ProfileService) as jasmine.SpyObj<ProfileService>;
    profileServiceSpy.updatePhoto.and.returnValue(of({ photo_url: 'http://example.com/photo.jpg' }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 