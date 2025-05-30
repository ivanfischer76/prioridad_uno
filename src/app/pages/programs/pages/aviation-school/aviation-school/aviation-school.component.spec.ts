import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AviationSchoolComponent } from './aviation-school.component';

describe('AviationSchoolComponent', () => {
  let component: AviationSchoolComponent;
  let fixture: ComponentFixture<AviationSchoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AviationSchoolComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AviationSchoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
