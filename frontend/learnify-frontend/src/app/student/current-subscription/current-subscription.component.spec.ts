import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentSubscriptionComponent } from './current-subscription.component';

describe('CurrentSubscriptionComponent', () => {
  let component: CurrentSubscriptionComponent;
  let fixture: ComponentFixture<CurrentSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentSubscriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
