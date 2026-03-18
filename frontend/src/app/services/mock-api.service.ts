import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  ApiResponse, Customer, Transaction, RawMaterial, DashboardSummary
} from '../models/models';

// Mock data for GitHub Pages demo (no backend required)
const MOCK_CUSTOMERS: Customer[] = [
  { customerId: 1, customerName: 'Ramesh Kumar / रमेश कुमार', mobileNumber: '9876543210', interestRate: 2.0, createdDate: '2024-01-15', isActive: true, totalDebit: 45000, totalCredit: 30000, balance: 15000 },
  { customerId: 2, customerName: 'Suresh Sharma / सुरेश शर्मा', mobileNumber: '9812345678', interestRate: 1.5, createdDate: '2024-02-01', isActive: true, totalDebit: 28000, totalCredit: 25000, balance: 3000 },
  { customerId: 3, customerName: 'Mohan Lal / मोहन लाल', mobileNumber: '9898765432', interestRate: 2.5, createdDate: '2024-03-10', isActive: true, totalDebit: 62000, totalCredit: 40000, balance: 22000 },
  { customerId: 4, customerName: 'Raju Patel / राजू पटेल', mobileNumber: '9765432100', interestRate: 2.0, createdDate: '2024-04-05', isActive: true, totalDebit: 15000, totalCredit: 15000, balance: 0 },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { transactionId: 1, customerId: 1, customerName: 'Ramesh Kumar', debitAmount: 10000, creditAmount: 0, interestAmount: 200, itemDescription: 'Wheat purchase / गेहूँ खरीद', transactionDate: '2024-11-01', transactionType: 'GENERAL', runningBalance: 10000 },
  { transactionId: 2, customerId: 1, customerName: 'Ramesh Kumar', debitAmount: 15000, creditAmount: 0, interestAmount: 300, itemDescription: 'Seeds supply / बीज आपूर्ति', transactionDate: '2024-11-15', transactionType: 'GENERAL', runningBalance: 25000 },
  { transactionId: 3, customerId: 1, customerName: 'Ramesh Kumar', debitAmount: 0, creditAmount: 10000, interestAmount: 0, itemDescription: 'Cash payment / नकद भुगतान', transactionDate: '2024-12-01', transactionType: 'GENERAL', runningBalance: 15000 },
  { transactionId: 4, customerId: 2, customerName: 'Suresh Sharma', debitAmount: 20000, creditAmount: 0, interestAmount: 300, itemDescription: 'Jawar supply / ज्वार आपूर्ति', transactionDate: '2024-11-20', transactionType: 'GENERAL', runningBalance: 20000 },
  { transactionId: 5, customerId: 2, customerName: 'Suresh Sharma', debitAmount: 0, creditAmount: 17000, interestAmount: 0, itemDescription: 'Partial payment / आंशिक भुगतान', transactionDate: '2024-12-10', transactionType: 'GENERAL', runningBalance: 3000 },
  { transactionId: 6, customerId: 3, customerName: 'Mohan Lal', debitAmount: 30000, creditAmount: 0, interestAmount: 750, itemDescription: 'Bulk wheat order / थोक गेहूँ आदेश', transactionDate: '2024-12-01', transactionType: 'RAW_MATERIAL', runningBalance: 30000 },
];

