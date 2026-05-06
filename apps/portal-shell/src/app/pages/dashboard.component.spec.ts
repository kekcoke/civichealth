/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterTestingModule],
      providers: [provideHttpClient()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  describe('sessionStorage reads on ngOnInit', () => {
    it('reads kc_token and kc_identity from sessionStorage', () => {
      sessionStorage.setItem('kc_token', 'valid-token');
      sessionStorage.setItem('kc_identity', 'fid-123');

      component.ngOnInit();

      expect(component.jwt).toBe('valid-token');
      expect(component.federatedIdentity).toBe('fid-123');

      sessionStorage.clear();
    });

    it('leaves jwt and federatedIdentity null when sessionStorage is empty', () => {
      sessionStorage.clear();
      component.ngOnInit();
      expect(component.jwt).toBeNull();
      expect(component.federatedIdentity).toBeNull();
    });
  });

  describe('widget rendering', () => {
    it('without auth — placeholder shown for health-status-widget', () => {
      sessionStorage.clear();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Sign in to view your health status');
    });

    it('without auth — consent-settings component NOT rendered', () => {
      sessionStorage.clear();
      fixture.detectChanges();
      const consentEl = fixture.nativeElement.querySelector('app-consent-settings');
      expect(consentEl).toBeNull();
    });

    it('with valid auth — health-status-widget rendered with attributes', () => {
      sessionStorage.setItem('kc_token', 'valid-token');
      sessionStorage.setItem('kc_identity', 'fid-456');
      fixture.detectChanges();
      const widget = fixture.nativeElement.querySelector('health-status-widget');
      expect(widget).not.toBeNull();
      expect(widget.getAttribute('federated-identity')).toBe('fid-456');
    });

    it('with valid auth — consent-settings rendered with jwt input', () => {
      sessionStorage.setItem('kc_token', 'valid-token');
      sessionStorage.setItem('kc_identity', 'fid-456');
      fixture.detectChanges();
      const consent = fixture.nativeElement.querySelector('app-consent-settings');
      expect(consent).not.toBeNull();
    });
  });

  describe('quick links', () => {
    it('renders 6 quick-link cards', () => {
      fixture.detectChanges();
      const cards = fixture.nativeElement.querySelectorAll('.quicklink-card');
      expect(cards.length).toBe(6);
    });

    it('quick link hrefs match expected routes', () => {
      fixture.detectChanges();
      const links = Array.from(fixture.nativeElement.querySelectorAll('.quicklink-card')) as HTMLAnchorElement[];
      const expected = ['/taxes', '/permits', '/service-requests', '/appointments', '/emr', '/profile'];
      const actual = links.map(l => l.getAttribute('href'));
      expect(actual).toEqual(expected);
    });
  });
});
