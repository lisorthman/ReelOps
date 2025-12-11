import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CastCrewList } from './cast-crew-list';

describe('CastCrewList', () => {
  let component: CastCrewList;
  let fixture: ComponentFixture<CastCrewList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CastCrewList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CastCrewList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