const MOCK_RAW_MATERIALS: RawMaterial[] = [
  { rawMaterialId: 1, customerId: 1, customerName: 'Ramesh Kumar', materialType: 'wheat', debitQuantity: 500, creditQuantity: 0, unitPrice: 25, debitAmount: 12500, creditAmount: 0, unit: 'KG', remarks: 'Good quality', entryDate: '2024-11-01', netQuantity: 500, netAmount: 12500 },
  { rawMaterialId: 2, customerId: 1, customerName: 'Ramesh Kumar', materialType: 'wheat', debitQuantity: 0, creditQuantity: 100, unitPrice: 25, debitAmount: 0, creditAmount: 2500, unit: 'KG', remarks: 'Returned damaged', entryDate: '2024-11-15', netQuantity: -100, netAmount: -2500 },
  { rawMaterialId: 3, customerId: 2, customerName: 'Suresh Sharma', materialType: 'joa', debitQuantity: 300, creditQuantity: 0, unitPrice: 22, debitAmount: 6600, creditAmount: 0, unit: 'KG', remarks: 'Fresh stock', entryDate: '2024-11-20', netQuantity: 300, netAmount: 6600 },
  { rawMaterialId: 4, customerId: 3, customerName: 'Mohan Lal', materialType: 'jawar', debitQuantity: 800, creditQuantity: 0, unitPrice: 20, debitAmount: 16000, creditAmount: 0, unit: 'KG', remarks: '', entryDate: '2024-12-01', netQuantity: 800, netAmount: 16000 },
  { rawMaterialId: 5, customerId: 4, customerName: 'Raju Patel', materialType: 'seeds', debitQuantity: 50, creditQuantity: 0, unitPrice: 120, debitAmount: 6000, creditAmount: 0, unit: 'KG', remarks: 'Premium seeds', entryDate: '2024-12-05', netQuantity: 50, netAmount: 6000 },
];

@Injectable({ providedIn: 'root' })
export class MockApiService {
  private customers: Customer[] = [...MOCK_CUSTOMERS];
  private transactions: Transaction[] = [...MOCK_TRANSACTIONS];
  private rawMaterials: RawMaterial[] = [...MOCK_RAW_MATERIALS];
  private nextCId = 5; private nextTId = 7; private nextRId = 6;

