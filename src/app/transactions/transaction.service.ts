import { transition } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Transaction {
  id: string;
  type: 'Ingreso' | 'Gasto';
  amount: number;
  date: Date;
  categoryId: string;
  categoryName: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiUrl = 'http://localhost:3000/api/transactions';

  constructor(private http: HttpClient) {}

  create(transition: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transition);
  }

  findAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  findOne(transactionId: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${transactionId}`);
  }

  update(
    transactionId: string,
    transaction: Transaction
  ): Observable<Transaction> {
    return this.http.put<Transaction>(
      `${this.apiUrl}/${transactionId}`,
      transaction
    );
  }

  delete(transactionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${transactionId}`);
  }
}
