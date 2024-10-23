import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiResponse } from 'src/app/response/Response';
import { environment } from 'src/environments/environment';
import { MarketingOrder } from 'src/app/models/MarketingOrder';
import { HeaderMarketingOrder } from 'src/app/models/HeaderMarketingOrder';
import { DetailMarketingOrder } from 'src/app/models/DetailMarketingOrder';
import { WorkDay } from 'src/app/models/WorkDay';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MarketingOrderService {
  constructor(private http: HttpClient) { }

  getLastIdMo(): Observable<ApiResponse<string>> {
    return this.http.get<ApiResponse<string>>(environment.apiUrlWebAdmin + '/getLastIdMo');
  }

  getAllMarketingOrder(): Observable<ApiResponse<MarketingOrder[]>> {
    return this.http.get<ApiResponse<[]>>(environment.apiUrlWebAdmin + '/getAllMarketingOrderLatest');
  }

  //get (MO, Header, Detail)
  getAllMoById(idMo: String): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(environment.apiUrlWebAdmin + '/getAllMoById/' + idMo);
  }

  saveMarketingOrderPPC(mo: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(environment.apiUrlWebAdmin + '/saveMarketingOrderPPC', mo).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  saveMarketingOrderMarketing(dtmo: DetailMarketingOrder[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(environment.apiUrlWebAdmin + '/saveMarketingOrderMarketing', dtmo).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  updateMarketingOrderMarketing(mo: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(environment.apiUrlWebAdmin + '/revisiMarketingOrderMarketing', mo).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  enableMarketingOrder(mo: MarketingOrder): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(environment.apiUrlWebAdmin + '/enableMarketingOrder', mo).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  disableMarketingOrder(mo: MarketingOrder): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(environment.apiUrlWebAdmin + '/disableMarketingOrder', mo).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getWorkDay(month: any, year: any): Observable<ApiResponse<any>> {
    let params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<ApiResponse<any>>(environment.apiUrlWebAdmin + '/getMonthlyWorkData', { params });
  }

  downloadExcelMo(idMo: string) {
    return this.http.get(environment.apiUrlWebAdmin + '/exportMOExcel/' + idMo, { responseType: 'blob' });
  }

  getAllDetailRevision(month0: string, month1: string, month2: string, type: string): Observable<ApiResponse<MarketingOrder[]>> {
    let params = new HttpParams().set('month0', month0).set('month1', month1).set('month2', month2).set('type', type);
    return this.http.get<ApiResponse<[]>>(environment.apiUrlWebAdmin + '/getAllDetailRevisionMo', { params });
  }

  //Not used Alll
  saveMarketingOrder(mo: MarketingOrder): Observable<ApiResponse<MarketingOrder>> {
    return this.http.post<ApiResponse<MarketingOrder>>(environment.apiUrlWebAdmin + '/saveMarketingOrder', mo).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  saveHeaderMarketingOrder(hmo: HeaderMarketingOrder[]): Observable<ApiResponse<HeaderMarketingOrder>> {
    return this.http.post<ApiResponse<HeaderMarketingOrder>>(environment.apiUrlWebAdmin + '/saveHeaderMO', hmo).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getRowDetailMarketingOrder(totalHKTT1: number, totalHKTT2: number, totalHKTT3: number, totalHKTL1: number, totalHKTL2: number, totalHKTL3: number, productMerk: string): Observable<ApiResponse<DetailMarketingOrder[]>> {
    // Prepare query parameters
    let params = new HttpParams().set('totalHKTT1', totalHKTT1.toString()).set('totalHKTT2', totalHKTT2.toString()).set('totalHKTT3', totalHKTT3.toString()).set('totalHKTL1', totalHKTL1.toString()).set('totalHKTL2', totalHKTL2.toString()).set('totalHKTL3', totalHKTL3.toString()).set('productMerk', productMerk);
    return this.http.get<ApiResponse<DetailMarketingOrder[]>>(environment.apiUrlWebAdmin + '/getDetailMarketingOrders', { params: params });
  }

  saveDetailRowMarketingOrder(dmo: DetailMarketingOrder[]): Observable<ApiResponse<DetailMarketingOrder>> {
    return this.http.post<ApiResponse<DetailMarketingOrder>>(environment.apiUrlWebAdmin + '/saveDetailMO', dmo).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  getDetailMoMarketing(idMo: String): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(environment.apiUrlWebAdmin + '/getDetailMoMarketing/' + idMo);
  }

  // saveMarketingOrderMarketing(dtmo: DetailMarketingOrder[]) {
  //   return this.http.post<ApiResponse<any>>(environment.apiUrlWebAdmin + '/saveMarketingOrderMarketing', dtmo).pipe(
  //     map((response) => {
  //       return response;
  //     }),
  //     catchError((err) => {
  //       return throwError(err);
  //     })
  //   );
  // }
}
