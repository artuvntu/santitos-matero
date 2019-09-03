import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
@Component({
  selector: 'app-user-panel',
  templateUrl: './user-panel.component.html',
})
export class UserPanelComponent implements OnInit, AfterViewInit {
  userName = ' ';
  tipoUser = ' ';
  constructor(private electron: ElectronService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.electron.ipcRenderer.on('please-user-R', ( _ , user: any) => {
      this.userName = user.name;
      switch (user.permisos) {
        case 0:
          this.tipoUser = 'Administrador';
          break;
        case 1:
          this.tipoUser = 'Supervisor';
          break;
        case 2:
          this.tipoUser = 'Cajero';
          break;
        default:
          this.tipoUser = 'Invitado';
          break;
      }
    });
    this.electron.ipcRenderer.send('please-user');
  }

}
