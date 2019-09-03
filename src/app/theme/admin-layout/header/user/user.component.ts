import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ElectronService } from 'ngx-electron';
import { ElementSchemaRegistry } from '@angular/compiler';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
})
export class UserComponent implements OnInit, AfterViewInit {
  userName = '';
  constructor(private electron: ElectronService) {}

  ngOnInit() { }

  ngAfterViewInit() {
    this.electron.ipcRenderer.on('please-user-R', ( _ , value: any) => {
      this.userName = value.name;
    });
    this.electron.ipcRenderer.send('please-user');
  }
  cerrarsesion() {
    console.log('hola');
    this.electron.ipcRenderer.send('logout');
  }
}
