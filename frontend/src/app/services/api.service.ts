import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import {
  ApiResponse, Customer, CreateCustomer, Transaction, CreateTransaction,
  RawMaterial, CreateRawMaterial, DashboardSummary
} from '../models/models';
import { MockApiService } from './mock-api.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';
  private http = inject(HttpClient);
  private mock = inject(MockApiService);

  private withFallback<T>(httpCall: Observable<T>, mockCall: Observable<T>): Observable<T> {
    return httpCall.pipe(catchError(() => mockCall));
  }

  getCustomers(): Observable<ApiResponse<Customer[]>> {
    return this.withFallback(this.http.get<ApiResponse<Customer[]>>(`${this.baseUrl}/customers`), this.mock.getCustomers());
  }
  getCustomer(id: number): Observable<ApiResponse<Customer>> {
    return this.withFallback(this.http.get<ApiResponse<Customer>>(`${this.baseUrl}/customers/${id}`), this.mock.getCustomer(id));
  }
  createCustomer(dto: CreateCustomer): Observable<ApiResponse<Customer>> {
    return this.withFallback(this.http.post<ApiResponse<Customer>>(`${this.baseUrl}/customers`, dto), this.mock.createCustomer(dto));
  }
  updateCustomer(id: number, dto: CreateCustomer): Observable<ApiResponse<Customer>> {
    return this.withFallback(this.http.put<ApiResponse<Customer>>(`${this.baseUrl}/customers/${id}`, dto), this.mock.updateCustomer(id, dto));
  }
  deleteCustomer(id: number): Observable<ApiResponse<boolean>> {
    return this.withFallback(this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/customers/${id}`), this.mock.deleteCustomer(id));
  }
  getCustomerTransactions(id: number): Observable<ApiResponse<Transaction[]>> {
    return this.withFallback(this.http.get<ApiResponse<Transaction[]>>(`${this.baseUrl}/customers/${id}/transactions`), this.mock.getCustomerTransactions(id));
  }
  getTransactions(from?: string, to?: string): Observable<ApiResponse<Transaction[]>> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.withFallback(this.http.get<ApiResponse<Transaction[]>>(`${this.baseUrl}/transactions`, { params }), this.mock.getTransactions());
  }
  createTransaction(dto: CreateTransaction): Observable<ApiResponse<Transaction>> {
    return this.withFallback(this.http.post<ApiResponse<Transaction>>(`${this.baseUrl}/transactions`, dto), this.mock.createTransaction(dto));
  }
  deleteTransaction(id: number): Observable<ApiResponse<boolean>> {
    return this.withFallback(this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/transactions/${id}`), this.mock.deleteTransaction(id));
  }
  getRawMaterials(customerId?: number): Observable<ApiResponse<RawMaterial[]>> {
    let params = new HttpParams();
    if (customerId) params = params.set('customerId', customerId.toString());
    return this.withFallback(this.http.get<ApiResponse<RawMaterial[]>>(`${this.baseUrl}/rawmaterials`, { params }), this.mock.getRawMaterials(customerId));
  }
  createRawMaterial(dto: CreateRawMaterial): Observable<ApiResponse<RawMaterial>> {
    return this.withFallback(this.http.post<ApiResponse<RawMaterial>>(`${this.baseUrl}/rawmaterials`, dto), this.mock.createRawMaterial(dto));
  }
  deleteRawMaterial(id: number): Observable<ApiResponse<boolean>> {
    return this.withFallback(this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/rawmaterials/${id}`), this.mock.deleteRawMaterial(id));
  }
  getDashboard(period: string): Observable<ApiResponse<DashboardSummary>> {
    return this.withFallback(this.http.get<ApiResponse<DashboardSummary>>(`${this.baseUrl}/dashboard/${period}`), this.mock.getDashboard(period));
  }
}
