import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Component({
    selector: 'app-ventas',
    templateUrl: './ventas.component.html'
})

export class VentasComponent implements OnInit, AfterViewInit {
    constructor(private electron: ElectronService) { }
    ngOnInit() { }
    ngAfterViewInit() { }
}
