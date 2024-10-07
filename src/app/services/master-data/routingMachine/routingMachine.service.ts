import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoutingMachine } from 'src/app/models/RoutingMachine';
import { ApiResponse } from 'src/app/response/Response';
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  //Isi tokenya
  token: String =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJBdXJlbCIsImV4cCI6MTcyODMwODA4M30.y03EN8mmoDGrL7FzHc5W7QDPLuAoVmD21CNXz4OrBMyci5OSMFW8urH69vONuD8YW87911-NUE2BvkFrpFYWhA';

  constructor(private http: HttpClient) {}

  // Method untuk menambahkan header Authorization dengan token
  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
  }

  getCtAssyById(idCtAssy: number): Observable<ApiResponse<RoutingMachine>> {
    return this.http.get<ApiResponse<RoutingMachine>>(
      environment.apiUrlWebAdmin + '/getCtAssyById/' + idCtAssy,
      { headers: this.getHeaders() }
    );
  }

  getAllCtAssy(): Observable<ApiResponse<RoutingMachine[]>> {
    return this.http.get<ApiResponse<RoutingMachine[]>>(
      environment.apiUrlWebAdmin + '/getAllCtAssy',
      { headers: this.getHeaders() }
    );
  }

  //Method Update plant
  updateCtAssy(routingMachine: RoutingMachine): Observable<ApiResponse<RoutingMachine>> {
    return this.http
      .post<ApiResponse<RoutingMachine>>(
        environment.apiUrlWebAdmin + '/updateCtAssy',
        routingMachine,
        { headers: this.getHeaders() } // Menyertakan header
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  deleteCtAssy(CtAssy: RoutingMachine): Observable<ApiResponse<RoutingMachine>> {
    return this.http
      .post<ApiResponse<RoutingMachine>>(
        environment.apiUrlWebAdmin + '/deleteCtAssy',
        CtAssy,
        { headers: this.getHeaders() }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  uploadFileExcel(file: FormData): Observable<ApiResponse<RoutingMachine>> {
    return this.http
      .post<ApiResponse<RoutingMachine>>(
        environment.apiUrlWebAdmin + '/saveQuadrantExcel',
        file,
        { headers: this.getHeaders() }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError((err) => {
          return throwError(err);
        })
      );
  }
}
