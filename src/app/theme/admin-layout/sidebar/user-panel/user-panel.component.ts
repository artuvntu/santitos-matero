import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { AuthenticationService } from '@core/services/authentication.service';
@Component({
  selector: 'app-user-panel',
  templateUrl: './user-panel.component.html',
})
export class UserPanelComponent implements OnInit, AfterViewInit {
  userName = ' ';
  tipoUser = ' ';
  constructor(private auth: AuthenticationService) {}

  ngOnInit() {
    const user = this.auth.getUserDetails();
    this.userName = user.name;
    switch (user.rol) {
      case 'admin':
        this.tipoUser = 'Administrador';
        break;
      case 'supervisor':
        this.tipoUser = 'Supervisor';
        break;
      case 'cajero':
        this.tipoUser = 'Cajero';
        break;
      default:
        this.tipoUser = 'Invitado';
        break;
    }
  }
  
  ngAfterViewInit() {
  }

}
