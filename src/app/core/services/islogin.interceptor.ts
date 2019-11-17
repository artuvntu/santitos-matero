import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class IsLoginInterceptor {
    constructor(private auth: AuthenticationService, private router: Router) { }
    resolve() {
        if (!this.auth.isLoggedIn()) { this.router.navigateByUrl('/auth/login'); }
    }
}
