import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConsentSettingsComponent } from './consent-settings.component';

const HA_BFF_URL = (window as any).__HA_BFF_URL__ || 'https://ha-proxy.internal/api/ha/v1/graphql';

describe('ConsentSettingsComponent', () => {
  let fixture: ComponentFixture<ConsentSettingsComponent>;
  let component: ConsentSettingsComponent;
  let httpMock: HttpTestingController;

  const FID = 'fid-test-123';
  const JWT = 'header.eyJzdWIiOiJ1MSIsImV4cCI6OTk5OTk5OTk5OTl9.sig';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsentSettingsComponent],
      imports: [HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentSettingsComponent);
    component = fixture.componentInstance;
    component.federatedIdentity = FID;
    component.jwt = JWT;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('ngOnInit', () => {
    it('calls loadConsent when federatedIdentity and jwt are present', () => {
      component.ngOnInit();
      // Should have fired one POST request (the loadConsent query)
      const req = httpMock.expectOne({ method: 'POST' });
      req.flush({ data: { getPatientRecord: { consentDirectives: [] } } });
      expect(req.request.body).toBeTruthy();
    });
  });

  describe('loadConsent', () => {
    it('parses GraphQL response and sets consent state', () => {
      component.ngOnInit();

      const req = httpMock.match({ method: 'POST' });
      // Respond to the load query
      req[0].flush({
        data: {
          getPatientRecord: {
            consentDirectives: [
              { directiveType: 'SHARE_ALL_CLINICS', isActive: true },
              { directiveType: 'RESTRICT_TO_PCP', isActive: false },
              { directiveType: 'RESEARCH_OPT_IN', isActive: true },
            ],
          },
        },
      });

      expect(component.consent.shareAllClinics).toBe(true);
      expect(component.consent.restrictToPcp).toBe(false);
      expect(component.consent.researchOptIn).toBe(true);
    });
  });

  describe('onScopeChange', () => {
    it('onScopeChange(true) sets shareAllClinics=true, restrictToPcp=false', () => {
      component.onScopeChange(true);
      expect(component.consent.shareAllClinics).toBe(true);
      expect(component.consent.restrictToPcp).toBe(false);
    });

    it('onScopeChange(false) sets shareAllClinics=false, restrictToPcp=true', () => {
      component.onScopeChange(false);
      expect(component.consent.shareAllClinics).toBe(false);
      expect(component.consent.restrictToPcp).toBe(true);
    });
  });

  describe('save', () => {
    it('sets saving=true during request', () => {
      component.ngOnInit();
      component.save();

      expect(component.saving).toBe(true);
    });

    it('sets saveSuccess=true on GraphQL success', () => {
      component.ngOnInit();
      component.save();

      const req = httpMock.match({ method: 'POST' })[0];
      req.flush({ data: { updateConsentDirectives: { success: true, errors: [] } } });

      expect(component.saveSuccess).toBe(true);
      expect(component.saving).toBe(false);
    });

    it('sets saveError on GraphQL error payload', () => {
      component.ngOnInit();
      component.save();

      const req = httpMock.match({ method: 'POST' })[0];
      req.flush({ data: { updateConsentDirectives: { success: false, errors: ['Server error'] } } });

      expect(component.saveError).toContain('Server error');
      expect(component.saving).toBe(false);
    });

    it('sets saveError on network error', () => {
      component.ngOnInit();
      component.save();

      const req = httpMock.match({ method: 'POST' })[0];
      req.error(new ProgressEvent('error'), { status: 0, statusText: '' });

      expect(component.saveError).toBeTruthy();
      expect(component.saving).toBe(false);
    });

    it('calls mutation with correct directives array', () => {
      component.consent.shareAllClinics = true;
      component.consent.restrictToPcp = false;
      component.consent.researchOptIn = false;

      component.save();

      const req = httpMock.match({ method: 'POST' })[0];
      const body = req.request.body;
      expect(body.variables.directives).toEqual(
        jasmine.arrayContaining([
          jasmine.objectContaining({ directiveType: 'SHARE_ALL_CLINICS', isActive: true }),
          jasmine.objectContaining({ directiveType: 'RESTRICT_TO_PCP', isActive: false }),
          jasmine.objectContaining({ directiveType: 'RESEARCH_OPT_IN', isActive: false }),
        ])
      );
    });
  });
});
