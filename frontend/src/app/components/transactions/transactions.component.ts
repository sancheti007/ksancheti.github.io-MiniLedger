import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { Transaction, Customer } from '../../models/models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">
            {{ lang.t('transactions') }}
            @if (customerFilter()) {
              <span class="filter-badge"> — {{ customerName() }}</span>
            }
          </h1>
          <p class="page-subtitle">{{ lang.isHindi() ? 'लेन-देन खाता' : 'Transaction Ledger' }}</p>
        </div>
        <div class="header-actions">
          <button class="btn-print" (click)="print()">🖨️ {{ lang.t('print') }}</button>
          <button class="btn-primary" (click)="openForm()">+ {{ lang.t('addTransaction') }}</button>
        </div>
      </div>

      <!-- Summary Strip -->
      @if (transactions().length > 0) {
        <div class="summary-strip">
          <div class="strip-item debit">
            <span>{{ lang.t('totalDebit') }}</span>
            <strong>₹{{ fmt(totalDebit()) }}</strong>
          </div>
          <div class="strip-item credit">
            <span>{{ lang.t('totalCredit') }}</span>
            <strong>₹{{ fmt(totalCredit()) }}</strong>
          </div>
          <div class="strip-item interest">
            <span>{{ lang.t('interest') }}</span>
            <strong>₹{{ fmt(totalInterest()) }}</strong>
          </div>
          <div class="strip-item balance" [class.neg]="netBalance() < 0">
            <span>{{ lang.t('balance') }}</span>
            <strong>₹{{ fmt(netBalance()) }}</strong>
          </div>
        </div>
      }

      <!-- Table -->
      <div class="card">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                @if (!customerFilter()) { <th>{{ lang.t('customerName') }}</th> }
                <th>{{ lang.t('date') }}</th>
                <th>{{ lang.t('itemDescription') }}</th>
                <th>{{ lang.t('debitAmount') }}</th>
                <th>{{ lang.t('creditAmount') }}</th>
                <th>{{ lang.t('interest') }}</th>
                <th>{{ lang.isHindi() ? 'शेष' : 'Balance' }}</th>
                <th>{{ lang.t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (t of transactions(); track t.transactionId; let i = $index) {
                <tr>
                  <td><span class="badge">{{ i + 1 }}</span></td>
                  @if (!customerFilter()) { <td><strong>{{ t.customerName }}</strong></td> }
                  <td class="date-cell">{{ t.transactionDate | date:'dd/MM/yyyy' }}</td>
                  <td class="desc-cell">{{ t.itemDescription || '—' }}</td>
                  <td class="amount debit">{{ t.debitAmount > 0 ? '₹' + fmt(t.debitAmount) : '—' }}</td>
                  <td class="amount credit">{{ t.creditAmount > 0 ? '₹' + fmt(t.creditAmount) : '—' }}</td>
                  <td class="amount interest">{{ t.interestAmount > 0 ? '₹' + fmt(t.interestAmount) : '—' }}</td>
                  <td class="amount" [class.negative]="t.runningBalance < 0" [class.positive]="t.runningBalance >= 0">
                    ₹{{ fmt(t.runningBalance) }}
                  </td>
                  <td>
                    <button class="btn-icon del" (click)="deleteTxn(t.transactionId)" title="{{ lang.t('delete') }}">🗑️</button>
                  </td>
                </tr>
              } @empty {
                <tr><td [attr.colspan]="customerFilter() ? 8 : 9" class="empty-cell">
                  {{ lang.isHindi() ? 'कोई लेन-देन नहीं मिला' : 'No transactions found' }}
                </td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Transaction Modal -->
      @if (showForm()) {
        <div class="modal-overlay" (click)="closeForm()">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ lang.t('addTransaction') }}</h2>
              <button class="modal-close" (click)="closeForm()">✕</button>
            </div>
            <form [formGroup]="form" (ngSubmit)="submitForm()" class="form-body">
              <div class="form-group">
                <label>{{ lang.t('customers') }} *</label>
                <select formControlName="customerId">
                  <option value="">{{ lang.isHindi() ? 'ग्राहक चुनें' : 'Select Customer' }}</option>
                  @for (c of customers(); track c.customerId) {
                    <option [value]="c.customerId">{{ c.customerName }} (C-{{ c.customerId }})</option>
                  }
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ lang.t('debitAmount') }}</label>
                  <input formControlName="debitAmount" type="number" step="0.01" min="0" placeholder="0.00"/>
                </div>
                <div class="form-group">
                  <label>{{ lang.t('creditAmount') }}</label>
                  <input formControlName="creditAmount" type="number" step="0.01" min="0" placeholder="0.00"/>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ lang.t('date') }} *</label>
                  <input formControlName="transactionDate" type="date"/>
                </div>
                <div class="form-group">
                  <label>{{ lang.isHindi() ? 'प्रकार' : 'Type' }}</label>
                  <select formControlName="transactionType">
                    <option value="GENERAL">General / सामान्य</option>
                    <option value="RAW_MATERIAL">Raw Material / कच्चा माल</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>{{ lang.t('itemDescription') }}</label>
                <input formControlName="itemDescription" type="text"
                  placeholder="{{ lang.isHindi() ? 'वस्तु का विवरण दर्ज करें' : 'Enter item description' }}"/>
              </div>
              @if (form.get('customerId')?.value) {
                <div class="interest-preview">
                  💡 {{ lang.isHindi() ? 'ब्याज स्वतः गणना होगा' : 'Interest will be auto-calculated' }}
                </div>
              }
              <div class="form-actions">
                <button type="button" class="btn-secondary" (click)="closeForm()">{{ lang.t('cancel') }}</button>
                <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
                  {{ saving() ? '...' : lang.t('save') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .page-title { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin: 0; font-family: 'Noto Sans Devanagari', sans-serif; }
    .filter-badge { font-size: 1rem; color: var(--accent); font-weight: 600; }
    .page-subtitle { color: var(--text-muted); margin: 0.25rem 0 0; font-family: 'Noto Sans Devanagari', sans-serif; }
    .header-actions { display: flex; gap: 0.75rem; align-items: center; }
    .btn-primary { padding: 0.6rem 1.5rem; background: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; }
    .btn-primary:hover:not(:disabled) { opacity: 0.85; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { padding: 0.6rem 1.5rem; background: transparent; color: var(--text-secondary); border: 1.5px solid var(--border); border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; }
    .btn-print { padding: 0.6rem 1.2rem; background: var(--success); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.875rem; }
    .summary-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .strip-item { background: var(--card-bg); border: 1.5px solid var(--border); border-radius: 10px; padding: 1rem 1.25rem; }
    .strip-item span { display: block; font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Noto Sans Devanagari', sans-serif; }
    .strip-item strong { font-size: 1.25rem; font-weight: 800; }
    .strip-item.debit strong { color: #ef4444; }
    .strip-item.credit strong { color: #22c55e; }
    .strip-item.interest strong { color: #f59e0b; }
    .strip-item.balance strong { color: #3b82f6; }
    .strip-item.neg strong { color: #ef4444; }
    .card { background: var(--card-bg); border: 1.5px solid var(--border); border-radius: 12px; overflow: hidden; }
    .table-wrapper { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th { text-align: left; padding: 0.875rem 1rem; border-bottom: 2px solid var(--border); color: var(--text-muted); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Noto Sans Devanagari', sans-serif; background: var(--bg-secondary); white-space: nowrap; }
    .data-table td { padding: 0.875rem 1rem; border-bottom: 1px solid var(--border); color: var(--text-primary); font-family: 'Noto Sans Devanagari', sans-serif; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: var(--hover-bg); }
    .badge { background: var(--accent-light); color: var(--accent); padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
    .amount { font-weight: 700; text-align: right; }
    .amount.debit { color: #ef4444; }
    .amount.credit { color: #22c55e; }
    .amount.interest { color: #f59e0b; }
    .amount.positive { color: #22c55e; }
    .amount.negative { color: #ef4444; }
    .date-cell { color: var(--text-muted); font-size: 0.8rem; white-space: nowrap; }
    .desc-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .empty-cell { text-align: center; color: var(--text-muted); padding: 3rem; font-family: 'Noto Sans Devanagari', sans-serif; }
    .btn-icon { padding: 0.3rem 0.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: transform 0.2s; }
    .btn-icon.del { background: #fee2e2; }
    .btn-icon:hover { transform: scale(1.1); }
    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-box { background: var(--card-bg); border-radius: 16px; width: 90%; max-width: 540px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideUp 0.2s ease; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1.5px solid var(--border); }
    .modal-header h2 { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0; font-family: 'Noto Sans Devanagari', sans-serif; }
    .modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted); }
    .form-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; font-family: 'Noto Sans Devanagari', sans-serif; }
    .form-group input, .form-group select { padding: 0.6rem 0.875rem; border: 1.5px solid var(--border); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); font-size: 0.9rem; font-family: 'Noto Sans Devanagari', sans-serif; outline: none; transition: border-color 0.2s; }
    .form-group input:focus, .form-group select:focus { border-color: var(--accent); }
    .interest-preview { background: #fef9c3; border: 1px solid #fcd34d; border-radius: 8px; padding: 0.6rem 0.875rem; font-size: 0.82rem; color: #92400e; font-family: 'Noto Sans Devanagari', sans-serif; }
    .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--border); }
    @media(max-width: 600px) { .summary-strip { grid-template-columns: 1fr 1fr; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class TransactionsComponent implements OnInit {
  lang = inject(LanguageService);
  api = inject(ApiService);
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);

  transactions = signal<Transaction[]>([]);
  customers = signal<Customer[]>([]);
  showForm = signal(false);
  saving = signal(false);
  customerFilter = signal<number | null>(null);
  customerName = signal('');

  form = this.fb.group({
    customerId: ['', Validators.required],
    debitAmount: [0],
    creditAmount: [0],
    itemDescription: [''],
    transactionDate: [new Date().toISOString().split('T')[0], Validators.required],
    transactionType: ['GENERAL']
  });

  totalDebit() { return this.transactions().reduce((s, t) => s + t.debitAmount, 0); }
  totalCredit() { return this.transactions().reduce((s, t) => s + t.creditAmount, 0); }
  totalInterest() { return this.transactions().reduce((s, t) => s + t.interestAmount, 0); }
  netBalance() { return this.totalDebit() - this.totalCredit(); }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.customerFilter.set(+id);
      this.api.getCustomer(+id).subscribe(res => this.customerName.set(res.data?.customerName || ''));
      this.api.getCustomerTransactions(+id).subscribe(res => this.transactions.set(res.data || []));
    } else {
      this.api.getTransactions().subscribe(res => this.transactions.set(res.data || []));
    }
    this.api.getCustomers().subscribe(res => this.customers.set(res.data || []));
  }

  openForm() {
    if (this.customerFilter()) this.form.patchValue({ customerId: this.customerFilter()!.toString() });
    this.showForm.set(true);
  }
  closeForm() { this.showForm.set(false); this.form.reset({ debitAmount: 0, creditAmount: 0, transactionDate: new Date().toISOString().split('T')[0], transactionType: 'GENERAL' }); }

  submitForm() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const v = this.form.value;
    const dto = { customerId: +v.customerId!, debitAmount: v.debitAmount || 0, creditAmount: v.creditAmount || 0, itemDescription: v.itemDescription || '', transactionDate: v.transactionDate!, transactionType: v.transactionType || 'GENERAL' };
    this.api.createTransaction(dto).subscribe({
      next: () => {
        this.closeForm();
        if (this.customerFilter()) {
          this.api.getCustomerTransactions(this.customerFilter()!).subscribe(res => this.transactions.set(res.data || []));
        } else {
          this.api.getTransactions().subscribe(res => this.transactions.set(res.data || []));
        }
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  deleteTxn(id: number) {
    if (!confirm(this.lang.isHindi() ? 'क्या आप इसे हटाना चाहते हैं?' : 'Delete this transaction?')) return;
    this.api.deleteTransaction(id).subscribe(() => {
      if (this.customerFilter()) {
        this.api.getCustomerTransactions(this.customerFilter()!).subscribe(res => this.transactions.set(res.data || []));
      } else {
        this.api.getTransactions().subscribe(res => this.transactions.set(res.data || []));
      }
    });
  }

  print() { window.print(); }
  fmt(n: number) { return (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
}
