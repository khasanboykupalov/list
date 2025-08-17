import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { envoriment } from "../envoriment/envoriment";

@Injectable({ providedIn: 'root' })
export class UserService {
  private usersApi = envoriment.usersApi;

  constructor(private http: HttpClient) {}

  getUsers<T>(page: number, pageSize: number, filters?: Record<string, any>): Observable<T> {
    let params = new HttpParams()
      .set("page", String(page))
      .set("page_size", String(pageSize));

    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        if (typeof v === 'string' && v.trim() === '') return;
        params = params.set(k, String(v));
      });
    }

    return this.http.get<T>(`${this.usersApi}/users`, { params });
  }
}
