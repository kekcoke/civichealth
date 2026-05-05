import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChButtonComponent } from '../../../../../libs/shared-ui/src/components/angular/ch-button.component';

/**
 * LoginComponent — Unified Login / Registration.
 * Wireframe: citizen_portal_screens.md #1
 * DESIGN.MD: text-input (surface-1 bg, 0px radius, bottom-rule focus), button-primary.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ChButtonComponent],
  template: `
    <div class="login-page">
      <div class="login-card">
        <h1 class="login-title">CIVIC HEALTH PORTAL</h1>

        <div class="form-group">
          <label class="form-label">Email Address / National ID</label>
          <input class="form-input" [(ngModel)]="email" type="text" placeholder="Email or National ID" />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-input" [(ngModel)]="password" type="password" placeholder="Password" />
        </div>

        <ch-button variant="primary" style="width:100%;margin-top:8px;" (clicked)="signIn()">
          SIGN IN (Identity Broker)
        </ch-button>

        <p class="login-register">
          New resident or patient?
          <a class="register-link">Register Here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-page { min-height:100vh; background:#f4f4f4; display:flex; align-items:center; justify-content:center; }
    .login-card { background:#ffffff; border:1px solid #e0e0e0; padding:48px; width:100%; max-width:480px; }
    .login-title { font-size:24px; font-weight:300; color:#161616; text-align:center; margin-bottom:32px; letter-spacing:0; line-height:1.33; }
    .form-group { margin-bottom:16px; display:flex; flex-direction:column; gap:4px; }
    .form-label { font-size:12px; color:#525252; letter-spacing:0.32px; }
    .form-input {
      background:#f4f4f4; border:none; border-bottom:1px solid #e0e0e0;
      padding:11px 16px; font-family:'IBM Plex Sans',sans-serif;
      font-size:16px; color:#161616; border-radius:0; width:100%; letter-spacing:0.16px;
    }
    .form-input:focus { outline:none; border-bottom:2px solid #0f62fe; }
    .login-register { font-size:14px; color:#525252; margin-top:24px; text-align:center; letter-spacing:0.16px; }
    .register-link { color:#0f62fe; cursor:pointer; margin-left:4px; }
    .register-link:hover { color:#0043ce; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  signIn(): void { console.log('Keycloak OIDC redirect:', this.email); }
}
