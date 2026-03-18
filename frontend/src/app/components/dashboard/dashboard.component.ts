import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { DashboardSummary } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="dashboard-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ lang.t('dashboard') }}</h1>
          <p class="page-subtitle">{{ lang.isHindi() ? 'खाता बही का सारांश' : 'Ledger Overview & Summary' }}</p>
        </div>
        <div class="header-actions">
          <div class="period-tabs">
            <button [class.active]="selectedPeriod() === 'monthly'" (click)="setPeriod('monthly')">{{ lang.t('monthly') }}</button>
            <button [class.active]="selectedPeriod() === 'halfyearly'" (click)="setPeriod('halfyearly')">{{ lang.t('halfYearly') }}</button>
            <button [class.active]="selectedPeriod() === 'yearly'" (click)="setPeriod('yearly')">{{ lang.t('yearly') }}</button>
          </div>
          <button class="btn-print" (click)="printStatement()">🖨️ {{ lang.t('print') }}</button>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>{{ lang.isHindi() ? 'लोड हो रहा है...' : 'Loading...' }}</p>
        </div>
      }

      @if (summary() && !loading()) {
        <!-- KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card debit">
            <div class="kpi-icon">📤</div>
            <div class="kpi-body">
              <div class="kpi-label">{{ lang.t('totalDebit') }}</div>
              <div class="kpi-value">₹{{ formatNum(summary()!.totalDebit) }}</div>
            </div>
          </div>
          <div class="kpi-card credit">
            <div class="kpi-icon">📥</div>
            <div class="kpi-body">
              <div class="kpi-label">{{ lang.t('totalCredit') }}</div>
              <div class="kpi-value">₹{{ formatNum(summary()!.totalCredit) }}</div>
            </div>
          </div>
          <div class="kpi-card interest">
            <div class="kpi-icon">📈</div>
            <div class="kpi-body">
              <div class="kpi-label">{{ lang.t('interest') }}</div>
              <div class="kpi-value">₹{{ formatNum(summary()!.totalInterest) }}</div>
            </div>
          </div>
          <div class="kpi-card balance" [class.negative]="summary()!.netBalance < 0">
            <div class="kpi-icon">⚖️</div>
            <div class="kpi-body">
              <div class="kpi-label">{{ lang.t('netBalance') }}</div>
              <div class="kpi-value">₹{{ formatNum(summary()!.netBalance) }}</div>
            </div>
          </div>
          <div class="kpi-card customers">
            <div class="kpi-icon">👥</div>
            <div class="kpi-body">
              <div class="kpi-label">{{ lang.t('totalCustomers') }}</div>
              <div class="kpi-value">{{ summary()!.totalCustomers }}</div>
            </div>
          </div>
          <div class="kpi-card txns">
            <div class="kpi-icon">📋</div>
            <div class="kpi-body">
              <div class="kpi-label">{{ lang.t('totalTransactions') }}</div>
              <div class="kpi-value">{{ summary()!.totalTransactions }}</div>
            </div>
          </div>
        </div>

        <!-- Monthly Breakdown -->
        @if (summary()!.monthlyBreakdown.length > 0) {
          <div class="section-card">
            <h2 class="section-title">📅 {{ lang.isHindi() ? 'मासिक विवरण' : 'Monthly Breakdown' }}</h2>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>{{ lang.isHindi() ? 'माह' : 'Month' }}</th>
                    <th>{{ lang.t('totalDebit') }}</th>
                    <th>{{ lang.t('totalCredit') }}</th>
                    <th>{{ lang.t('interest') }}</th>
                    <th>{{ lang.t('balance') }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of summary()!.monthlyBreakdown; track m.month) {
                    <tr>
                      <td><strong>{{ m.month }} {{ m.year }}</strong></td>
                      <td class="amount debit">₹{{ formatNum(m.debit) }}</td>
                      <td class="amount credit">₹{{ formatNum(m.credit) }}</td>
                      <td class="amount interest">₹{{ formatNum(m.interest) }}</td>
                      <td class="amount" [class.negative]="(m.debit - m.credit) < 0">
                        ₹{{ formatNum(m.debit - m.credit) }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Customer Summaries -->
        <div class="section-card">
          <h2 class="section-title">👥 {{ lang.isHindi() ? 'ग्राहक सारांश' : 'Customer Summary' }}</h2>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ lang.t('customerId') }}</th>
                  <th>{{ lang.t('customerName') }}</th>
                  <th>{{ lang.t('mobileNumber') }}</th>
                  <th>{{ lang.t('totalDebit') }}</th>
                  <th>{{ lang.t('totalCredit') }}</th>
                  <th>{{ lang.t('interest') }}</th>
                  <th>{{ lang.t('balance') }}</th>
                  <th>{{ lang.t('actions') }}</th>
                </tr>
              </thead>
              <tbody>
                @for (c of summary()!.customerSummaries; track c.customerId) {
                  <tr>
                    <td><span class="badge">C-{{ c.customerId }}</span></td>
                    <td><strong>{{ c.customerName }}</strong></td>
                    <td>{{ c.mobileNumber }}</td>
                    <td class="amount debit">₹{{ formatNum(c.totalDebit) }}</td>
                    <td class="amount credit">₹{{ formatNum(c.totalCredit) }}</td>
                    <td class="amount interest">₹{{ formatNum(c.interestAccrued) }}</td>
                    <td class="amount" [class.negative]="c.balance < 0">₹{{ formatNum(c.balance) }}</td>
                    <td>
                      <a [routerLink]="['/customers', c.customerId, 'transactions']" class="btn-sm">
                        {{ lang.isHindi() ? 'देखें' : 'View' }}
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Raw Material Summaries -->
        @if (summary()!.rawMaterialSummaries.length > 0) {
          <div class="section-card">
            <h2 class="section-title">🌾 {{ lang.isHindi() ? 'कच्चा माल सारांश' : 'Raw Material Summary' }}</h2>
            <div class="rm-grid">
              @for (rm of summary()!.rawMaterialSummaries; track rm.materialType) {
                <div class="rm-card">
                  <div class="rm-type">{{ getMaterialLabel(rm.materialType) }}</div>
                  <div class="rm-stats">
                    <div class="rm-stat">
                      <span>{{ lang.isHindi() ? 'जारी' : 'Issued' }}</span>
                      <strong>{{ rm.totalDebitQty }} KG</strong>
                    </div>
                    <div class="rm-stat">
                      <span>{{ lang.isHindi() ? 'वापसी' : 'Returned' }}</span>
                      <strong>{{ rm.totalCreditQty }} KG</strong>
                    </div>
                    <div class="rm-stat highlight">
                      <span>{{ lang.isHindi() ? 'शेष' : 'Net' }}</span>
                      <strong>{{ rm.netQuantity }} KG</strong>
                    </div>
                    <div class="rm-stat amount-stat">
                      <span>{{ lang.isHindi() ? 'राशि' : 'Amount' }}</span>
                      <strong>₹{{ formatNum(rm.netAmount) }}</strong>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .dashboard-page { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .page-title { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin: 0; font-family: 'Noto Sans Devanagari', sans-serif; }
    .page-subtitle { color: var(--text-muted); margin: 0.25rem 0 0; font-family: 'Noto Sans Devanagari', sans-serif; }
    .header-actions { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
    .period-tabs { display: flex; border: 1.5px solid var(--border); border-radius: 10px; overflow: hidden; }
    .period-tabs button { padding: 0.5rem 1.2rem; border: none; background: transparent; cursor: pointer; color: var(--text-secondary); font-size: 0.875rem; font-weight: 500; transition: all 0.2s; font-family: 'Noto Sans Devanagari', sans-serif; }
    .period-tabs button.active { background: var(--accent); color: white; }
    .btn-print { padding: 0.5rem 1.2rem; background: var(--success); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.875rem; transition: opacity 0.2s; }
    .btn-print:hover { opacity: 0.85; }
    .loading-state { text-align: center; padding: 4rem; color: var(--text-muted); }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .kpi-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; border-radius: 12px; border: 1.5px solid var(--border); background: var(--card-bg); transition: transform 0.2s, box-shadow 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .kpi-card.debit { border-left: 4px solid #ef4444; }
    .kpi-card.credit { border-left: 4px solid #22c55e; }
    .kpi-card.interest { border-left: 4px solid #f59e0b; }
    .kpi-card.balance { border-left: 4px solid #3b82f6; }
    .kpi-card.customers { border-left: 4px solid #8b5cf6; }
    .kpi-card.txns { border-left: 4px solid #06b6d4; }
    .kpi-card.negative { border-left-color: #ef4444; }
    .kpi-icon { font-size: 2rem; }
    .kpi-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Noto Sans Devanagari', sans-serif; }
    .kpi-value { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
    .section-card { background: var(--card-bg); border: 1.5px solid var(--border); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
    .section-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0 0 1rem; font-family: 'Noto Sans Devanagari', sans-serif; }
    .table-wrapper { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th { text-align: left; padding: 0.75rem 1rem; border-bottom: 2px solid var(--border); color: var(--text-muted); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Noto Sans Devanagari', sans-serif; white-space: nowrap; }
    .data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); color: var(--text-primary); font-family: 'Noto Sans Devanagari', sans-serif; }
    .data-table tr:hover td { background: var(--hover-bg); }
    .amount { font-weight: 600; text-align: right; }
    .amount.debit { color: #ef4444; }
    .amount.credit { color: #22c55e; }
    .amount.interest { color: #f59e0b; }
    .amount.negative { color: #ef4444; }
    .badge { background: var(--accent-light); color: var(--accent); padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
    .btn-sm { padding: 0.3rem 0.8rem; background: var(--accent); color: white; border-radius: 6px; text-decoration: none; font-size: 0.75rem; font-weight: 600; transition: opacity 0.2s; }
    .btn-sm:hover { opacity: 0.85; }
    .rm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .rm-card { border: 1.5px solid var(--border); border-radius: 10px; padding: 1rem; background: var(--bg-secondary); }
    .rm-type { font-size: 1rem; font-weight: 700; color: var(--accent); text-transform: capitalize; margin-bottom: 0.75rem; font-family: 'Noto Sans Devanagari', sans-serif; }
    .rm-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
    .rm-stat { display: flex; flex-direction: column; }
    .rm-stat span { font-size: 0.7rem; color: var(--text-muted); font-family: 'Noto Sans Devanagari', sans-serif; }
    .rm-stat strong { font-size: 0.9rem; color: var(--text-primary); }
    .rm-stat.highlight strong { color: var(--accent); }
    .rm-stat.amount-stat strong { color: #22c55e; }
  `]
})
export class DashboardComponent implements OnInit {
  lang = inject(LanguageService);
  api = inject(ApiService);

  summary = signal<DashboardSummary | null>(null);
  loading = signal(false);
  selectedPeriod = signal('monthly');

  ngOnInit() { this.loadSummary(); }

  setPeriod(p: string) {
    this.selectedPeriod.set(p);
    this.loadSummary();
  }

  loadSummary() {
    this.loading.set(true);
    this.api.getDashboard(this.selectedPeriod()).subscribe({
      next: res => { this.summary.set(res.data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  formatNum(n: number): string {
    return (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getMaterialLabel(type: string): string {
    const map: any = { wheat: this.lang.t('wheat'), joa: this.lang.t('joa'), jawar: this.lang.t('jawar'), seeds: this.lang.t('seeds') };
    return map[type] || type;
  }

  printStatement() {
    window.print();
  }
}
