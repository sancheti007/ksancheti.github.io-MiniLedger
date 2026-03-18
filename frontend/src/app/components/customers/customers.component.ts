import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { Customer } from '../../models/models';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ lang.t('customers') }}</h1>
          <p class="page-subtitle">{{ lang.isHindi() ? 'ग्राहक रजिस्टर प्रबंधन' : 'Customer Register Management' }}</p>
        </div>
        <button class="btn-primary" (click)="openForm()">+ {{ lang.t('addCustomer') }}</button>
      </div>

      <!-- Search Bar -->
      <div class="search-bar">
        <input type="text" [(ngModel)]="searchTerm" placeholder="{{ lang.isHindi() ? 'नाम या मोबाइल से खोजें...' : 'Search by name or mobile...' }}" class="search-input"/>
      </div>

      <!-- Customer Table -->
      <div class="card">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ lang.t('customerId') }}</th>
                <th>{{ lang.t('customerName') }}</th>
                <th>{{ lang.t('mobileNumber') }}</th>
                <th>{{ lang.t('interestRate') }}</th>
                <th>{{ lang.t('totalDebit') }}</th>
                <th>{{ lang.t('totalCredit') }}</th>
                <th>{{ lang.t('balance') }}</th>
                <th>{{ lang.t('date') }}</th>
                <th>{{ lang.t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (c of filteredCustomers(); track c.customerId) {
                <tr>
                  <td><span class="badge">C-{{ c.customerId }}</span></td>
                  <td><strong class="customer-name">{{ c.customerName }}</strong></td>
                  <td>📱 {{ c.mobileNumber }}</td>
                  <td><span class="rate-badge">{{ c.interestRate }}%</span></td>
                  <td class="amount debit">₹{{ fmt(c.totalDebit) }}</td>
                  <td class="amount credit">₹{{ fmt(c.totalCredit) }}</td>
                  <td class="amount" [class.negative]="c.balance < 0" [class.positive]="c.balance >= 0">
                    ₹{{ fmt(c.balance) }}
                  </td>
                  <td class="date-cell">{{ c.createdDate | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <div class="action-btns">
                      <a [routerLink]="['/customers', c.customerId, 'transactions']" class="btn-icon view" title="{{ lang.isHindi() ? 'लेन-देन' : 'Transactions' }}">📋</a>
                      <button class="btn-icon edit" (click)="openEdit(c)" title="{{ lang.t('edit') }}">✏️</button>
                      <button class="btn-icon del" (click)="deleteCustomer(c.customerId)" title="{{ lang.t('delete') }}">🗑️</button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="9" class="empty-cell">{{ lang.isHindi() ? 'कोई ग्राहक नहीं मिला' : 'No customers found' }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Form -->
      @if (showForm()) {
        <div class="modal-overlay" (click)="closeForm()">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editId() ? lang.t('edit') : lang.t('addCustomer') }}</h2>
              <button class="modal-close" (click)="closeForm()">✕</button>
            </div>
            <form [formGroup]="form" (ngSubmit)="submitForm()" class="form-body">
              <div class="form-row">
                <div class="form-group">
                  <label>{{ lang.t('customerName') }} *</label>
                  <input formControlName="customerName" type="text"
                    placeholder="{{ lang.isHindi() ? 'ग्राहक का नाम दर्ज करें' : 'Enter customer name' }}"
                    [class.invalid]="form.get('customerName')?.invalid && form.get('customerName')?.touched"/>
                  @if (form.get('customerName')?.invalid && form.get('customerName')?.touched) {
                    <span class="error">{{ lang.isHindi() ? 'नाम आवश्यक है' : 'Name is required' }}</span>
                  }
                </div>
                <div class="form-group">
                  <label>{{ lang.t('mobileNumber') }}</label>
                  <input formControlName="mobileNumber" type="tel"
                    placeholder="{{ lang.isHindi() ? 'मोबाइल नंबर' : 'Mobile number' }}"/>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ lang.t('interestRate') }} *</label>
                  <input formControlName="interestRate" type="number" step="0.1" min="0" max="100"
                    placeholder="e.g. 2.0"/>
                  <small class="help-text">{{ lang.isHindi() ? 'प्रति लेन-देन ब्याज दर' : 'Interest rate per transaction' }}</small>
                </div>
              </div>
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
    .page-subtitle { color: var(--text-muted); margin: 0.25rem 0 0; font-family: 'Noto Sans Devanagari', sans-serif; }
    .btn-primary { padding: 0.6rem 1.5rem; background: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; }
    .btn-primary:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { padding: 0.6rem 1.5rem; background: transparent; color: var(--text-secondary); border: 1.5px solid var(--border); border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; }
    .btn-secondary:hover { background: var(--hover-bg); }
    .search-bar { margin-bottom: 1rem; }
    .search-input { width: 100%; max-width: 400px; padding: 0.6rem 1rem; border: 1.5px solid var(--border); border-radius: 8px; background: var(--card-bg); color: var(--text-primary); font-size: 0.9rem; font-family: 'Noto Sans Devanagari', sans-serif; outline: none; transition: border-color 0.2s; }
    .search-input:focus { border-color: var(--accent); }
    .card { background: var(--card-bg); border: 1.5px solid var(--border); border-radius: 12px; overflow: hidden; }
    .table-wrapper { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th { text-align: left; padding: 0.875rem 1rem; border-bottom: 2px solid var(--border); color: var(--text-muted); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Noto Sans Devanagari', sans-serif; white-space: nowrap; background: var(--bg-secondary); }
    .data-table td { padding: 0.875rem 1rem; border-bottom: 1px solid var(--border); color: var(--text-primary); font-family: 'Noto Sans Devanagari', sans-serif; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: var(--hover-bg); }
    .badge { background: var(--accent-light); color: var(--accent); padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
    .rate-badge { background: #fef3c7; color: #d97706; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
    .customer-name { color: var(--text-primary); }
    .amount { font-weight: 700; text-align: right; }
    .amount.debit { color: #ef4444; }
    .amount.credit { color: #22c55e; }
    .amount.positive { color: #22c55e; }
    .amount.negative { color: #ef4444; }
    .date-cell { color: var(--text-muted); font-size: 0.8rem; white-space: nowrap; }
    .action-btns { display: flex; gap: 0.4rem; }
    .btn-icon { padding: 0.3rem 0.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; text-decoration: none; display: inline-block; }
    .btn-icon.view { background: #dbeafe; }
    .btn-icon.edit { background: #fef9c3; }
    .btn-icon.del { background: #fee2e2; }
    .btn-icon:hover { transform: scale(1.1); }
    .empty-cell { text-align: center; color: var(--text-muted); padding: 3rem; font-family: 'Noto Sans Devanagari', sans-serif; }
    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-box { background: var(--card-bg); border-radius: 16px; padding: 0; width: 90%; max-width: 520px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideUp 0.2s ease; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1.5px solid var(--border); }
    .modal-header h2 { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0; font-family: 'Noto Sans Devanagari', sans-serif; }
    .modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted); padding: 0.2rem 0.4rem; border-radius: 4px; }
    .modal-close:hover { background: var(--hover-bg); }
    .form-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; font-family: 'Noto Sans Devanagari', sans-serif; }
    .form-group input, .form-group select { padding: 0.6rem 0.875rem; border: 1.5px solid var(--border); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); font-size: 0.9rem; font-family: 'Noto Sans Devanagari', sans-serif; outline: none; transition: border-color 0.2s; }
    .form-group input:focus, .form-group select:focus { border-color: var(--accent); }
    .form-group input.invalid { border-color: #ef4444; }
    .error { font-size: 0.75rem; color: #ef4444; font-family: 'Noto Sans Devanagari', sans-serif; }
    .help-text { font-size: 0.72rem; color: var(--text-muted); font-family: 'Noto Sans Devanagari', sans-serif; }
    .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--border); }
    @media(max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class CustomersComponent implements OnInit {
  lang = inject(LanguageService);
  api = inject(ApiService);
  fb = inject(FormBuilder);

  customers = signal<Customer[]>([]);
  showForm = signal(false);
  editId = signal<number | null>(null);
  saving = signal(false);
  searchTerm = '';

  form = this.fb.group({
    customerName: ['', [Validators.required, Validators.minLength(2)]],
    mobileNumber: [''],
    interestRate: [2.0, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  filteredCustomers() {
    const term = this.searchTerm.toLowerCase();
    return this.customers().filter(c =>
      c.customerName.toLowerCase().includes(term) || c.mobileNumber.includes(term)
    );
  }

  ngOnInit() { this.loadCustomers(); }

  loadCustomers() {
    this.api.getCustomers().subscribe(res => this.customers.set(res.data || []));
  }

  openForm() {
    this.editId.set(null);
    this.form.reset({ customerName: '', mobileNumber: '', interestRate: 2.0 });
    this.showForm.set(true);
  }

  openEdit(c: Customer) {
    this.editId.set(c.customerId);
    this.form.patchValue({ customerName: c.customerName, mobileNumber: c.mobileNumber, interestRate: c.interestRate });
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); this.form.reset(); }

  submitForm() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const dto = this.form.value as any;
    const obs = this.editId()
      ? this.api.updateCustomer(this.editId()!, dto)
      : this.api.createCustomer(dto);
    obs.subscribe({
      next: () => { this.closeForm(); this.loadCustomers(); this.saving.set(false); },
      error: () => this.saving.set(false)
    });
  }

  deleteCustomer(id: number) {
    if (!confirm(this.lang.isHindi() ? 'क्या आप इस ग्राहक को हटाना चाहते हैं?' : 'Delete this customer?')) return;
    this.api.deleteCustomer(id).subscribe(() => this.loadCustomers());
  }

  fmt(n: number): string {
    return (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
