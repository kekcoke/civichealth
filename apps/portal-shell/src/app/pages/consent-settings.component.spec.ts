import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ConsentSettingsComponent } from './consent-settings.component';

describe('ConsentSettingsComponent', () => {
  let fixture: ComponentFixture<ConsentSettingsComponent>;
  let component: ConsentSettingsComponent;

  const FID = 'fid-test-123';
  const JWT = 'header.eyJzdWIiOiJ1MSIsImV4cCI6OTk5OTk5OTk5OTl9.sig';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsentSettingsComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentSettingsComponent);
    component = fixture.componentInstance;
    component.federatedIdentity = FID;
    component.jwt = JWT;
  });

  describe('initialization', () => {
    it('creates component successfully', () => {
      expect(component).toBeTruthy();
    });

    it('initializes consent state', () => {
      expect(component.consent).toBeDefined();
      expect(typeof component.consent.shareAllClinics).toBe('boolean');
      expect(typeof component.consent.restrictToPcp).toBe('boolean');
      expect(typeof component.consent.researchOptIn).toBe('boolean');
    });

    it('initializes saving state to false', () => {
      expect(component.saving).toBe(false);
    });

    it('initializes saveSuccess to false', () => {
      expect(component.saveSuccess).toBe(false);
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

  describe('save method', () => {
    it('sets saving=true during save operation', () => {
      component.save();
      expect(component.saving).toBe(true);
    });

    it('can set saveSuccess state', () => {
      component.saveSuccess = true;
      expect(component.saveSuccess).toBe(true);
    });

    it('can set saveError state', () => {
      component.saveError = 'Test error';
      expect(component.saveError).toContain('Test error');
    });
  });

  describe('consent directive mapping', () => {
    it('maps SHARE_ALL_CLINICS to shareAllClinics', () => {
      component.consent.shareAllClinics = true;
      expect(component.consent.shareAllClinics).toBe(true);
    });

    it('maps RESTRICT_TO_PCP to restrictToPcp', () => {
      component.consent.restrictToPcp = true;
      expect(component.consent.restrictToPcp).toBe(true);
    });

    it('maps RESEARCH_OPT_IN to researchOptIn', () => {
      component.consent.researchOptIn = true;
      expect(component.consent.researchOptIn).toBe(true);
    });
  });
});
