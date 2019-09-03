import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electron';
import { MenuService } from './menu.service';


@Injectable()
export class StartupService {
  constructor(private menuService: MenuService, private electron: ElectronService) {}

  load(): Promise<any> {
    return new Promise((resolve, reject) => {
      const menu = this.electron.ipcRenderer.sendSync('get-menu');
      this.menuService.set(menu);
      resolve();
    });
  }
}
