import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ElectronService } from 'ngx-electron';
import { ElementSchemaRegistry } from '@angular/compiler';
import { AuthenticationService } from '@core/services/authentication.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
})
export class UserComponent implements OnInit, AfterViewInit {
  userName = '';
  constructor(private auth: AuthenticationService, private router: Router) {}

  ngOnInit() { }

  ngAfterViewInit() {
    const user = this.auth.getUserDetails();
    this.userName = user.name;
  }
  cerrarsesion() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
