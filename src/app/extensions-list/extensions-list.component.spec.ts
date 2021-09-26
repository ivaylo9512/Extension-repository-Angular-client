import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtensionsListComponent } from './extensions-list.component';

describe('ExtenionsListComponent', () => {
  let component: ExtensionsListComponent;
  let fixture: ComponentFixture<ExtensionsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtensionsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtensionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
