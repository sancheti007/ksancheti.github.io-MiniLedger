import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <span class="brand-icon">🏪</span>
        <span class="brand-text">{{ lang.t('shopLedger') }}</span>
        <span class="brand-sub">{{ lang.isHindi() ? 'प्रबंधन प्रणाली' : 'Management System' }}</span>
      </div>
      <div class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
          <span class="nav-icon">📊</span>{{ lang.t('dashboard') }}
        </a>
        <a routerLink="/customers" routerLinkActive="active" class="nav-link">
          <span class="nav-icon">👥</span>{{ lang.t('customers') }}
        </a>
        <a routerLink="/transactions" routerLinkActive="active" class="nav-link">
          <span class="nav-icon">💰</span>{{ lang.t('transactions') }}
        </a>
        <a routerLink="/raw-materials" routerLinkActive="active" class="nav-link">
          <span class="nav-icon">🌾</span>{{ lang.t('rawMaterials') }}
        </a>
      </div>
      <div class="nav-actions">
        <button class="lang-toggle" (click)="lang.toggle()">
          {{ lang.isHindi() ? '🇮🇳 हिंदी' : '🇬🇧 English' }}
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 0 2rem;
      height: 64px;
      background: var(--nav-bg);
      border-bottom: 2px solid var(--accent);
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-right: auto;
    }
    .brand-icon { font-size: 1.5rem; }
    .brand-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--accent);
      font-family: 'Noto Sans Devanagari', sans-serif;
    }
    .brand-sub {
      font-size: 0.7rem;
      color: var(--text-muted);
      font-style: italic;
    }
    .nav-links {
      display: flex;
      gap: 0.25rem;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
      font-family: 'Noto Sans Devanagari', sans-serif;
    }
    .nav-link:hover { background: var(--hover-bg); color: var(--text-primary); }
    .nav-link.active { background: var(--accent-light); color: var(--accent); font-weight: 600; }
    .nav-icon { font-size: 1rem; }
    .lang-toggle {
      padding: 0.4rem 0.9rem;
      border: 1.5px solid var(--accent);
      border-radius: 20px;
      background: transparent;
      color: var(--accent);
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .lang-toggle:hover { background: var(--accent); color: white; }
    @media(max-width: 768px) {
      .navbar { padding: 0 1rem; gap: 1rem; }
      .brand-sub { display: none; }
      .nav-link span.nav-icon { display: none; }
      .nav-link { padding: 0.4rem 0.6rem; font-size: 0.75rem; }
    }
  `]
})
export class NavbarComponent {
  lang = inject(LanguageService);
}
