import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Enquiry } from '../core/models';
import { SiteService } from '../core/site.service';

type Row = Record<string, any>;

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private http = inject(HttpClient);
  private site = inject(SiteService);

  /** After any content change, refresh the cached public content so "View site" shows it. */
  private async changed<T>(p: Promise<T>): Promise<T> {
    const r = await p;
    if (this.site.content()) this.site.load(true);
    return r;
  }

  stats() { return firstValueFrom(this.http.get<{ counts: Record<string, number>; enquiries: { total: number; unread: number } }>('/api/admin/stats')); }

  getSettings() { return firstValueFrom(this.http.get<Record<string, string>>('/api/admin/settings')); }
  saveSettings(s: Record<string, string>) { return this.changed(firstValueFrom(this.http.put('/api/admin/settings', s))); }

  list(type: string) { return firstValueFrom(this.http.get<Row[]>(`/api/admin/content/${type}`)); }
  get(type: string, id: number | string) { return firstValueFrom(this.http.get<Row>(`/api/admin/content/${type}/${id}`)); }
  create(type: string, data: Row) { return this.changed(firstValueFrom(this.http.post<Row>(`/api/admin/content/${type}`, data))); }
  update(type: string, id: number | string, data: Row) { return this.changed(firstValueFrom(this.http.put<Row>(`/api/admin/content/${type}/${id}`, data))); }
  remove(type: string, id: number | string) { return this.changed(firstValueFrom(this.http.delete(`/api/admin/content/${type}/${id}`))); }

  upload(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return firstValueFrom(this.http.post<{ url: string }>('/api/admin/upload', fd));
  }

  uploadVideo(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return firstValueFrom(this.http.post<{ url: string }>('/api/admin/upload-video', fd));
  }

  enquiries() { return firstValueFrom(this.http.get<Enquiry[]>('/api/admin/enquiries')); }
  setEnquiryStatus(id: number, status: Enquiry['status']) { return firstValueFrom(this.http.patch(`/api/admin/enquiries/${id}`, { status })); }
  deleteEnquiry(id: number) { return firstValueFrom(this.http.delete(`/api/admin/enquiries/${id}`)); }
}