  getCustomers(): Observable<ApiResponse<Customer[]>> {
    return of({ success: true, message: '', data: this.customers.filter(c => c.isActive), errors: [] }).pipe(delay(200));
  }
  getCustomer(id: number): Observable<ApiResponse<Customer>> {
    const c = this.customers.find(x => x.customerId === id)!;
    return of({ success: true, message: '', data: c, errors: [] }).pipe(delay(100));
  }
  createCustomer(dto: any): Observable<ApiResponse<Customer>> {
    const c: Customer = { ...dto, customerId: this.nextCId++, createdDate: new Date().toISOString(), isActive: true, totalDebit: 0, totalCredit: 0, balance: 0 };
    this.customers.push(c);
    return of({ success: true, message: 'Created', data: c, errors: [] }).pipe(delay(300));
  }
  updateCustomer(id: number, dto: any): Observable<ApiResponse<Customer>> {
    const idx = this.customers.findIndex(c => c.customerId === id);
    if (idx >= 0) this.customers[idx] = { ...this.customers[idx], ...dto };
    return of({ success: true, message: 'Updated', data: this.customers[idx], errors: [] }).pipe(delay(300));
  }
  deleteCustomer(id: number): Observable<ApiResponse<boolean>> {
    const idx = this.customers.findIndex(c => c.customerId === id);
    if (idx >= 0) this.customers[idx].isActive = false;
    return of({ success: true, message: 'Deleted', data: true, errors: [] }).pipe(delay(200));
  }
  getCustomerTransactions(id: number): Observable<ApiResponse<Transaction[]>> {
    const txns = this.transactions.filter(t => t.customerId === id);
    let bal = 0;
    const mapped = txns.map(t => ({ ...t, runningBalance: (bal += t.debitAmount - t.creditAmount) }));
    return of({ success: true, message: '', data: mapped, errors: [] }).pipe(delay(200));
  }
  getTransactions(): Observable<ApiResponse<Transaction[]>> {
    return of({ success: true, message: '', data: this.transactions, errors: [] }).pipe(delay(200));
  }
  createTransaction(dto: any): Observable<ApiResponse<Transaction>> {
    const cust = this.customers.find(c => c.customerId === dto.customerId);
    const interest = dto.debitAmount > 0 ? +(dto.debitAmount * (cust?.interestRate || 2) / 100).toFixed(2) : 0;
    const t: Transaction = { ...dto, transactionId: this.nextTId++, customerName: cust?.customerName || '', interestAmount: interest, runningBalance: 0 };
    this.transactions.push(t);
    return of({ success: true, message: 'Created', data: t, errors: [] }).pipe(delay(300));
  }
  deleteTransaction(id: number): Observable<ApiResponse<boolean>> {
    this.transactions = this.transactions.filter(t => t.transactionId !== id);
    return of({ success: true, message: 'Deleted', data: true, errors: [] }).pipe(delay(200));
  }
  getRawMaterials(customerId?: number): Observable<ApiResponse<RawMaterial[]>> {
    const data = customerId ? this.rawMaterials.filter(r => r.customerId === customerId) : this.rawMaterials;
    return of({ success: true, message: '', data, errors: [] }).pipe(delay(200));
  }
  createRawMaterial(dto: any): Observable<ApiResponse<RawMaterial>> {
    const cust = this.customers.find(c => c.customerId === dto.customerId);
    const r: RawMaterial = { ...dto, rawMaterialId: this.nextRId++, customerName: cust?.customerName || '', debitAmount: dto.debitQuantity * dto.unitPrice, creditAmount: dto.creditQuantity * dto.unitPrice, netQuantity: dto.debitQuantity - dto.creditQuantity, netAmount: (dto.debitQuantity - dto.creditQuantity) * dto.unitPrice };
    this.rawMaterials.push(r);
    return of({ success: true, message: 'Created', data: r, errors: [] }).pipe(delay(300));
  }
  deleteRawMaterial(id: number): Observable<ApiResponse<boolean>> {
    this.rawMaterials = this.rawMaterials.filter(r => r.rawMaterialId !== id);
    return of({ success: true, message: 'Deleted', data: true, errors: [] }).pipe(delay(200));
  }
  getDashboard(period: string): Observable<ApiResponse<DashboardSummary>> {
    const summary: DashboardSummary = {
      period, totalDebit: 150000, totalCredit: 110000, totalInterest: 1550, netBalance: 40000,
      totalCustomers: this.customers.filter(c => c.isActive).length,
      totalTransactions: this.transactions.length,
      customerSummaries: this.customers.filter(c => c.isActive).map(c => ({
        customerId: c.customerId, customerName: c.customerName, mobileNumber: c.mobileNumber,
        totalDebit: c.totalDebit, totalCredit: c.totalCredit, interestAccrued: +(c.totalDebit * (c.interestRate / 100)).toFixed(2), balance: c.balance
      })),
      monthlyBreakdown: [
        { month: 'October', year: 2024, debit: 45000, credit: 30000, interest: 450 },
        { month: 'November', year: 2024, debit: 62000, credit: 48000, interest: 620 },
        { month: 'December', year: 2024, debit: 43000, credit: 32000, interest: 430 },
      ],
      rawMaterialSummaries: [
        { materialType: 'wheat', totalDebitQty: 500, totalCreditQty: 100, netQuantity: 400, totalDebitAmount: 12500, totalCreditAmount: 2500, netAmount: 10000 },
        { materialType: 'joa', totalDebitQty: 300, totalCreditQty: 0, netQuantity: 300, totalDebitAmount: 6600, totalCreditAmount: 0, netAmount: 6600 },
        { materialType: 'jawar', totalDebitQty: 800, totalCreditQty: 0, netQuantity: 800, totalDebitAmount: 16000, totalCreditAmount: 0, netAmount: 16000 },
        { materialType: 'seeds', totalDebitQty: 50, totalCreditQty: 0, netQuantity: 50, totalDebitAmount: 6000, totalCreditAmount: 0, netAmount: 6000 },
      ]
    };
    return of({ success: true, message: '', data: summary, errors: [] }).pipe(delay(400));
  }
}
