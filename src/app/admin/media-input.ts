import { Component, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApi } from './admin-api.service';
import { apiError } from '../core/auth.interceptor';
import { Video3d, parseVideo } from '../public/three-d';

/**
 * Upload (or paste a link to) an image or a video. Videos accept an uploaded MP4/WEBM/OGG file
 * or a YouTube / Vimeo URL. Emits `busy` while uploading so the parent can disable Save.
 */
@Component({
  selector: 'app-media-input',
  imports: [FormsModule, Video3d],
  template: `
    @if (kind() === 'video') {
      <input [id]="inputId()" [name]="inputId()" [ngModel]="value()" (ngModelChange)="value.set($event)"
             placeholder="https://youtube.com/watch?v=…  or upload a file below" />
    }
    <div class="btn-row" style="align-items:center;margin-top:8px">
      <input type="file" [attr.aria-label]="'Upload ' + kind()" [accept]="accept()" (change)="upload($event)" [id]="kind() === 'image' ? inputId() : null" />
      @if (uploading()) { <span>Uploading…</span> }
      @if (value()) { <button type="button" class="btn btn-sm btn-outline" (click)="value.set('')">Remove {{ kind() }}</button> }
    </div>
    @if (error()) { <div class="alert alert-error" style="margin:8px 0 0">{{ error() }}</div> }
    @if (value()) {
      @if (kind() === 'image') { <img class="img-preview" [src]="value()" alt="" /> }
      @else if (valid()) { <div class="video-preview"><app-video-3d [url]="value()" title="Preview" /></div> }
      @else { <span class="hint" style="color:var(--danger)">Not a recognised video link. Use YouTube, Vimeo, or an uploaded file.</span> }
    }
  `,
  styles: `
    :host { display: block; }
    .video-preview { max-width: 420px; margin-top: 12px; }
  `,
})
export class MediaInput {
  private api = inject(AdminApi);
  kind = input<'image' | 'video'>('image');
  inputId = input('');
  value = model<string | null | undefined>('');
  busy = output<boolean>();

  protected uploading = signal(false);
  protected error = signal('');

  protected accept() {
    return this.kind() === 'video' ? 'video/mp4,video/webm,video/ogg' : 'image/png,image/jpeg,image/webp,image/gif';
  }
  protected valid() { return !!parseVideo(this.value()); }

  async upload(ev: Event) {
    const el = ev.target as HTMLInputElement;
    const file = el.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.busy.emit(true);
    this.error.set('');
    try {
      const { url } = this.kind() === 'video' ? await this.api.uploadVideo(file) : await this.api.upload(file);
      this.value.set(url);
    } catch (e) {
      this.error.set(apiError(e, 'Upload failed'));
    } finally {
      this.uploading.set(false);
      this.busy.emit(false);
      el.value = '';
    }
  }
}
