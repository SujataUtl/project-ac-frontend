import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { apiError } from '../../core/auth.interceptor';

@Component({
  selector: 'app-account',
  imports: [FormsModule],
  template: `
    <div class="admin-page">
      <h1>Change password</h1>
      <p class="sub">Use at least 10 characters.</p>
      <form class="panel" style="max-width:480px;display:grid;gap:16px" (ngSubmit)="submit()">
        @if (error()) { <div class="alert alert-error">{{ error() }}</div> }
        @if (done()) { <div class="alert alert-success">Password updated.</div> }
        <div class="field"><label for="cur">Current password</label><input id="cur" name="cur" type="password" autocomplete="current-password" [(ngModel)]="current" /></div>
        <div class="field"><label for="new">New password</label><input id="new" name="new" type="password" autocomplete="new-password" [(ngModel)]="next" /></div>
        <div class="field"><label for="conf">Confirm new password</label><input id="conf" name="conf" type="password" autocomplete="new-password" [(ngModel)]="confirm" /></div>
        <div><button class="btn btn-primary" [disabled]="busy()">Update password</button></div>
      </form>
    </div>
  `,
})
export class AccountPage {
  private auth = inject(AuthService);
  protected current = '';
  protected next = '';
  protected confirm = '';
  protected busy = signal(false);
  protected error = signal('');
  protected done = signal(false);

  async submit() {
    this.done.set(false);
    if (this.next.length < 10) return this.error.set('New password must be at least 10 characters.');
    if (this.next !== this.confirm) return this.error.set('The new passwords do not match.');
    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.changePassword(this.current, this.next);
      this.current = this.next = this.confirm = '';
      this.done.set(true);
    } catch (e) {
      this.error.set(apiError(e));
    } finally {
      this.busy.set(false);
    }
  }
}
