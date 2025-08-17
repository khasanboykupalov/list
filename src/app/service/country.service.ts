import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { envoriment } from '../envoriment/envoriment';

@Injectable({ providedIn: 'root' })
export class CountryService {
  private http = inject(HttpClient);
  private api = envoriment.usersApi;

  getCountryCodes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.api}/users/countries`).pipe(
      catchError(() => of([]))
    );
  }
}
