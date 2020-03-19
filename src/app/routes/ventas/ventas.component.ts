import { Component, OnInit, AfterViewInit, Inject, ViewChild } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { RequestAuthService, DialogData } from '@core/services/requestauth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RequestManagerService, ApiUrl } from '@core/services/requestmanager.service';
import { Router } from '@angular/router';
import { MatTable, MatTab } from '@angular/material';

export interface DataFromCorte {
    corte?: object;
    status: 'IsOpen' | 'New' | 'Continue';
}

@Component({
    selector: 'dialog-request-number',
    template: `
    <h1 mat-dialog-title>Inicia el corte</h1>
    <div mat-dialog-content>
      <p>Cuanto dinero hay en el cajon?</p>
      <mat-form-field>
        <input matInput [(ngModel)]="this.dinero" />
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">No Thanks</button>
      <button mat-button [mat-dialog-close]="this.dinero" [disabled]="!this.validar()" >
        Ok
      </button>
    </div>
  `,
})
export class DialogRequestNumberComponent {
    dinero: any;
    constructor(
        public dialogRef: MatDialogRef<DialogRequestNumberComponent>) {}
      onNoClick(): void {
        this.dialogRef.close();
      }
      onOkClick(): void {

      }
    validar(): boolean {
        return this.dinero && !isNaN(this.dinero);
    }
}

@Component({
    selector: 'app-ventas',
    templateUrl: './ventas.component.html'
})

export class VentasComponent implements OnInit, AfterViewInit {


    @ViewChild('familia', {static: false}) familiaTable: MatTable<any>;
    @ViewChild('platillo', {static: false}) platilloTable: MatTable<any>;
    @ViewChild('ticket', {static: false}) ticketTable: MatTable<any>;

    familiasAvailable = [];
    platillosAvailable = [];
    ticketActual = [];

    columnsToDisplay = ['name'];
    constructor(private requestAuth: RequestAuthService, private request: RequestManagerService, private router: Router,
                private dialog: MatDialog) { }
    ngOnInit() {
    }
    procesarCorte(data: DataFromCorte) {
        switch (data.status) {
            case 'Continue':
                console.log(data.corte);
                this.loadMenu();
                break;
            case 'New':
                const dialogRef = this.dialog.open(DialogRequestNumberComponent, {
                    width: '250px',
                });
                dialogRef.afterClosed().subscribe(result => {
                    if (result) {
                        this.request.makeRequest(ApiUrl.nuevoCorte, 'post', {dinero_cajon: result}).subscribe((r) => this.procesarCorte(r));
                    } else {
                        this.router.navigate(['/bienvenida']);
                    }
                });
                break;
            case 'IsOpen':
                this.requestAuth.openDialog('Continuar un corte de otro usuario.', (res) => {
                    if (!res) { this.router.navigate(['/bienvenida']); } else {
                        this.request.makeRequest(ApiUrl.traspasarCorte, 'post', {tokenAuth: res}).subscribe((r) => this.procesarCorte(r)); }
                });
                break;
        }
    }
    loadMenu() {
        this.request.makeRequest(ApiUrl.menu, 'get').subscribe((r) => {
            if (r) {
                this.familiasAvailable = r;
                this.familiaTable.renderRows();
            }
        }, (err) => {
            if (err) {
                alert(err.message);
            }
        });
    }
    selectFamilia(row: { platillos: any[]; }) {
        this.platillosAvailable = row.platillos;
        this.platilloTable.renderRows();
    }
    selectPlatillo(row) {
        this.ticketActual.push(row);
        this.ticketTable.renderRows();
    }
    sendTicket() {
        this.ticketActual = [];
        this.ticketTable.renderRows();
        alert('Proceso de envio e impresión de ticket')
    }
    ngAfterViewInit() {
        this.request.makeRequest(ApiUrl.corteActual, 'get').subscribe((r) => this.procesarCorte(r));
     }
}
