import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PersonalDetails {
    _id: string;
    username: string;
    name: string;
    rol: number;
    exp: number;
    iat: number;
}

interface TokenResponse {
    token: string;
}

export interface TokenPayload {
    username: string;
    password: string;
}
export interface TokenRegister {
    username: string;
    password: string;
    permisos: number;
    name: string;
}

@Injectable()
export class AuthenticationService {
    private token: string;

    constructor(private http: HttpClient) { }

    private saveToken(token: string) {
        localStorage.setItem('santitos-token', token);
        this.token = token;
    }

    getToken(): string {
        if (!this.token) { this.token = localStorage.getItem('santitos-token'); }
        return this.token;
    }

    public getUserDetails(): PersonalDetails {
        const token = this.getToken();
        let payload;
        if (token) {
            payload = token.split('.')[1];
            payload = window.atob(payload);
            return JSON.parse(payload);
        } else {
            return null;
        }
    }

    public isLoggedIn(): boolean {
        const user = this.getUserDetails();
        if (user) { return user.exp > Date.now() / 1000; } else { return false; }
    }

    private request(method: 'post'|'get', type: 'login'|'register'|'profile', user?: TokenPayload): Observable<any> {
        let base: Observable<object>;
        if (method === 'post') {
            base = this.http.post(`http://localhost:3000/api/${type}`, user);
        } else {
            base = this.http.get(`http://localhost:3000/api/${type}`, { headers: { Authorization: `Bearer ${this.getToken()}` } } );
        }
        return base;
    }

    /**
     * devuelve un token el cual no es registrado como usuario actual
     * @param user Usuer supervisor que autoriza
     */
    public requestAuth(user: TokenPayload): Observable<any> {
        return this.request('post', 'login', user);
    }

    /**
     * login
     */
    public login(user: TokenPayload): Observable<any> {
        const request = this.request('post', 'login', user).pipe(
            map((data: TokenResponse) => {
                if (data.token) { this.saveToken(data.token); }
                return data;
            })
        );
        return request;
    }
    /**
     * profile
     */
    public profile(): Observable<any> {
        return this.request('get', 'profile');
    }
    public logout() {
        this.token = '';
        window.localStorage.removeItem('santitos-token');
    }
}
