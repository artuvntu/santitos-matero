import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electron';
import { MenuService } from './menu.service';
import { AuthenticationService } from './authentication.service';


@Injectable()
export class StartupService {
  constructor(private menuService: MenuService, private auth: AuthenticationService) {}

  load(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.auth.isLoggedIn()) {
        this.menuService.setMenuBy(this.auth.getUserDetails().rol);
      }
      resolve(true);
    });
  }
}
