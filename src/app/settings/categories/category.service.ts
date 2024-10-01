import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: string;
  name: string;
  type: 'Ingreso' | 'Gasto';
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000/api/categories';

  constructor(private http: HttpClient) {}

  create(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  findAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  findOne(categoryId: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${categoryId}`);
  }

  update(categoryId: string, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${categoryId}`, category);
  }

  delete(categoryId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${categoryId}`);
  }

  findByType(type: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/type/${type}`);
  }
}
