import { Injectable, signal } from '@angular/core';
import { TRANSLATIONS } from '../models/models';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private _lang = signal<'en' | 'hi'>('en');
  lang = this._lang.asReadonly();

  toggle() {
    this._lang.set(this._lang() === 'en' ? 'hi' : 'en');
  }

  t(key: string): string {
    return TRANSLATIONS[key]?.[this._lang()] ?? key;
  }

  isHindi(): boolean {
    return this._lang() === 'hi';
  }
}
