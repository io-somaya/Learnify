import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ToastService } from '../services/toast.service'; // Import ToastService

import { ToastComponent } from './toast.component';

@Component({
  selector: 'app-test-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class TestToastComponent {
  constructor(public toastService: ToastService) { }
}
describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
