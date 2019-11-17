import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuService } from '@core';
import { ElectronService } from 'ngx-electron';
import { AuthenticationService } from '@core/services/authentication.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Alert } from 'selenium-webdriver';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  reactiveForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private menuService: MenuService, private auth: AuthenticationService) {
    this.reactiveForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.auth.logout();
    }
  }

  login() {
    console.log(this.reactiveForm.value);
    this.auth.login(this.reactiveForm.value).subscribe(() => {
      this.menuService.setMenuBy(this.auth.getUserDetails().rol);
      this.router.navigateByUrl('/bienvenida');
    }, (e: HttpErrorResponse) => {
      alert(e.error.message);
    });
  }
}
