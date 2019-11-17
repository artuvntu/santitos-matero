import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { RequestAuthService } from '@core/services/requestauth.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-ventas',
    templateUrl: './ventas.component.html'
})

export class VentasComponent implements OnInit, AfterViewInit {
    constructor(private requestAuth: RequestAuthService) { }
    ngOnInit() { }
    ngAfterViewInit() {
        this.requestAuth.openDialog();
     }
}
