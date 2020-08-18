import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetschartComponent } from './assets-chart.component';

describe('AssetschartComponent', () => {
  let component: AssetschartComponent;
  let fixture: ComponentFixture<AssetschartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetschartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetschartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
