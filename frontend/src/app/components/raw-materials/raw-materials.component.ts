import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { RawMaterial, Customer, MATERIAL_TYPES, MATERIAL_UNITS } from '../../models/models';

@Component({
  selector: 'app-raw-materials',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">🌾 {{ lang.t('rawMaterials') }}</h1>
          <p class="page-subtitle">{{ lang.isHindi() ? 'कच्चा माल प्रबंधन' : 'Raw Material Stock Management' }}</p>
        </div>
        <button class="btn-primary" (click)="openForm()">+ {{ lang.t('addRawMaterial') }}</button>
      </div>

      <!-- Filter by Customer -->
      <div class="filter-bar">
        <select [(ngModel)]="filterCustomerId" (change)="applyFilter()" class="filter-select">
          <option value="">{{ lang.isHindi() ? 'सभी ग्राहक' : 'All Customers' }}</option>
          @for (c of customers(); track c.customerId) {
            <option [value]="c.customerId">{{ c.customerName }}</option>
          }
        </select>
        <select [(ngModel)]="filterMaterial" (change)="applyFilter()" class="filter-select">
          <option value="">{{ lang.isHindi() ? 'सभी सामग्री' : 'All Materials' }}</option>
          @for (m of materialTypes; track m) {
            <option [value]="m">{{ getMaterialLabel(m) }}</option>
          }
        </select>
      </div>

      <!-- Summary Cards -->
      <div class="mat-summary">
        @for (ms of materialSummary(); track ms.type) {
          <div class="mat-card">
            <div class="mat-icon">{{ getMatIcon(ms.type) }}</div>
            <div class="mat-info">
              <div class="mat-name">{{ getMaterialLabel(ms.type) }}</div>
              <div class="mat-nums">
                <span class="debit">{{ lang.isHindi() ? 'जारी: ' : 'Out: ' }}{{ ms.totalOut }} KG</span>
                <span class="credit">{{ lang.isHindi() ? 'वापसी: ' : 'In: ' }}{{ ms.totalIn }} KG</span>
                <span class="net">{{ lang.isHindi() ? 'शेष: ' : 'Net: ' }}{{ ms.net }} KG</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Table -->
      <div class="card">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{{ lang.t('customerName') }}</th>
                <th>{{ lang.t('date') }}</th>
                <th>{{ lang.t('materialType') }}</th>
                <th>{{ lang.t('debitQty') }}</th>
                <th>{{ lang.t('creditQty') }}</th>
                <th>{{ lang.isHindi() ? 'इकाई मूल्य' : 'Unit Price' }}</th>
                <th>{{ lang.isHindi() ? 'नामे राशि' : 'Debit Amt' }}</th>
                <th>{{ lang.isHindi() ? 'जमा राशि' : 'Credit Amt' }}</th>
                <th>{{ lang.isHindi() ? 'शेष' : 'Net' }}</th>
                <th>{{ lang.isHindi() ? 'टिप्पणी' : 'Remarks' }}</th>
                <th>{{ lang.t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (r of filteredMaterials(); track r.rawMaterialId; let i = $index) {
                <tr>
                  <td><span class="badge">{{ i+1 }}</span></td>
                  <td><strong>{{ r.customerName }}</strong><br/><small class="cid">C-{{ r.customerId }}</small></td>
                  <td class="date-cell">{{ r.entryDate | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <span class="mat-badge" [class]="r.materialType">
                      {{ getMatIcon(r.materialType) }} {{ getMaterialLabel(r.materialType) }}
                    </span>
                  </td>
                  <td class="amount debit">{{ r.debitQuantity > 0 ? r.debitQuantity + ' ' + r.unit : '—' }}</td>
                  <td class="amount credit">{{ r.creditQuantity > 0 ? r.creditQuantity + ' ' + r.unit : '—' }}</td>
                  <td class="amount">₹{{ fmt(r.unitPrice) }}</td>
                  <td class="amount debit">{{ r.debitAmount > 0 ? '₹' + fmt(r.debitAmount) : '—' }}</td>
                  <td class="amount credit">{{ r.creditAmount > 0 ? '₹' + fmt(r.creditAmount) : '—' }}</td>
                  <td class="amount" [class.negative]="r.netAmount < 0">₹{{ fmt(r.netAmount) }}</td>
                  <td class="remarks-cell">{{ r.remarks || '—' }}</td>
                  <td>
                    <button class="btn-icon del" (click)="deleteEntry(r.rawMaterialId)">🗑️</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="12" class="empty-cell">
                  {{ lang.isHindi() ? 'कोई प्रविष्टि नहीं मिली' : 'No entries found' }}
                </td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal -->
      @if (showForm()) {
        <div class="modal-overlay" (click)="closeForm()">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ lang.t('addRawMaterial') }}</h2>
              <button class="modal-close" (click)="closeForm()">✕</button>
            </div>
            <form [formGroup]="form" (ngSubmit)="submitForm()" class="form-body">
              <div class="form-row">
                <div class="form-group">
                  <label>{{ lang.t('customers') }} *</label>
                  <select formControlName="customerId">
                    <option value="">{{ lang.isHindi() ? 'ग्राहक चुनें' : 'Select Customer' }}</option>
                    @for (c of customers(); track c.customerId) {
                      <option [value]="c.customerId">{{ c.customerName }}</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ lang.t('materialType') }} *</label>
                  <select formControlName="materialType">
                    <option value="">{{ lang.isHindi() ? 'सामग्री चुनें' : 'Select Material' }}</option>
                    @for (m of materialTypes; track m) {
                      <option [value]="m">{{ getMaterialLabel(m) }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ lang.t('debitQty') }}</label>
                  <input formControlName="debitQuantity" type="number" step="0.1" min="0" placeholder="0"/>
                </div>
                <div class="form-group">
                  <label>{{ lang.t('creditQty') }}</label>
                  <input formControlName="creditQuantity" type="number" step="0.1" min="0" placeholder="0"/>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ lang.t('unitPrice') }} (₹)</label>
                  <input formControlName="unitPrice" type="number" step="0.01" min="0" placeholder="0.00"/>
                </div>
                <div class="form-group">
                  <label>{{ lang.isHindi() ? 'इकाई' : 'Unit' }}</label>
                  <select formControlName="unit">
                    @for (u of units; track u) { <option [value]="u">{{ u }}</option> }
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ lang.t('date') }} *</label>
                  <input formControlName="entryDate" type="date"/>
                </div>
              </div>
              <div class="form-group">
                <label>{{ lang.t('remarks') }}</label>
                <input formControlName="remarks" type="text" placeholder="{{ lang.isHindi() ? 'टिप्पणी दर्ज करें' : 'Enter remarks' }}"/>
              </div>
              <!-- Live Amount Preview -->
              @if (previewAmount() > 0) {
                <div class="preview-box">
                  {{ lang.isHindi() ? 'अनुमानित राशि' : 'Estimated Amount' }}:
                  <strong>₹{{ fmt(previewAmount()) }}</strong>
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
    .page-subtitle { color: var(--text-muted); margin: 0.25rem 0 0; font-family: 'Noto Sans Devanagari', sans-serif; }
    .btn-primary { padding: 0.6rem 1.5rem; background: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; }
    .btn-primary:hover:not(:disabled) { opacity: 0.85; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { padding: 0.6rem 1.5rem; background: transparent; color: var(--text-secondary); border: 1.5px solid var(--border); border-radius: 8px; cursor: pointer; font-weight: 600; }
    .filter-bar { display: flex; gap: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .filter-select { padding: 0.5rem 0.875rem; border: 1.5px solid var(--border); border-radius: 8px; background: var(--card-bg); color: var(--text-primary); font-size: 0.875rem; font-family: 'Noto Sans Devanagari', sans-serif; outline: none; cursor: pointer; }
    .mat-summary { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .mat-card { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: var(--card-bg); border: 1.5px solid var(--border); border-radius: 12px; }
    .mat-icon { font-size: 2rem; }
    .mat-name { font-weight: 700; color: var(--text-primary); font-family: 'Noto Sans Devanagari', sans-serif; margin-bottom: 0.25rem; }
    .mat-nums { display: flex; flex-direction: column; gap: 0.1rem; }
    .mat-nums span { font-size: 0.75rem; }
    .mat-nums .debit { color: #ef4444; }
    .mat-nums .credit { color: #22c55e; }
    .mat-nums .net { color: var(--accent); font-weight: 600; }
    .card { background: var(--card-bg); border: 1.5px solid var(--border); border-radius: 12px; overflow: hidden; }
    .table-wrapper { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th { text-align: left; padding: 0.875rem 1rem; border-bottom: 2px solid var(--border); color: var(--text-muted); font-weight: 600; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Noto Sans Devanagari', sans-serif; background: var(--bg-secondary); white-space: nowrap; }
    .data-table td { padding: 0.875rem 1rem; border-bottom: 1px solid var(--border); color: var(--text-primary); font-family: 'Noto Sans Devanagari', sans-serif; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: var(--hover-bg); }
    .badge { background: var(--accent-light); color: var(--accent); padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
    .cid { color: var(--text-muted); font-size: 0.72rem; }
    .mat-badge { padding: 0.25rem 0.7rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .mat-badge.wheat { background: #fef3c7; color: #d97706; }
    .mat-badge.joa { background: #d1fae5; color: #059669; }
    .mat-badge.jawar { background: #ede9fe; color: #7c3aed; }
    .mat-badge.seeds { background: #fce7f3; color: #be185d; }
    .amount { font-weight: 600; text-align: right; }
    .amount.debit { color: #ef4444; }
    .amount.credit { color: #22c55e; }
    .amount.negative { color: #ef4444; }
    .date-cell { color: var(--text-muted); font-size: 0.8rem; white-space: nowrap; }
    .remarks-cell { color: var(--text-muted); font-size: 0.8rem; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .empty-cell { text-align: center; color: var(--text-muted); padding: 3rem; font-family: 'Noto Sans Devanagari', sans-serif; }
    .btn-icon { padding: 0.3rem 0.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: transform 0.2s; }
    .btn-icon.del { background: #fee2e2; }
    .btn-icon:hover { transform: scale(1.1); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-box { background: var(--card-bg); border-radius: 16px; width: 90%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideUp 0.2s ease; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1.5px solid var(--border); position: sticky; top: 0; background: var(--card-bg); z-index: 1; }
    .modal-header h2 { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0; font-family: 'Noto Sans Devanagari', sans-serif; }
    .modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted); }
    .form-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; font-family: 'Noto Sans Devanagari', sans-serif; }
    .form-group input, .form-group select { padding: 0.6rem 0.875rem; border: 1.5px solid var(--border); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); font-size: 0.9rem; font-family: 'Noto Sans Devanagari', sans-serif; outline: none; transition: border-color 0.2s; }
    .form-group input:focus, .form-group select:focus { border-color: var(--accent); }
    .preview-box { background: #d1fae5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 0.6rem 0.875rem; font-size: 0.875rem; color: #065f46; font-family: 'Noto Sans Devanagari', sans-serif; }
    .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--border); }
    @media(max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class RawMaterialsComponent implements OnInit {
  lang = inject(LanguageService);
  api = inject(ApiService);
  fb = inject(FormBuilder);

  materials = signal<RawMaterial[]>([]);
  customers = signal<Customer[]>([]);
  showForm = signal(false);
  saving = signal(false);
  filterCustomerId = '';
  filterMaterial = '';
  materialTypes = MATERIAL_TYPES;
  units = MATERIAL_UNITS;

  form = this.fb.group({
    customerId: ['', Validators.required],
    materialType: ['', Validators.required],
    debitQuantity: [0],
    creditQuantity: [0],
    unitPrice: [0],
    unit: ['KG'],
    remarks: [''],
    entryDate: [new Date().toISOString().split('T')[0], Validators.required]
  });

  previewAmount() {
    const dq = +(this.form.value.debitQuantity || 0);
    const cq = +(this.form.value.creditQuantity || 0);
    const up = +(this.form.value.unitPrice || 0);
    return (dq - cq) * up;
  }

  filteredMaterials() {
    return this.materials().filter(m =>
      (!this.filterCustomerId || m.customerId === +this.filterCustomerId) &&
      (!this.filterMaterial || m.materialType === this.filterMaterial)
    );
  }

  materialSummary() {
    const map: any = {};
    this.materials().forEach(m => {
      if (!map[m.materialType]) map[m.materialType] = { type: m.materialType, totalOut: 0, totalIn: 0, net: 0 };
      map[m.materialType].totalOut += m.debitQuantity;
      map[m.materialType].totalIn += m.creditQuantity;
      map[m.materialType].net += m.netQuantity;
    });
    return Object.values(map) as any[];
  }

  ngOnInit() {
    this.api.getRawMaterials().subscribe(res => this.materials.set(res.data || []));
    this.api.getCustomers().subscribe(res => this.customers.set(res.data || []));
  }

  applyFilter() {}

  openForm() { this.showForm.set(true); }
  closeForm() { this.showForm.set(false); this.form.reset({ debitQuantity: 0, creditQuantity: 0, unitPrice: 0, unit: 'KG', entryDate: new Date().toISOString().split('T')[0] }); }

  submitForm() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const v = this.form.value;
    const dto = { customerId: +v.customerId!, materialType: v.materialType!, debitQuantity: v.debitQuantity || 0, creditQuantity: v.creditQuantity || 0, unitPrice: v.unitPrice || 0, unit: v.unit || 'KG', remarks: v.remarks || '', entryDate: v.entryDate! };
    this.api.createRawMaterial(dto).subscribe({
      next: () => { this.closeForm(); this.api.getRawMaterials().subscribe(res => this.materials.set(res.data || [])); this.saving.set(false); },
      error: () => this.saving.set(false)
    });
  }

  deleteEntry(id: number) {
    if (!confirm(this.lang.isHindi() ? 'क्या आप इसे हटाना चाहते हैं?' : 'Delete this entry?')) return;
    this.api.deleteRawMaterial(id).subscribe(() => this.api.getRawMaterials().subscribe(res => this.materials.set(res.data || [])));
  }

  getMaterialLabel(type: string) {
    const map: any = { wheat: this.lang.t('wheat'), joa: this.lang.t('joa'), jawar: this.lang.t('jawar'), seeds: this.lang.t('seeds') };
    return map[type] || type;
  }
  getMatIcon(type: string) {
    const icons: any = { wheat: '🌾', joa: '🌿', jawar: '🌱', seeds: '🌰' };
    return icons[type] || '📦';
  }
  fmt(n: number) { return (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
}
