import { TestBed } from '@angular/core/testing';

import { CastCrew } from './cast-crew';

describe('CastCrew', () => {
  let service: CastCrew;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CastCrew);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
