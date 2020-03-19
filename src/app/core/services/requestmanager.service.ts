import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { url } from 'inspector';

const BaseURL = 'http://localhost:3000/api/';

export class ApiUrl {
    static base = BaseURL;
    static graficas = ApiUrl.base + 'graficas';
    static ventas = ApiUrl.base + 'ventas/';
    static corteActual = ApiUrl.ventas + 'corteactual';
    static nuevoCorte = ApiUrl.ventas + 'nuevocorte';
    static traspasarCorte = ApiUrl.ventas + 'traspasarcorte';
    static menu = ApiUrl.ventas + 'menu';
}

@Injectable()
export class RequestManagerService {
    constructor(private http: HttpClient, private router: Router, private auth: AuthenticationService) { }

    public makeRequest(to: string, method: 'post'|'get', body: object = null, token: boolean = true): Observable<any> {
        let base: Observable<object>;
        const options: object = token ? {
            headers: {
                Authorization: `Bearer ${this.auth.getToken()}`
            }
         } : null;
        if (method === 'post') {
            base = this.http.post(to, body, options);
        } else {
            base = this.http.get(to, options);
        }
        return base;
    }

}