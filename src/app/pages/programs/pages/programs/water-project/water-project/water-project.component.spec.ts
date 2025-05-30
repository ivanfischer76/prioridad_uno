import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterProjectComponent } from './water-project.component';

describe('WaterProjectComponent', () => {
  let component: WaterProjectComponent;
  let fixture: ComponentFixture<WaterProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterProjectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaterProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
